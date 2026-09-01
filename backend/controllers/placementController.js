import mongoose from 'mongoose';
import User from '../model/User.js';
import StudentProfile from '../model/StudentProfile.js';
import WeeklyGoal from '../model/WeeklyGoal.js';
import MockInterview from '../model/MockInterview.js';
import EvaluationScore from '../model/EvaluationScore.js';
import RecruiterFeedback from '../model/RecruiterFeedback.js';
import CareerRoadmap from '../model/CareerRoadmap.js';
import Company from '../model/Company.js';

// ─── Helper: Round to 2 decimal places ────────────────────────────
const round2 = (num) => Math.round(num * 100) / 100;

// ─── 1.1 Get Placement Readiness Score ────────────────────────────
// GET /api/placement/readiness/:studentId
// Formula: readinessScore = (goalScore × 0.30) + (interviewScore × 0.40) + (feedbackScore × 0.30)
export const getPlacementReadiness = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Student ID format',
      });
    }

    // RBAC: Students can only view their own readiness
    if (
      req.user.role === 'student' &&
      req.user.id.toString() !== studentId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Students can only view their own readiness score.',
      });
    }

    // Verify student exists and has student role
    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }
    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'The specified user is not a student',
      });
    }

    // ── Run 3 parallel data queries ──
    const [goals, interviewData, feedbackCount] = await Promise.all([
      // 1. Goal data
      WeeklyGoal.find({ studentId }),

      // 2. Interview data — aggregate MockInterviews + EvaluationScores
      MockInterview.aggregate([
        {
          $match: {
            studentId: new mongoose.Types.ObjectId(studentId),
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

      // 3. Recruiter feedback count
      RecruiterFeedback.countDocuments({ studentId }),
    ]);

    // ── Calculate goalScore ──
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const goalScore = totalGoals > 0
      ? round2((completedGoals / totalGoals) * 100)
      : 0;

    // ── Calculate interviewScore ──
    const completedInterviews = interviewData.length;
    let avgInterviewScore = 0;
    let interviewScore = 0;
    if (completedInterviews > 0) {
      const totalAvgEval = interviewData.reduce((sum, i) => sum + i.avgEval, 0);
      avgInterviewScore = round2(totalAvgEval / completedInterviews);
      interviewScore = round2(avgInterviewScore * 10); // scale 0–10 → 0–100
    }

    // ── Calculate feedbackScore ──
    const feedbackScore = Math.min(feedbackCount * 20, 100);

    // ── Final weighted score ──
    const readinessScore = round2(
      (goalScore * 0.30) + (interviewScore * 0.40) + (feedbackScore * 0.30)
    );

    // Update the student's readinessScore in their profile
    await StudentProfile.findOneAndUpdate(
      { studentId },
      { readinessScore },
      { upsert: false }
    );

    res.status(200).json({
      success: true,
      studentId: student._id,
      studentName: student.name,
      readinessScore,
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
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while calculating placement readiness',
      error: error.message,
    });
  }
};

// ─── 1.2 Get Company Match ────────────────────────────────────────
// GET /api/placement/company-match/:studentId
export const getCompanyMatch = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Student ID format',
      });
    }

    // RBAC: Students can only view their own matches
    if (
      req.user.role === 'student' &&
      req.user.id.toString() !== studentId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Students can only view their own company matches.',
      });
    }

    // Get student + profile
    const student = await User.findById(studentId).select('-password');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }
    if (student.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'The specified user is not a student',
      });
    }

    const profile = await StudentProfile.findOne({ studentId });
    if (!profile || !profile.selectedCareer) {
      return res.status(400).json({
        success: false,
        message: 'Student has not selected a career path yet',
      });
    }

    // Get career roadmap to find the student's skills
    const roadmap = await CareerRoadmap.findOne({
      careerName: { $regex: new RegExp(`^${profile.selectedCareer}$`, 'i') },
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: `Career roadmap not found for: ${profile.selectedCareer}`,
      });
    }

    const studentSkills = roadmap.requiredSkills.map((s) => s.toLowerCase());

    // Get all companies and compute matches
    const companies = await Company.find();

    const matches = companies.map((company) => {
      const companySkillsLower = company.requiredSkills.map((s) => s.toLowerCase());

      const matchedSkills = company.requiredSkills.filter((skill) =>
        studentSkills.includes(skill.toLowerCase())
      );

      const matchPercentage = companySkillsLower.length > 0
        ? round2((matchedSkills.length / companySkillsLower.length) * 100)
        : 0;

      const isEligible = matchPercentage >= company.minimumMatchScore;

      return {
        companyId: company._id,
        companyName: company.companyName,
        requiredSkills: company.requiredSkills,
        matchedSkills,
        matchPercentage,
        minimumMatchScore: company.minimumMatchScore,
        isEligible,
      };
    });

    // Sort by matchPercentage descending
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({
      success: true,
      studentId: student._id,
      studentName: student.name,
      selectedCareer: profile.selectedCareer,
      studentSkills: roadmap.requiredSkills,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while computing company matches',
      error: error.message,
    });
  }
};

// ─── 1.3 Get Placement Leaderboard ───────────────────────────────
// GET /api/placement/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Aggregation pipeline: Users → Student_Profiles, sorted by readinessScore
    const pipeline = [
      { $match: { role: 'student' } },
      {
        $lookup: {
          from: 'Student_Profiles',
          localField: '_id',
          foreignField: 'studentId',
          as: 'profile',
        },
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: false } },
      { $sort: { 'profile.readinessScore': -1 } },
      {
        $facet: {
          metadata: [{ $count: 'totalItems' }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 0,
                studentId: '$_id',
                studentName: '$name',
                email: '$email',
                semester: '$profile.semester',
                selectedCareer: '$profile.selectedCareer',
                readinessScore: '$profile.readinessScore',
              },
            },
          ],
        },
      },
    ];

    const [result] = await User.aggregate(pipeline);

    const totalItems = result.metadata[0]?.totalItems || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // Add rank numbers
    const leaderboard = result.data.map((entry, index) => ({
      rank: skip + index + 1,
      ...entry,
    }));

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      page,
      totalPages,
      totalItems,
      leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard',
      error: error.message,
    });
  }
};
