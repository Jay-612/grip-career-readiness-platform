import mongoose from 'mongoose';
import User from '../model/User.js';
import StudentProfile from '../model/StudentProfile.js';
import WeeklyGoal from '../model/WeeklyGoal.js';
import MockInterview from '../model/MockInterview.js';
import EvaluationScore from '../model/EvaluationScore.js';
import ActionPlan from '../model/ActionPlan.js';
import DepartmentEvent from '../model/DepartmentEvent.js';
import GuidanceRequest from '../model/GuidanceRequest.js';
import GuidanceReply from '../model/GuidanceReply.js';
import FacultyProfile from '../model/FacultyProfile.js';

// ─── Helper: Round to 2 decimal places ────────────────────────────
const round2 = (num) => Math.round(num * 100) / 100;

// ─── Helper: Verify HOD Access ────────────────────────────────────
// Admin passes through; faculty must have isHOD: true
const verifyHODAccess = async (req, res) => {
  if (req.user.role === 'admin') return true;

  if (req.user.role === 'faculty') {
    const facultyProfile = await FacultyProfile.findOne({
      facultyId: req.user.id,
    });
    if (facultyProfile && facultyProfile.isHOD) return true;

    res.status(403).json({
      success: false,
      message:
        'Access denied. Only faculty members with HOD status can access department analytics.',
    });
    return false;
  }

  res.status(403).json({
    success: false,
    message: 'Access denied. Only HOD faculty and admins can access this resource.',
  });
  return false;
};

// ─── 3.1 Get Department Analytics ────────────────────────────────
// GET /api/department/analytics
export const getDepartmentAnalytics = async (req, res) => {
  try {
    const hasAccess = await verifyHODAccess(req, res);
    if (!hasAccess) return;

    // Run 5 parallel aggregation queries
    const [
      studentStats,
      goalStats,
      interviewStats,
      eventStats,
      guidanceStats,
    ] = await Promise.all([
      // 1. Student statistics
      (async () => {
        const students = await StudentProfile.find();
        const totalStudents = students.length;
        const totalScore = students.reduce(
          (sum, s) => sum + (s.readinessScore || 0),
          0
        );
        const averageReadinessScore =
          totalStudents > 0 ? round2(totalScore / totalStudents) : 0;
        return { totalStudents, averageReadinessScore };
      })(),

      // 2. Goal analytics — aggregate across all students
      (async () => {
        const [result] = await WeeklyGoal.aggregate([
          {
            $group: {
              _id: null,
              totalGoals: { $sum: 1 },
              completedGoals: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
                },
              },
            },
          },
        ]);
        const totalGoals = result?.totalGoals || 0;
        const completedGoals = result?.completedGoals || 0;
        const completionRate =
          totalGoals > 0 ? round2((completedGoals / totalGoals) * 100) : 0;
        return { totalGoals, completedGoals, completionRate };
      })(),

      // 3. Interview analytics
      (async () => {
        const interviews = await MockInterview.aggregate([
          {
            $group: {
              _id: null,
              totalInterviews: { $sum: 1 },
              completedInterviews: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
                },
              },
            },
          },
        ]);

        const totalInterviews = interviews[0]?.totalInterviews || 0;
        const completedInterviews = interviews[0]?.completedInterviews || 0;

        // Average evaluation scores across all evaluations
        const [evalResult] = await EvaluationScore.aggregate([
          {
            $group: {
              _id: null,
              avgTechnical: { $avg: '$technicalScore' },
              avgCommunication: { $avg: '$communicationScore' },
              avgConfidence: { $avg: '$confidenceScore' },
            },
          },
        ]);

        const avgTechnical = round2(evalResult?.avgTechnical || 0);
        const avgCommunication = round2(evalResult?.avgCommunication || 0);
        const avgConfidence = round2(evalResult?.avgConfidence || 0);
        const avgOverall = round2(
          (avgTechnical + avgCommunication + avgConfidence) / 3
        );

        return {
          totalInterviews,
          completedInterviews,
          averageScores: {
            technical: avgTechnical,
            communication: avgCommunication,
            confidence: avgConfidence,
            overall: avgOverall,
          },
        };
      })(),

      // 4. Event analytics
      (async () => {
        const totalEvents = await DepartmentEvent.countDocuments();
        const upcomingEvents = await DepartmentEvent.countDocuments({
          date: { $gte: new Date() },
        });
        return { totalEvents, upcomingEvents };
      })(),

      // 5. Guidance analytics
      (async () => {
        const totalRequests = await GuidanceRequest.countDocuments();
        const totalReplies = await GuidanceReply.countDocuments();

        // Response rate: requests that have at least 1 reply
        const requestsWithReplies = await GuidanceReply.aggregate([
          { $group: { _id: '$requestId' } },
          { $count: 'answeredRequests' },
        ]);
        const answeredRequests =
          requestsWithReplies[0]?.answeredRequests || 0;
        const responseRate =
          totalRequests > 0
            ? round2((answeredRequests / totalRequests) * 100)
            : 0;

        return { totalRequests, totalReplies, responseRate };
      })(),
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        students: studentStats,
        goals: goalStats,
        interviews: interviewStats,
        events: eventStats,
        guidance: guidanceStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department analytics',
      error: error.message,
    });
  }
};

