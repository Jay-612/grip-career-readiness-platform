import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getAllAlumni,
  getAlumniById,
  createOrUpdateAlumniProfile,
} from '../controllers/alumniController.js';
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} from '../controllers/alumniPostController.js';

const router = express.Router();

// GET /api/alumni — List alumni with filters (Student, Faculty, Admin)
router.get('/', protect, authorize('student', 'faculty', 'admin'), getAllAlumni);

// POST /api/alumni/profile — Create/Update alumni profile (Alumni only)
router.post('/profile', protect, authorize('alumni'), createOrUpdateAlumniProfile);

// ─── Experience Posts ─────────────────────────────────────────────
// POST   /api/alumni/posts       — Create a new post (Alumni only)
router.post('/posts', protect, authorize('alumni'), createPost);

// GET    /api/alumni/posts       — List all posts (any authenticated user)
router.get('/posts', protect, getAllPosts);

// GET    /api/alumni/posts/:id   — Get single post
router.get('/posts/:id', protect, getPostById);

// PUT    /api/alumni/posts/:id   — Update own post (Alumni only)
router.put('/posts/:id', protect, authorize('alumni'), updatePost);

// DELETE /api/alumni/posts/:id   — Delete own post (Alumni or Admin)
router.delete('/posts/:id', protect, authorize('alumni', 'admin'), deletePost);

// GET /api/alumni/:id — Get alumni profile by ID
router.get('/:id', protect, authorize('student', 'faculty', 'admin'), getAlumniById);

export default router;
