import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { saveEvaluationScore } from '../controllers/evaluationController.js';

const router = express.Router();

// POST /api/skills/evaluation — Faculty submits mock interview skill evaluation
router.post(
  '/evaluation',
  protect,
  authorize('faculty', 'admin'),
  saveEvaluationScore
);

export default router;
