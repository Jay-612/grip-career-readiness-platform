import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getAdminOverview,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getRoadmaps,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getEvents,
  createEvent,
  deleteEvent,
  getSystemAnalytics,
} from '../controllers/adminController.js';

const router = express.Router();

// Enforce authentication & admin authorization on all routes
router.use(protect);
router.use(authorize('admin'));

// 1. Executive Telemetry Overview
router.get('/overview', getAdminOverview);

// 2. User & RBAC Management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// 3. Career Roadmaps & Curriculum Master Data (SRS R.2)
router.get('/roadmaps', getRoadmaps);
router.post('/roadmaps', createRoadmap);
router.put('/roadmaps/:id', updateRoadmap);
router.delete('/roadmaps/:id', deleteRoadmap);

// 4. Hiring Partner Companies (SRS R.5)
router.get('/companies', getCompanies);
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);
router.delete('/companies/:id', deleteCompany);

// 5. Department Skill-Improvement Events (SRS R.6.3)
router.get('/events', getEvents);
router.post('/events', createEvent);
router.delete('/events/:id', deleteEvent);

// 6. Institutional Analytics (SRS R.6.1 & R.6.2)
router.get('/analytics', getSystemAnalytics);

export default router;
