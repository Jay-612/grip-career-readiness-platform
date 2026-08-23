import express from 'express';
import { addCompany } from '../controllers/companyController.js';

const router = express.Router();

// Define the POST route
router.post('/', addCompany);

export default router;