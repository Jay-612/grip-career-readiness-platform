import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createGuidanceRequest,
  getGuidanceRequests,
  getGuidanceRequestById,
  replyGuidanceRequest,
  updateGuidanceReply,
  resolveGuidanceRequest,
  getFacultyMentors,
  getAlumniMentors,
} from '../controllers/guidanceController.js';

const router = express.Router();

// GET /api/guidance/mentors/faculty — Dynamic Faculty list
router.get(
  '/mentors/faculty',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  getFacultyMentors
);

// GET /api/guidance/mentors/alumni — Dynamic Alumni list
router.get(
  '/mentors/alumni',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  getAlumniMentors
);

// POST /api/guidance/request — Student creates a guidance request
router.post('/request', protect, authorize('student'), createGuidanceRequest);

// GET /api/guidance/requests — List guidance requests (role-based filtering)
router.get(
  '/requests',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  getGuidanceRequests
);

// GET /api/guidance/requests/:id — Get request with replies
router.get(
  '/requests/:id',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  getGuidanceRequestById
);

// POST /api/guidance/:id/reply & POST /api/guidance/requests/:id/reply — Mentor or Student replies to a request
router.post(
  '/:id/reply',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  replyGuidanceRequest
);

router.post(
  '/:id/replies',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  replyGuidanceRequest
);

router.post(
  '/requests/:id/reply',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  replyGuidanceRequest
);

router.post(
  '/requests/:id/replies',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  replyGuidanceRequest
);

router.post(
  '/reply/:id',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  replyGuidanceRequest
);

// PUT /api/guidance/reply/:id — Update a reply (author or Admin)
router.put(
  '/reply/:id',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  updateGuidanceReply
);

router.put(
  '/replies/:id',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  updateGuidanceReply
);

// PUT/PATCH /api/guidance/:id/resolve & /api/guidance/requests/:id/resolve — Mark resolved
router.put(
  '/:id/resolve',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  resolveGuidanceRequest
);

router.patch(
  '/:id/resolve',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  resolveGuidanceRequest
);

router.put(
  '/requests/:id/resolve',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  resolveGuidanceRequest
);

router.patch(
  '/requests/:id/resolve',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  resolveGuidanceRequest
);

// GET /api/guidance/:id — Get request with replies (single ID alias)
router.get(
  '/:id',
  protect,
  authorize('student', 'faculty', 'alumni', 'admin'),
  getGuidanceRequestById
);

export default router;
