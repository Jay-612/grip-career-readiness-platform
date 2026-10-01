import mongoose from 'mongoose';
import RecruiterFeedback from '../model/RecruiterFeedback.js';
import User from '../model/User.js';
import { calculateStudentReadiness } from '../services/readinessService.js';

// ─── POST /api/feedback — Add Recruiter Feedback ──────────────────
export const addRecruiterFeedback = async (req, res) => {
  try {
    const userRole = (req.user?.role || '').toLowerCase();

    if (
      userRole !== 'recruiter' &&
      userRole !== 'placement cell' &&
      userRole !== 'placement' &&
      userRole !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Recruiters or Placement Cell can submit student feedback.',
      });
    }

    const { studentId, comments, rating } = req.body;
    const recruiterId = req.user?.id || req.user?.userId;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    const trimmedComments = (comments || '').trim();
    if (!trimmedComments || trimmedComments.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Meaningful feedback comments (at least 5 characters) are required.',
      });
    }

    // Verify student exists and role is student
    const studentUser = await User.findById(studentId);
    if (!studentUser) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    if (studentUser.role !== 'student') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be provided for registered students.',
      });
    }

    let parsedRating = 8;
    if (rating !== undefined && rating !== null) {
      const numRating = Number(rating);
      if (!isNaN(numRating) && numRating >= 1 && numRating <= 10) {
        parsedRating = numRating;
      }
    }

    const feedbackDoc = await RecruiterFeedback.create({
      studentId,
      recruiterId,
      comments: trimmedComments,
      rating: parsedRating,
    });

    // Trigger instant readiness recalculation
    calculateStudentReadiness(studentId).catch((err) =>
      console.error('Async readiness update failed after recruiter feedback:', err.message)
    );

    return res.status(201).json({
      success: true,
      message: 'Recruiter feedback saved successfully',
      feedback: feedbackDoc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while saving recruiter feedback',
      error: error.message,
    });
  }
};