// ─── 3.2 Get Skill Gaps ─────────────────────────────────────────
// GET /api/department/skill-gaps
export const getSkillGaps = async (req, res) => {
  try {
    const hasAccess = await verifyHODAccess(req, res);
    if (!hasAccess) return;

    // Count distinct students that have action plans
    const totalStudentsWithActionPlans = await ActionPlan.distinct('studentId');

    // Aggregate weakSkills grouped and sorted
    const skillGaps = await ActionPlan.aggregate([
      {
        $group: {
          _id: '$weakSkill',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          skill: '$_id',
          count: 1,
        },
      },
    ]);

    // Calculate percentage based on total action plan entries
    const totalEntries = await ActionPlan.countDocuments();
    const skillGapsWithPercentage = skillGaps.map((gap) => ({
      ...gap,
      percentage: totalEntries > 0 ? round2((gap.count / totalEntries) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      skillGaps: skillGapsWithPercentage,
      totalStudentsWithActionPlans: totalStudentsWithActionPlans.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching skill gaps',
      error: error.message,
    });
  }
};

// ─── 3.3 Get Placement Stats ────────────────────────────────────
// GET /api/department/placement-stats
export const getPlacementStats = async (req, res) => {
  try {
    const hasAccess = await verifyHODAccess(req, res);
    if (!hasAccess) return;

    // Get all student profiles
    const profiles = await StudentProfile.find();
    const totalStudents = profiles.length;

    const studentsWithCareer = profiles.filter(
      (p) => p.selectedCareer && p.selectedCareer.trim() !== ''
    ).length;

    const scores = profiles.map((p) => p.readinessScore || 0);
    const totalScore = scores.reduce((sum, s) => sum + s, 0);
    const averageReadinessScore =
      totalStudents > 0 ? round2(totalScore / totalStudents) : 0;

    // Score distribution buckets
    const excellent = scores.filter((s) => s >= 80 && s <= 100).length;
    const good = scores.filter((s) => s >= 60 && s < 80).length;
    const average = scores.filter((s) => s >= 40 && s < 60).length;
    const needsImprovement = scores.filter((s) => s >= 0 && s < 40).length;

    const pct = (count) =>
      totalStudents > 0 ? round2((count / totalStudents) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        studentsWithCareer,
        averageReadinessScore,
        scoreDistribution: {
          excellent: {
            range: '80-100',
            count: excellent,
            percentage: pct(excellent),
          },
          good: {
            range: '60-79',
            count: good,
            percentage: pct(good),
          },
          average: {
            range: '40-59',
            count: average,
            percentage: pct(average),
          },
          needsImprovement: {
            range: '0-39',
            count: needsImprovement,
            percentage: pct(needsImprovement),
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching placement stats',
      error: error.message,
    });
  }
};

// ─── 3.4 Get Career Distribution ────────────────────────────────
// GET /api/department/career-distribution
export const getCareerDistribution = async (req, res) => {
  try {
    const hasAccess = await verifyHODAccess(req, res);
    if (!hasAccess) return;

    const totalStudents = await StudentProfile.countDocuments();

    // Aggregate students grouped by selectedCareer
    const distribution = await StudentProfile.aggregate([
      {
        $match: {
          selectedCareer: { $exists: true, $ne: '' },
        },
      },
      {
        $group: {
          _id: '$selectedCareer',
          count: { $sum: 1 },
          avgReadinessScore: { $avg: '$readinessScore' },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          career: '$_id',
          count: 1,
          avgReadinessScore: { $round: ['$avgReadinessScore', 2] },
          percentage: {
            $round: [
              {
                $multiply: [{ $divide: ['$count', totalStudents || 1] }, 100],
              },
              2,
            ],
          },
        },
      },
    ]);

    const studentsWithCareer = distribution.reduce((sum, d) => sum + d.count, 0);
    const studentsWithoutCareer = totalStudents - studentsWithCareer;

    res.status(200).json({
      success: true,
      totalStudents,
      studentsWithCareer,
      studentsWithoutCareer,
      distribution,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching career distribution',
      error: error.message,
    });
  }
};

