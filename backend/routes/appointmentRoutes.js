import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  scheduleMockInterview,
  getAppointments,
  cancelAppointment,
  createOrRefreshMeetLink,
  acceptAppointment,
  rejectAppointment,
  joinAppointment,
} from '../controllers/interviewController.js';

const router = express.Router();

// POST /api/appointments — Book/request a mock interview appointment (Status: pending)
router.post('/', protect, scheduleMockInterview);

// GET /api/appointments — List appointment history for logged-in user
router.get('/', protect, getAppointments);

// POST /api/appointments/:id/create-meet — Generate or refresh Google Meet room
router.post('/:id/create-meet', protect, createOrRefreshMeetLink);

// PATCH /api/appointments/:id/accept — Faculty accepts appointment & generates Google Meet
router.patch('/:id/accept', protect, acceptAppointment);

// PATCH /api/appointments/:id/reject — Faculty declines appointment
router.patch('/:id/reject', protect, rejectAppointment);

// GET /api/appointments/:id/join — Student/Faculty join verification gate
router.get('/:id/join', protect, joinAppointment);

// PATCH /api/appointments/:id/cancel — Cancel an appointment
router.patch('/:id/cancel', protect, cancelAppointment);

export default router;
