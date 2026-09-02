import mongoose from 'mongoose';
import User from '../model/User.js';
import AlumniProfile from '../model/AlumniProfile.js';

// ─── Get All Alumni with Filters ──────────────────────────────────
export const getAllAlumni = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { graduationYear, currentCompany, jobRole } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};

    if (graduationYear) {
      const year = parseInt(graduationYear);
      if (isNaN(year)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid graduationYear format',
        });
      }
      filter.graduationYear = year;
    }

    if (currentCompany) {
      filter.currentCompany = { $regex: currentCompany, $options: 'i' };
    }

    if (jobRole) {
      filter.jobRole = { $regex: jobRole, $options: 'i' };
    }

    const [alumniProfiles, totalItems] = await Promise.all([
      AlumniProfile.find(filter)
        .populate('alumniId', 'name email')
        .sort({ graduationYear: -1 })
        .skip(skip)
        .limit(limit),
      AlumniProfile.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      count: alumniProfiles.length,
      page,
      totalPages,
      totalItems,
      alumni: alumniProfiles.map((profile) => ({
        id: profile._id,
        alumniId: profile.alumniId._id,
        name: profile.alumniId.name,
        email: profile.alumniId.email,
        graduationYear: profile.graduationYear,
        currentCompany: profile.currentCompany,
        jobRole: profile.jobRole,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching alumni',
      error: error.message,
    });
  }
};

// ─── Get Alumni by ID ─────────────────────────────────────────────
export const getAlumniById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Alumni ID format',
      });
    }

    const alumniProfile = await AlumniProfile.findById(id).populate(
      'alumniId',
      'name email'
    );

    if (!alumniProfile) {
      return res.status(404).json({
        success: false,
        message: 'Alumni profile not found',
      });
    }

    res.status(200).json({
      success: true,
      alumni: {
        id: alumniProfile._id,
        alumniId: alumniProfile.alumniId._id,
        name: alumniProfile.alumniId.name,
        email: alumniProfile.alumniId.email,
        graduationYear: alumniProfile.graduationYear,
        currentCompany: alumniProfile.currentCompany,
        jobRole: alumniProfile.jobRole,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching alumni profile',
      error: error.message,
    });
  }
};

// ─── Create or Update Authenticated Alumni's Profile ──────────────
export const createOrUpdateAlumniProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { graduationYear, currentCompany, jobRole } = req.body;

    // Verify user is alumni
    const user = await User.findById(userId);
    if (!user || user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: 'Only alumni users can create/update alumni profile',
      });
    }

    // Validate required field
    if (!graduationYear) {
      return res.status(400).json({
        success: false,
        message: 'graduationYear is required',
      });
    }

    const year = parseInt(graduationYear);
    if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid graduationYear',
      });
    }

    const profileData = {
      alumniId: userId,
      graduationYear: year,
      currentCompany: currentCompany?.trim() || '',
      jobRole: jobRole?.trim() || '',
    };

    const profile = await AlumniProfile.findOneAndUpdate(
      { alumniId: userId },
      { $set: profileData },
      { new: true, runValidators: true, upsert: true }
    ).populate('alumniId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Alumni profile saved successfully',
      alumni: {
        id: profile._id,
        alumniId: profile.alumniId._id,
        name: profile.alumniId.name,
        email: profile.alumniId.email,
        graduationYear: profile.graduationYear,
        currentCompany: profile.currentCompany,
        jobRole: profile.jobRole,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while saving alumni profile',
      error: error.message,
    });
  }
};