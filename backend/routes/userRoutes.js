import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getProfile,
  updateProfile,
  getUserById,
  getAllUsers,
} from '../controllers/userController.js';

const router = express.Router();

// GET /api/users/profile — Get authenticated user's profile
router.get('/profile', protect, getProfile);

// PUT /api/users/profile — Update authenticated user's profile
router.put('/profile', protect, updateProfile);

// GET /api/users — List all users (Admin only)
router.get('/', protect, authorize('admin'), getAllUsers);

// GET /api/users/:id — Get user by ID (public info)
router.get('/:id', protect, getUserById);

export default router;
