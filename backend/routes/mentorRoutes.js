import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMentorRecommendations } from '../controllers/guidanceController.js';

const router = express.Router();

// GET /api/mentors/recommendation — Query faculty and alumni mentors
router.get('/recommendation', protect, getMentorRecommendations);

export default router;
