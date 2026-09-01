import mongoose from 'mongoose';
import User from '../model/User.js';
import StudentProfile from '../model/StudentProfile.js';
import WeeklyGoal from '../model/WeeklyGoal.js';
import MockInterview from '../model/MockInterview.js';
import EvaluationScore from '../model/EvaluationScore.js';
import ActionPlan from '../model/ActionPlan.js';
import GuidanceRequest from '../model/GuidanceRequest.js';
import GuidanceReply from '../model/GuidanceReply.js';

// ─── Helper: Round to 2 decimal places ────────────────────────────
const round2 = (num) => Math.round(num * 100) / 100;

// ─── Helper: Validate studentId and check access ──────────────────
const validateStudentAccess = async (req, res, studentId) => {
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid Student ID format',
    });
    return null;
  }

  // RBAC: Students can only view their own progress
  if (
    req.user.role === 'student' &&
    req.user.id.toString() !== studentId.toString()
  ) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Students can only view their own progress.',
    });
    return null;
  }

  const student = await User.findById(studentId).select('-password');
  if (!student) {
    res.status(404).json({
      success: false,
      message: 'Student not found',
    });
    return null;
  }
  if (student.role !== 'student') {
    res.status(400).json({
      success: false,
      message: 'The specified user is not a student',
    });
    return null;
  }

  return student;
};

// ─── 2.1 Get Progress Dashboard ──────────────────────────────────
// GET /api/progress/dashboard/:studentId
export const getProgressDashboard = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await validateStudentAccess(req, res, studentId);
    if (!student) return; // Response already sent

    // Run 5 parallel queries
    const [profile, goals, interviewAgg, actionPlans, guidanceData] =
      await Promise.all([
        // 1. Student profile
        StudentProfile.findOne({ studentId }),

        // 2. Weekly goals
        WeeklyGoal.find({ studentId }),

        // 3. Interviews with evaluation scores
        MockInterview.aggregate([
          { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
          {
            $lookup: {
              from: 'Evaluation_Scores',
              localField: '_id',
              foreignField: 'interviewId',
              as: 'evaluation',
            },
          },
          {
            $unwind: { path: '$evaluation', preserveNullAndEmptyArrays: true },
          },
        ]),

        // 4. Action plans
        ActionPlan.find({ studentId }),

        // 5. Guidance requests + replies count
        (async () => {
          const requests = await GuidanceRequest.find({ studentId });
          const requestIds = requests.map((r) => r._id);
          const repliesCount =
            requestIds.length > 0
              ? await GuidanceReply.countDocuments({
                  requestId: { $in: requestIds },
                })
              : 0;
          return { totalRequests: requests.length, repliesReceived: repliesCount };
        })(),
      ]);

    // ── Compute goal stats ──
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const inProgressGoals = goals.filter(
      (g) => g.status === 'in-progress'
    ).length;
    const pendingGoals = goals.filter((g) => g.status === 'pending').length;
    const goalCompletionRate =
      totalGoals > 0 ? round2((completedGoals / totalGoals) * 100) : 0;

    // ── Compute interview stats ──
    const totalInterviews = interviewAgg.length;
    const completedInterviews = interviewAgg.filter(
      (i) => i.status === 'completed'
    ).length;
    const scheduledInterviews = interviewAgg.filter(
      (i) => i.status === 'scheduled'
    ).length;
    const cancelledInterviews = interviewAgg.filter(
      (i) => i.status === 'cancelled'
    ).length;

    // Average scores from completed interviews with evaluations
    const scoredInterviews = interviewAgg.filter(
      (i) => i.status === 'completed' && i.evaluation
    );

    let avgTechnical = 0,
      avgCommunication = 0,
      avgConfidence = 0,
      avgOverall = 0;
    if (scoredInterviews.length > 0) {
      const totalTech = scoredInterviews.reduce(
        (s, i) => s + i.evaluation.technicalScore,
        0
      );
      const totalComm = scoredInterviews.reduce(
        (s, i) => s + i.evaluation.communicationScore,
        0
      );
      const totalConf = scoredInterviews.reduce(
        (s, i) => s + i.evaluation.confidenceScore,
        0
      );
      avgTechnical = round2(totalTech / scoredInterviews.length);
      avgCommunication = round2(totalComm / scoredInterviews.length);
      avgConfidence = round2(totalConf / scoredInterviews.length);
      avgOverall = round2((avgTechnical + avgCommunication + avgConfidence) / 3);
    }

    res.status(200).json({
      success: true,
      studentId: student._id,
      studentName: student.name,
      profile: {
        semester: profile?.semester || null,
        selectedCareer: profile?.selectedCareer || '',
        readinessScore: profile?.readinessScore || 0,
      },
      goals: {
        total: totalGoals,
        completed: completedGoals,
        inProgress: inProgressGoals,
        pending: pendingGoals,
        completionRate: goalCompletionRate,
      },
      interviews: {
        total: totalInterviews,
        completed: completedInterviews,
        scheduled: scheduledInterviews,
        cancelled: cancelledInterviews,
        averageScores: {
          technical: avgTechnical,
          communication: avgCommunication,
          confidence: avgConfidence,
          overall: avgOverall,
        },
      },
      actionPlans: {
        total: actionPlans.length,
        items: actionPlans.map((ap) => ({
          weakSkill: ap.weakSkill,
          recommendedTask: ap.recommendedTask,
        })),
      },
      guidanceRequests: {
        total: guidanceData.totalRequests,
        repliesReceived: guidanceData.repliesReceived,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching progress dashboard',
      error: error.message,
    });
  }
};

