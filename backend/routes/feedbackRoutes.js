import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { addRecruiterFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

// POST /api/feedback — Recruiter/Placement Cell submits student review feedback
router.post(
  '/',
  protect,
  authorize('recruiter', 'placement cell', 'placement', 'admin'),
  addRecruiterFeedback
);

export default router;
