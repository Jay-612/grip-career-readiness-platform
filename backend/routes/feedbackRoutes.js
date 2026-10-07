import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { addRecruiterFeedback, getRecruiterFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

// GET /api/feedback — Recruiter, Admin, Placement Cell, or Student retrieves feedback history
router.get(
  '/',
  protect,
  authorize('student', 'recruiter', 'admin', 'placement cell', 'placement'),
  getRecruiterFeedback
);

// POST /api/feedback — Recruiter or Admin submits student review feedback
router.post(
  '/',
  protect,
  authorize('recruiter', 'admin', 'placement cell', 'placement'),
  addRecruiterFeedback
);

export default router;
