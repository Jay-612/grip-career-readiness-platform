import express from 'express';
import { addCompany, getCompany } from '../controllers/companyController.js';

const router = express.Router();

// GET /api/companies — Get company by name or all companies
router.get('/', getCompany);

// POST /api/companies — Register or update company criteria
router.post('/', addCompany);

export default router;