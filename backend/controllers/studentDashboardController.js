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

    // Fetch upcoming or active mock interview (within active session window)
    const activeThreshold = new Date(Date.now() - 60 * 60 * 1000);
    const candidateAppointments = await MockInterview.find({
      $or: [{ studentId: sId }, { interviewerId: sId }],
      status: { $in: ['scheduled', 'confirmed', 'pending'] },
      dateTime: { $gte: activeThreshold },
    })
      .populate('interviewerId', 'name email role')
      .sort({ dateTime: 1 });

    // Prioritize scheduled sessions, else pending review
    const nextAppointment =
      candidateAppointments.find((a) => a.status === 'scheduled' || a.status === 'confirmed') ||
      candidateAppointments.find((a) => a.status === 'pending') ||
      null;

    let canJoin = false;
    let opensAt = null;
    if (nextAppointment && nextAppointment.status === 'scheduled') {
      const now = new Date();
      const startTime = new Date(nextAppointment.dateTime);
      const EARLY_BUFFER_MS = 5 * 60 * 1000;
      const durationMs = (nextAppointment.duration || 45) * 60 * 1000;
      opensAt = new Date(startTime.getTime() - EARLY_BUFFER_MS);
      const endTime = new Date(startTime.getTime() + durationMs + 15 * 60 * 1000);
      if (now.getTime() >= opensAt.getTime() && now.getTime() <= endTime.getTime()) {
        canJoin = true;
      }
    }

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
            duration: nextAppointment.duration || 45,
            meetLink: canJoin ? (nextAppointment.meetLink || '') : '',
            rawMeetLinkAvailable: Boolean(nextAppointment.meetLink),
            calendarHtmlLink: canJoin ? (nextAppointment.calendarHtmlLink || '') : '',
            status: nextAppointment.status,
            canJoin,
            opensAt,
            meetingType: nextAppointment.meetLink?.includes('meet.google.com')
              ? 'google_meet'
              : nextAppointment.meetLink?.includes('jit.si')
              ? 'instant_webrtc'
              : nextAppointment.meetLink
              ? 'custom_video'
              : 'none',
            meetingProvider: nextAppointment.meetLink?.includes('meet.google.com')
              ? 'Google Meet'
              : nextAppointment.meetLink?.includes('jit.si')
              ? 'Instant WebRTC Room'
              : nextAppointment.meetLink
              ? 'Custom Video Room'
              : 'None',
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
