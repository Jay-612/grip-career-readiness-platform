import mongoose from 'mongoose';
import User from '../model/User.js';
import StudentProfile from '../model/StudentProfile.js';
import WeeklyGoal from '../model/WeeklyGoal.js';
import MockInterview from '../model/MockInterview.js';
import { calculateStudentReadiness } from '../services/readinessService.js';

// ─── GET /api/student/dashboard — Consolidated Student Telemetry ───
export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?.userId;

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid student ID is required',
      });
    }

    const sId = new mongoose.Types.ObjectId(studentId);

    // Fetch user and profile in parallel
    const [user, profile] = await Promise.all([
      User.findById(sId).select('name email role'),
      StudentProfile.findOne({ studentId: sId }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student account not found',
      });
    }

    // Calculate profile completion percentage
    let completionScore = 0;
    if (user.name) completionScore += 25;
    if (user.email) completionScore += 25;
    if (profile?.semester) completionScore += 25;
    if (profile?.selectedCareer && profile.selectedCareer.trim().length > 0) {
      completionScore += 25;
    }

    // Calculate readiness telemetry
    const readinessData = await calculateStudentReadiness(studentId);
    const myScore = readinessData.readinessScore || profile?.readinessScore || 0;

    // Fast indexed counts for rank
    const [higherScoreCount, totalStudents] = await Promise.all([
      StudentProfile.countDocuments({ readinessScore: { $gt: myScore } }),
      StudentProfile.countDocuments(),
    ]);

    const myRank = higherScoreCount + 1;
    const total = Math.max(totalStudents, 1);
    const percentilePct = Math.max(1, Math.round((myRank / total) * 100));

    // Fetch recent weekly goals
    const weeklyGoalDoc = await WeeklyGoal.findOne({ userId: sId });
    const goalsList = weeklyGoalDoc?.goals || [];
    const activeGoalsCount = goalsList.filter((g) => !g.isCompleted).length;
    const completedGoalsCount = goalsList.filter((g) => g.isCompleted).length;

    // Fetch next upcoming mock interview
    const nextAppointment = await MockInterview.findOne({
      $or: [{ studentId: sId }, { interviewerId: sId }],
      status: { $in: ['scheduled', 'confirmed'] },
      dateTime: { $gte: new Date() },
    })
      .populate('interviewerId', 'name email role')
      .sort({ dateTime: 1 });

    const targetTier =
      myScore >= 80 ? 'Tier 1' : myScore >= 60 ? 'Tier 2' : 'General';

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      student: {
        id: user._id,
        name: user.name,
        email: user.email,
        semester: profile?.semester || 1,
        selectedCareer: profile?.selectedCareer || '',
        careerHistory: profile?.careerHistory || [],
        profileCompletion: completionScore,
      },
      readiness: {
        score: myScore,
        tier: targetTier,
        categoryBreakdown: readinessData.categoryBreakdown,
        readinessStatus: readinessData.readinessStatus,
      },
      placement: {
        rank: myRank,
        totalStudents: total,
        percentile: `Top ${percentilePct}%`,
        tier: targetTier,
      },
      goals: {
        total: goalsList.length,
        active: activeGoalsCount,
        completed: completedGoalsCount,
        dueDate: weeklyGoalDoc?.dueDate || null,
        items: goalsList,
      },
      nextAppointment: nextAppointment
        ? {
            id: nextAppointment._id,
            dateTime: nextAppointment.dateTime,
            meetLink: nextAppointment.meetLink || '',
            status: nextAppointment.status,
            interviewer: nextAppointment.interviewerId
              ? {
                  id: nextAppointment.interviewerId._id,
                  name: nextAppointment.interviewerId.name,
                  email: nextAppointment.interviewerId.email,
                  role: nextAppointment.interviewerId.role,
                }
              : null,
          }
        : null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while generating student dashboard telemetry',
      error: error.message,
    });
  }
};
