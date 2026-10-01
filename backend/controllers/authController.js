import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';
import StudentProfile from '../model/StudentProfile.js';

// ─── Register a new user ───────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userRole = role || 'student';
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    // Create initial profile if student
    let selectedCareer = '';
    if (userRole === 'student') {
      await StudentProfile.create({
        studentId: user._id,
        semester: 1,
        selectedCareer: '',
        readinessScore: 0,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        selectedCareer: '',
        hasCompletedQuiz: false,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── Login an existing user ────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    let selectedCareer = '';
    if (user.role === 'student') {
      let studentProfile = await StudentProfile.findOne({ studentId: user._id });
      if (!studentProfile) {
        studentProfile = await StudentProfile.create({
          studentId: user._id,
          semester: 1,
          selectedCareer: '',
          readinessScore: 0,
        });
      }
      selectedCareer = studentProfile.selectedCareer || '';
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        selectedCareer,
        hasCompletedQuiz: Boolean(selectedCareer && selectedCareer.trim().length > 0),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};