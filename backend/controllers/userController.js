import mongoose from 'mongoose';
import User from '../model/User.js';
import StudentProfile from '../model/StudentProfile.js';
import FacultyProfile from '../model/FacultyProfile.js';
import AlumniProfile from '../model/AlumniProfile.js';
import RecruiterProfile from '../model/RecruiterProfile.js';

// ─── Get Authenticated User's Profile ─────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // Get base user info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get role-specific profile
    let profile = null;
    switch (role) {
      case 'student':
        profile = await StudentProfile.findOne({ studentId: userId });
        break;
      case 'faculty':
        profile = await FacultyProfile.findOne({ facultyId: userId });
        break;
      case 'alumni':
        profile = await AlumniProfile.findOne({ alumniId: userId });
        break;
      case 'recruiter':
        profile = await RecruiterProfile.findOne({ recruiterId: userId });
        break;
      default:
        profile = null;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: error.message,
    });
  }
};

// ─── Update Authenticated User's Profile ──────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { name, email, ...profileData } = req.body;

    // Update base user info
    const updateUserData = {};
    if (name !== undefined) updateUserData.name = name.trim();
    if (email !== undefined) updateUserData.email = email.toLowerCase().trim();

    let user = null;
    if (Object.keys(updateUserData).length > 0) {
      // Check email uniqueness if email is being updated
      if (updateUserData.email) {
        const existingUser = await User.findOne({
          email: updateUserData.email,
          _id: { $ne: userId },
        });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use',
          });
        }
      }

      user = await User.findByIdAndUpdate(userId, updateUserData, {
        new: true,
        runValidators: true,
      }).select('-password');
    } else {
      user = await User.findById(userId).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update role-specific profile
    let profile = null;
    switch (role) {
      case 'student':
        profile = await StudentProfile.findOneAndUpdate(
          { studentId: userId },
          { $set: profileData },
          { new: true, runValidators: true, upsert: true }
        );
        break;
      case 'faculty':
        profile = await FacultyProfile.findOneAndUpdate(
          { facultyId: userId },
          { $set: profileData },
          { new: true, runValidators: true, upsert: true }
        );
        break;
      case 'alumni':
        profile = await AlumniProfile.findOneAndUpdate(
          { alumniId: userId },
          { $set: profileData },
          { new: true, runValidators: true, upsert: true }
        );
        break;
      case 'recruiter':
        profile = await RecruiterProfile.findOneAndUpdate(
          { recruiterId: userId },
          { $set: profileData },
          { new: true, runValidators: true, upsert: true }
        );
        break;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: error.message,
    });
  }
};

// ─── Get User by ID (Public Info Only) ────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid User ID format',
      });
    }

    const user = await User.findById(id).select('name email role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: error.message,
    });
  }
};

// ─── Get All Users (Admin Only) ───────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role) {
      const validRoles = ['student', 'faculty', 'alumni', 'recruiter', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role filter',
        });
      }
      filter.role = role;
    }

    const [users, totalItems] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      success: true,
      count: users.length,
      page,
      totalPages,
      totalItems,
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message,
    });
  }
};