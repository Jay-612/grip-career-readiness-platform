import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getActionPlanPreview,
  getStudentActionPlans,
  getMyActionPlans,
  getInterviewActionPlan,
  generateActionPlanManually,
  updateActionPlanStatus,
} from '../controllers/actionPlanController.js';

const router = express.Router();

// POST /api/action-plans/preview — Real-time preview for faculty evaluation
router.post('/preview', protect, getActionPlanPreview);

// GET /api/action-plans/my-plans — Current logged-in student's action plans
router.get('/my-plans', protect, authorize('student', 'admin'), getMyActionPlans);

// GET /api/action-plans/student/:studentId — Student's action plans & remedial goals
router.get('/student/:studentId', protect, getStudentActionPlans);

// GET /api/action-plans/interview/:interviewId — Action plan for specific interview
router.get('/interview/:interviewId', protect, getInterviewActionPlan);

// POST /api/action-plans/generate — Faculty/Admin manual action plan dispatch
router.post('/generate', protect, authorize('faculty', 'admin'), generateActionPlanManually);

// PATCH /api/action-plans/:id/status — Update action plan status
router.patch('/:id/status', protect, updateActionPlanStatus);

export default router;
