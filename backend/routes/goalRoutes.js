import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  saveWeeklyGoals,
  updateGoalStatus,
} from '../controllers/goalController.js';

const router = express.Router();

// POST /api/goals — Save weekly goals for student (Students can save for self, admin for any)
router.post('/', protect, authorize('student', 'admin'), saveWeeklyGoals);

// PUT /api/goals/:goalId — Update goal status (Students own goals or Admin)
router.put('/:goalId', protect, authorize('student', 'admin'), updateGoalStatus);

export default router;
