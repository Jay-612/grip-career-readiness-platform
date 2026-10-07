import Company from '../model/Company.js';

// ─── Add or update a company ──────────────────────────────────
export const addCompany = async (req, res) => {
  try {
    const {
      companyName,
      oldCompanyName,
      description,
      industry,
      location,
      website,
      targetRole,
      openPositions,
      cgpaCutoff,
      eligibleDepartments,
      eligibleBatch,
      requiredSkills,
      preferredSkills,
      minimumMatchScore,
      isVerified,
    } = req.body;

    // Validate required field
    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const cleanName = companyName.trim();
    const lookupName = oldCompanyName && oldCompanyName.trim() ? oldCompanyName.trim() : cleanName;

    // Check if company already exists by current name or old name
    let company = await Company.findOne({
      companyName: { $regex: new RegExp(`^${lookupName}$`, 'i') },
    });

    const updateFields = {
      companyName: cleanName,
    };

    if (description !== undefined) updateFields.description = description;
    if (industry !== undefined) updateFields.industry = industry;
    if (location !== undefined) updateFields.location = location;
    if (website !== undefined) updateFields.website = website;
    if (targetRole !== undefined) updateFields.targetRole = targetRole;
    if (openPositions !== undefined) updateFields.openPositions = Number(openPositions) || 0;
    if (cgpaCutoff !== undefined) updateFields.cgpaCutoff = cgpaCutoff;
    if (eligibleDepartments !== undefined) updateFields.eligibleDepartments = eligibleDepartments;
    if (eligibleBatch !== undefined) updateFields.eligibleBatch = eligibleBatch;
    if (requiredSkills !== undefined) updateFields.requiredSkills = requiredSkills;
    if (preferredSkills !== undefined) updateFields.preferredSkills = preferredSkills;
    if (minimumMatchScore !== undefined) updateFields.minimumMatchScore = Number(minimumMatchScore) || 0;
    if (isVerified !== undefined) updateFields.isVerified = Boolean(isVerified);

    if (company) {
      Object.assign(company, updateFields);
      await company.save();

      return res.status(200).json({
        success: true,
        message: 'Company criteria updated successfully',
        company,
      });
    }

    // Create new company
    company = await Company.create({
      companyName: cleanName,
      ...updateFields,
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
