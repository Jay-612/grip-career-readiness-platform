import mongoose from 'mongoose';
import RecruiterFeedback from '../model/RecruiterFeedback.js';
import User from '../model/User.js';

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

    const { studentId, comments } = req.body;
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

    // Verify student exists
    const studentUser = await User.findById(studentId);
    if (!studentUser) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    await RecruiterFeedback.create({
      studentId,
      recruiterId,
      comments: (comments || '').trim(),
    });

    return res.status(201).json({
      message: 'Recruiter feedback saved successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while saving recruiter feedback',
      error: error.message,
    });
  }
};
