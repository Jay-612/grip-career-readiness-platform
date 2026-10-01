import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  scheduleMockInterview,
  getAppointments,
  cancelAppointment,
} from '../controllers/interviewController.js';

const router = express.Router();

// POST /api/appointments — Book/schedule a mock interview appointment
router.post('/', protect, scheduleMockInterview);

// GET /api/appointments — List appointment history for logged-in user
router.get('/', protect, getAppointments);

// PATCH /api/appointments/:id/cancel — Cancel an appointment
router.patch('/:id/cancel', protect, cancelAppointment);

export default router;
