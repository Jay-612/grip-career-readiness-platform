import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getAllAlumni,
  getAlumniById,
  createOrUpdateAlumniProfile,
} from '../controllers/alumniController.js';

const router = express.Router();

// GET /api/alumni — List alumni with filters (Student, Faculty, Admin)
router.get('/', protect, authorize('student', 'faculty', 'admin'), getAllAlumni);

// POST /api/alumni/profile — Create/Update alumni profile (Alumni only)
router.post('/profile', protect, authorize('alumni'), createOrUpdateAlumniProfile);

// GET /api/alumni/:id — Get alumni profile by ID
router.get('/:id', protect, authorize('student', 'faculty', 'admin'), getAlumniById);

export default router;
