import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getProgressDashboard,
  getGoalsAnalysis,
  getInterviewAnalysis,
} from '../controllers/progressController.js';

const router = express.Router();

// GET /api/progress/dashboard/:studentId — Comprehensive progress dashboard
// Access: Student (own), Faculty, Admin
router.get(
  '/dashboard/:studentId',
  protect,
  authorize('student', 'faculty', 'admin'),
  getProgressDashboard
);

// GET /api/progress/goals/:studentId — Weekly goals analysis
// Access: Student (own), Faculty, Admin
router.get(
  '/goals/:studentId',
  protect,
  authorize('student', 'faculty', 'admin'),
  getGoalsAnalysis
);

// GET /api/progress/interviews/:studentId — Interview performance analysis
// Access: Student (own), Faculty, Admin
router.get(
  '/interviews/:studentId',
  protect,
  authorize('student', 'faculty', 'admin'),
  getInterviewAnalysis
);

export default router;
