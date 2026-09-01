import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getPlacementReadiness,
  getCompanyMatch,
  getLeaderboard,
} from '../controllers/placementController.js';

const router = express.Router();

// GET /api/placement/readiness/:studentId — Placement readiness score
// Access: Student (own), Faculty, Admin
router.get(
  '/readiness/:studentId',
  protect,
  authorize('student', 'faculty', 'admin'),
  getPlacementReadiness
);

// GET /api/placement/company-match/:studentId — Company skill matching
// Access: Student (own), Faculty, Recruiter, Admin
router.get(
  '/company-match/:studentId',
  protect,
  authorize('student', 'faculty', 'recruiter', 'admin'),
  getCompanyMatch
);

// GET /api/placement/leaderboard — Student readiness leaderboard
// Access: Faculty, Admin
router.get(
  '/leaderboard',
  protect,
  authorize('faculty', 'admin'),
  getLeaderboard
);

export default router;
