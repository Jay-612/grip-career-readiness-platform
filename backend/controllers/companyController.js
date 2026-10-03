import Company from '../model/Company.js';

// ─── Add or update a company ──────────────────────────────────
export const addCompany = async (req, res) => {
  try {
    const { companyName, requiredSkills, minimumMatchScore } = req.body;

    // Validate required field
    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    // Check if company already exists - if so, update its criteria
    let company = await Company.findOne({ companyName: { $regex: new RegExp(`^${companyName.trim()}$`, 'i') } });
    if (company) {
      if (requiredSkills) company.requiredSkills = requiredSkills;
      if (minimumMatchScore !== undefined) company.minimumMatchScore = minimumMatchScore;
      await company.save();

      return res.status(200).json({
        success: true,
        message: 'Company criteria updated successfully',
        company,
      });
    }

    // Create company
    company = await Company.create({
      companyName: companyName.trim(),
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

// ─── Get company by name or all companies ──────────────────────
export const getCompany = async (req, res) => {
  try {
    const { name } = req.query;
    if (name) {
      const company = await Company.findOne({
        companyName: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      });
      return res.status(200).json({ success: true, company });
    }

    const companies = await Company.find().sort({ companyName: 1 });
    res.status(200).json({ success: true, companies });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

