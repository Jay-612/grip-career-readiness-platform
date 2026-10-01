import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { addRecruiterFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

// POST /api/feedback — Recruiter or Admin submits student review feedback
router.post(
  '/',
  protect,
  authorize('recruiter', 'admin'),
  addRecruiterFeedback
);

export default router;