// ─── 2.2 Get Goals Analysis ──────────────────────────────────────
// GET /api/progress/goals/:studentId
export const getGoalsAnalysis = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await validateStudentAccess(req, res, studentId);
    if (!student) return;

    // Optional status filter
    const filter = { studentId };
    if (req.query.status) {
      const validStatuses = ['pending', 'in-progress', 'completed'];
      if (!validStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Must be one of: ${validStatuses.join(', ')}`,
        });
      }
      filter.status = req.query.status;
    }

    // Get all goals (unfiltered) for summary, and filtered goals for list
    const [allGoals, filteredGoals] = await Promise.all([
      WeeklyGoal.find({ studentId }).sort({ dueDate: -1 }),
      WeeklyGoal.find(filter).sort({ dueDate: -1 }),
    ]);

    const total = allGoals.length;
    const completed = allGoals.filter((g) => g.status === 'completed').length;
    const inProgress = allGoals.filter((g) => g.status === 'in-progress').length;
    const pending = allGoals.filter((g) => g.status === 'pending').length;
    const completionRate = total > 0 ? round2((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      studentId: student._id,
      summary: {
        total,
        completed,
        inProgress,
        pending,
        completionRate,
      },
      goals: filteredGoals.map((g) => ({
        id: g._id,
        title: g.title,
        status: g.status,
        dueDate: g.dueDate,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching goals analysis',
      error: error.message,
    });
  }
};

// ─── 2.3 Get Interview Analysis ──────────────────────────────────
// GET /api/progress/interviews/:studentId
export const getInterviewAnalysis = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await validateStudentAccess(req, res, studentId);
    if (!student) return;

    // Aggregation: MockInterviews → EvaluationScores + Users (interviewer)
    const interviews = await MockInterview.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: 'Evaluation_Scores',
          localField: '_id',
          foreignField: 'interviewId',
          as: 'evaluation',
        },
      },
      {
        $unwind: { path: '$evaluation', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'Users',
          localField: 'interviewerId',
          foreignField: '_id',
          as: 'interviewer',
        },
      },
      {
        $unwind: { path: '$interviewer', preserveNullAndEmptyArrays: true },
      },
      { $sort: { dateTime: -1 } },
      {
        $project: {
          interviewId: '$_id',
          interviewerName: { $ifNull: ['$interviewer.name', 'Unknown'] },
          dateTime: 1,
          meetLink: 1,
          status: 1,
          scores: {
            technical: { $ifNull: ['$evaluation.technicalScore', null] },
            communication: {
              $ifNull: ['$evaluation.communicationScore', null],
            },
            confidence: { $ifNull: ['$evaluation.confidenceScore', null] },
            average: {
              $cond: {
                if: { $ifNull: ['$evaluation', false] },
                then: {
                  $round: [
                    {
                      $avg: [
                        '$evaluation.technicalScore',
                        '$evaluation.communicationScore',
                        '$evaluation.confidenceScore',
                      ],
                    },
                    2,
                  ],
                },
                else: null,
              },
            },
          },
        },
      },
    ]);

    // Compute summary
    const total = interviews.length;
    const completed = interviews.filter((i) => i.status === 'completed').length;
    const scheduled = interviews.filter((i) => i.status === 'scheduled').length;
    const cancelled = interviews.filter((i) => i.status === 'cancelled').length;

    const scored = interviews.filter(
      (i) => i.status === 'completed' && i.scores.technical !== null
    );

    let avgTechnical = 0,
      avgCommunication = 0,
      avgConfidence = 0,
      avgOverall = 0;
    if (scored.length > 0) {
      avgTechnical = round2(
        scored.reduce((s, i) => s + i.scores.technical, 0) / scored.length
      );
      avgCommunication = round2(
        scored.reduce((s, i) => s + i.scores.communication, 0) / scored.length
      );
      avgConfidence = round2(
        scored.reduce((s, i) => s + i.scores.confidence, 0) / scored.length
      );
      avgOverall = round2(
        (avgTechnical + avgCommunication + avgConfidence) / 3
      );
    }

    res.status(200).json({
      success: true,
      studentId: student._id,
      summary: {
        total,
        completed,
        scheduled,
        cancelled,
        averageScores: {
          technical: avgTechnical,
          communication: avgCommunication,
          confidence: avgConfidence,
          overall: avgOverall,
        },
      },
      interviews: interviews.map((i) => ({
        interviewId: i.interviewId,
        interviewerName: i.interviewerName,
        dateTime: i.dateTime,
        meetLink: i.meetLink,
        status: i.status,
        scores: i.scores,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching interview analysis',
      error: error.message,
    });
  }
};
