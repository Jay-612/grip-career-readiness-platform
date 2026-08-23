import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/departmentEventController.js';

const router = express.Router();

// POST /api/events - Schedule Improvement Event
router.post('/', createEvent);

// GET /api/events - Get all events (with optional filtering)
router.get('/', getAllEvents);

// GET /api/events/:id - Get event by ID
router.get('/:id', getEventById);

// PUT /api/events/:id - Update event details
router.put('/:id', updateEvent);

// DELETE /api/events/:id - Delete an event
router.delete('/:id', deleteEvent);

export default router;
