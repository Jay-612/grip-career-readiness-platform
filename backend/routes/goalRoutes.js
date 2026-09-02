import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  saveWeeklyGoals,
  updateGoalStatus,
} from '../controllers/goalController.js';

const router = express.Router();

// POST /api/goals — Save weekly goals for student
router.post('/', protect, saveWeeklyGoals);

// PUT /api/goals/:goalId — Update goal status (e.g. Done/Pending/completed)
router.put('/:goalId', protect, updateGoalStatus);

export default router;
