import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  saveWeeklyGoals,
  updateGoalStatus,
  editGoal,
  deleteGoal,
} from '../controllers/goalController.js';

const router = express.Router();

// POST /api/goals — Save weekly goals for student (Students can save for self, admin for any)
router.post('/', protect, authorize('student', 'admin'), saveWeeklyGoals);

// PUT /api/goals/:goalId — Update goal status (Students own goals or Admin)
router.put('/:goalId', protect, authorize('student', 'admin'), updateGoalStatus);

// PUT /api/goals/:goalId/edit — Edit goal details (Title & Due Date)
router.put('/:goalId/edit', protect, authorize('student', 'admin'), editGoal);

// DELETE /api/goals/:goalId — Delete a weekly goal
router.delete('/:goalId', protect, authorize('student', 'admin'), deleteGoal);

export default router;
