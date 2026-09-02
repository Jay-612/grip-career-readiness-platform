import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createGuidanceRequest,
  getGuidanceRequests,
  getGuidanceRequestById,
  replyGuidanceRequest,
  updateGuidanceReply,
} from '../controllers/guidanceController.js';

const router = express.Router();

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

// POST /api/guidance/:id/reply & POST /api/guidance/requests/:id/reply — Mentor replies to a request
router.post(
  '/:id/reply',
  protect,
  authorize('faculty', 'alumni', 'admin'),
  replyGuidanceRequest
);

router.post(
  '/requests/:id/reply',
  protect,
  authorize('faculty', 'alumni', 'admin'),
  replyGuidanceRequest
);

// PUT /api/guidance/reply/:id — Update a reply (author or Admin)
router.put(
  '/reply/:id',
  protect,
  authorize('faculty', 'alumni', 'admin'),
  updateGuidanceReply
);

export default router;
