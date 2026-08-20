import Company from '../model/Company.js';

// ─── Add a new company ────────────────────────────────────────
export const addCompany = async (req, res) => {
  try {
    const { companyName, requiredSkills, minimumMatchScore } = req.body;

    // Validate required field
    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    // Check if company already exists
    const existingCompany = await Company.findOne({ companyName });
    if (existingCompany) {
      return res.status(400).json({ success: false, message: 'Company already exists' });
    }

    // Create company
    const company = await Company.create({
      companyName,
      requiredSkills: requiredSkills || [],
      minimumMatchScore: minimumMatchScore || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Company added successfully',
      company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
