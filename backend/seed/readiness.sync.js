import mongoose from 'mongoose';
import StudentProfile from '../model/StudentProfile.js';
import WeeklyGoal from '../model/WeeklyGoal.js';
import MockInterview from '../model/MockInterview.js';
import EvaluationScore from '../model/EvaluationScore.js';
import RecruiterFeedback from '../model/RecruiterFeedback.js';

const round2 = (num) => Math.round(num * 100) / 100;

/**
 * Calculates and synchronizes exact placement readiness scores for all seeded students
 * following the institutional formula:
 * readinessScore = (goalScore * 0.30) + (interviewScore * 0.40) + (feedbackScore * 0.30)
 * 
 * @param {Array} students Array of student User documents
 */
export async function syncReadinessScores(students) {
  console.log('📊 Synchronizing Placement Readiness Scores for Students...');

  for (const student of students) {
    const studentId = student._id;

    // 1. Goal data
    const goals = await WeeklyGoal.find({ studentId });
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const goalScore = totalGoals > 0 ? round2((completedGoals / totalGoals) * 100) : 0;

    // 2. Interview data — aggregate completed mock interviews with evaluation scores
    const completedInterviews = await MockInterview.find({
      studentId,
      status: 'completed',
    });

    let interviewScore = 0;
    if (completedInterviews.length > 0) {
      let totalEval = 0;
      let evaluatedCount = 0;

      for (const interview of completedInterviews) {
        const score = await EvaluationScore.findOne({ interviewId: interview._id });
        if (score) {
          const avg = (score.technicalScore + score.communicationScore + score.confidenceScore) / 3;
          totalEval += avg;
          evaluatedCount++;
        }
      }

      if (evaluatedCount > 0) {
        const avgInterviewScore = round2(totalEval / evaluatedCount);
        interviewScore = round2(avgInterviewScore * 10); // scale 0-10 -> 0-100
      }
    }

    // 3. Recruiter feedback count
    const feedbackCount = await RecruiterFeedback.countDocuments({ studentId });
    const feedbackScore = Math.min(feedbackCount * 20, 100);

    // 4. Final weighted score
    const readinessScore = round2(
      goalScore * 0.30 + interviewScore * 0.40 + feedbackScore * 0.30
    );

    // Update StudentProfile
    await StudentProfile.findOneAndUpdate(
      { studentId },
      { readinessScore },
      { upsert: false }
    );

    console.log(
      `   ✓ ${student.name.padEnd(16)}: ${String(readinessScore).padStart(5)}% ` +
        `[Goals: ${completedGoals}/${totalGoals} (${goalScore}%), Interviews: ${interviewScore}%, Feedback: ${feedbackCount} (${feedbackScore}%)]`
    );
  }
}
