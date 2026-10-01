import mongoose from 'mongoose';
import WeeklyGoal from '../model/WeeklyGoal.js';
import MockInterview from '../model/MockInterview.js';
import EvaluationScore from '../model/EvaluationScore.js';
import RecruiterFeedback from '../model/RecruiterFeedback.js';
import StudentProfile from '../model/StudentProfile.js';

const round2 = (num) => Math.round(num * 100) / 100;

/**
 * Centrally calculates a student's placement readiness score and updates StudentProfile.
 * Formula: readinessScore = (goalScore * 0.30) + (interviewScore * 0.40) + (feedbackScore * 0.30)
 *
 * @param {string|mongoose.Types.ObjectId} studentId
 * @returns {Promise<Object>} Calculated scores and breakdown
 */
export const calculateStudentReadiness = async (studentId) => {
  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error('Valid student ID is required for readiness calculation');
  }

  const sId = new mongoose.Types.ObjectId(studentId);

  // Run 3 data queries concurrently
  const [goals, interviewData, feedbackData] = await Promise.all([
    // 1. Weekly Goals
    WeeklyGoal.find({ studentId: sId }),

    // 2. Completed Mock Interviews with evaluated scores
    MockInterview.aggregate([
      {
        $match: {
          studentId: sId,
          status: 'completed',
        },
      },
      {
        $lookup: {
          from: 'Evaluation_Scores',
          localField: '_id',
          foreignField: 'interviewId',
          as: 'evaluation',
        },
      },
      { $unwind: { path: '$evaluation', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          avgEval: {
            $cond: {
              if: { $ifNull: ['$evaluation', false] },
              then: {
                $avg: [
                  '$evaluation.technicalScore',
                  '$evaluation.communicationScore',
                  '$evaluation.confidenceScore',
                ],
              },
              else: 0,
            },
          },
        },
      },
    ]),

    // 3. Recruiter Feedback (count and average rating)
    RecruiterFeedback.aggregate([
      { $match: { studentId: sId } },
      {
        $group: {
          _id: '$studentId',
          count: { $sum: 1 },
          avgRating: { $avg: { $ifNull: ['$rating', 8] } },
        },
      },
    ]),
  ]);

  // 1. Goal Score (0-100)
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === 'completed').length;
  const goalScore = totalGoals > 0 ? round2((completedGoals / totalGoals) * 100) : 0;

  // 2. Interview Score (0-100)
  const completedInterviews = interviewData.length;
  let avgInterviewScore = 0;
  let interviewScore = 0;
  if (completedInterviews > 0) {
    const totalAvgEval = interviewData.reduce((sum, i) => sum + (i.avgEval || 0), 0);
    avgInterviewScore = round2(totalAvgEval / completedInterviews);
    interviewScore = round2(avgInterviewScore * 10); // scale 0-10 to 0-100
  }

  // 3. Feedback Score (0-100)
  // Combines feedback volume (up to 5 entries) weighted by recruiter rating
  const feedbackDoc = feedbackData[0] || { count: 0, avgRating: 0 };
  const feedbackCount = feedbackDoc.count;
  const avgRating = feedbackDoc.avgRating || 0; // scale 1-10
  // Scaled: 20 points per feedback up to 5, normalized by rating ratio (rating / 10)
  const baseCountScore = Math.min(feedbackCount * 20, 100);
  const ratingMultiplier = feedbackCount > 0 ? Math.min(Math.max(avgRating / 10, 0.5), 1.0) : 1.0;
  const feedbackScore = round2(baseCountScore * ratingMultiplier);

  // 4. Weighted Total Readiness Score (0-100)
  const readinessScore = round2(
    (goalScore * 0.30) + (interviewScore * 0.40) + (feedbackScore * 0.30)
  );

  // Target placement tier classification
  const targetTier =
    readinessScore >= 80 ? 'Tier 1' : readinessScore >= 60 ? 'Tier 2' : 'General';

  // Persist directly into StudentProfile
  await StudentProfile.findOneAndUpdate(
    { studentId: sId },
    { readinessScore },
    { upsert: false }
  );

  return {
    studentId,
    readinessScore,
    targetTier,
    breakdown: {
      goalScore,
      interviewScore,
      feedbackScore,
    },
    details: {
      totalGoals,
      completedGoals,
      completedInterviews,
      avgInterviewScore,
      recruiterFeedbackCount: feedbackCount,
      avgRecruiterRating: round2(avgRating),
    },
  };
};

export default {
  calculateStudentReadiness,
};
