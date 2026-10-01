import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getPlacementReadiness,
  getCompanyMatch,
  getLeaderboard,
  getMyRank,
} from '../controllers/placementController.js';

const router = express.Router();

// GET /api/placement/my-rank — Lightweight personal rank & percentile
// Access: Student (own)
router.get(
  '/my-rank',
  protect,
  authorize('student'),
  getMyRank
);

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
// Access: Faculty, Admin, Student
router.get(
  '/leaderboard',
  protect,
  authorize('faculty', 'admin', 'student'),
  getLeaderboard
);

export default router;
