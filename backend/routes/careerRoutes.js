import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  submitCareerQuiz,
  getRoadmapById,
  getCareerTracks,
} from '../controllers/careerController.js';

const router = express.Router();

// GET /api/career/tracks — Retrieve all available career tracks
router.get('/tracks', protect, getCareerTracks);

// POST /api/career/quiz — Submit career quiz and get suggested career
router.post('/quiz', protect, submitCareerQuiz);

// GET /api/career/roadmap/:careerId — Retrieve career roadmap and semester steps
router.get('/roadmap/:careerId', protect, getRoadmapById);

export default router;
