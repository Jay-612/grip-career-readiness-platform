import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from '../controllers/departmentEventController.js';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';

// Optional auth helper: if bearer token is present, populate req.user
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = { id: user._id, role: user.role, name: user.name, email: user.email };
      }
    }
  } catch (_) {
    // Ignore invalid/expired token for public read
  }
  next();
};

const router = express.Router();

// POST /api/events - Schedule Improvement Event
router.post('/', optionalAuth, createEvent);

// GET /api/events - Get all events (with optional filtering)
router.get('/', optionalAuth, getAllEvents);

// GET /api/events/:id - Get event by ID
router.get('/:id', getEventById);

// PUT /api/events/:id - Update event details
router.put('/:id', updateEvent);

// DELETE /api/events/:id - Delete an event
router.delete('/:id', deleteEvent);

export default router;
