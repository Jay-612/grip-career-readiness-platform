import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getStudentDashboard } from '../controllers/studentDashboardController.js';

const router = express.Router();

// GET /api/student/dashboard — Consolidated dashboard telemetry for student
router.get('/dashboard', protect, authorize('student', 'admin'), getStudentDashboard);

export default router;
