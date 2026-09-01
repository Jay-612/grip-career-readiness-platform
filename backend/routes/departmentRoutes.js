import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getDepartmentAnalytics,
  getSkillGaps,
  getPlacementStats,
} from '../controllers/departmentController.js';

const router = express.Router();

// GET /api/department/analytics — Department-wide analytics dashboard
// Access: Faculty (HOD), Admin — HOD check is done inside the controller
router.get(
  '/analytics',
  protect,
  authorize('faculty', 'admin'),
  getDepartmentAnalytics
);

// GET /api/department/skill-gaps — Top skill gaps from action plans
// Access: Faculty (HOD), Admin — HOD check is done inside the controller
router.get(
  '/skill-gaps',
  protect,
  authorize('faculty', 'admin'),
  getSkillGaps
);

// GET /api/department/placement-stats — Placement statistics & score distribution
// Access: Faculty (HOD), Admin — HOD check is done inside the controller
router.get(
  '/placement-stats',
  protect,
  authorize('faculty', 'admin'),
  getPlacementStats
);

export default router;
