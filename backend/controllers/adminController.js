import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../model/User.js';
import StudentProfile from '../model/StudentProfile.js';
import FacultyProfile from '../model/FacultyProfile.js';
import AlumniProfile from '../model/AlumniProfile.js';
import RecruiterProfile from '../model/RecruiterProfile.js';
import CareerRoadmap from '../model/CareerRoadmap.js';
import SemesterPlan from '../model/SemesterPlan.js';
import Company from '../model/Company.js';
import DepartmentEvent from '../model/DepartmentEvent.js';
import MockInterview from '../model/MockInterview.js';
import EvaluationScore from '../model/EvaluationScore.js';
import RecruiterFeedback from '../model/RecruiterFeedback.js';
import GuidanceRequest from '../model/GuidanceRequest.js';
import GuidanceReply from '../model/GuidanceReply.js';
import WeeklyGoal from '../model/WeeklyGoal.js';

// ─── 1. Executive Telemetry Overview (KPIs, Tiers, Live Activity) ────
export const getAdminOverview = async (req, res) => {
  try {
    // Parallel aggregate counts
    const [
      totalUsers,
      studentCount,
      facultyCount,
      alumniCount,
      recruiterCount,
      adminCount,
      companiesCount,
      roadmapsCount,
      eventsCount,
      totalInterviews,
      completedInterviews,
      totalQuestions,
      allStudentProfiles,
      recentUsers,
      recentInterviews,
      recentQuestions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      User.countDocuments({ role: 'alumni' }),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'admin' }),
      Company.countDocuments(),
      CareerRoadmap.countDocuments(),
      DepartmentEvent.countDocuments(),
      MockInterview.countDocuments(),
      MockInterview.countDocuments({ status: { $in: ['completed', 'evaluated'] } }),
      GuidanceRequest.countDocuments(),
      StudentProfile.find().select('readinessScore selectedCareer semester'),
      User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(5),
      MockInterview.find()
        .populate('studentId', 'name email')
        .populate('interviewerId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      GuidanceRequest.find()
        .populate('studentId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Calculate readiness distribution and tiers
    let totalScoreSum = 0;
    const tierCounts = {
      superDream: 0, // >= 80
      tier1: 0,      // 70-79
      tier2: 0,      // 60-69
      general: 0,    // < 60
    };

    allStudentProfiles.forEach((p) => {
      const score = p.readinessScore || 0;
      totalScoreSum += score;
      if (score >= 80) tierCounts.superDream++;
      else if (score >= 70) tierCounts.tier1++;
      else if (score >= 60) tierCounts.tier2++;
      else tierCounts.general++;
    });

    const studentTotal = Math.max(allStudentProfiles.length, 1);
    const averageReadiness = Math.round((totalScoreSum / studentTotal) * 10) / 10;

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      kpis: {
        totalUsers,
        students: studentCount,
        faculty: facultyCount,
        alumni: alumniCount,
        recruiters: recruiterCount,
        admins: adminCount,
        companies: companiesCount,
        careerRoadmaps: roadmapsCount,
        departmentEvents: eventsCount,
        mockInterviews: {
          total: totalInterviews,
          completed: completedInterviews,
          completionRate: totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0,
        },
        guidance: {
          total: totalQuestions,
        },
        readiness: {
          average: averageReadiness,
          tiers: tierCounts,
          tierPercentages: {
            superDream: Math.round((tierCounts.superDream / studentTotal) * 100),
            tier1: Math.round((tierCounts.tier1 / studentTotal) * 100),
            tier2: Math.round((tierCounts.tier2 / studentTotal) * 100),
            general: Math.round((tierCounts.general / studentTotal) * 100),
          },
        },
      },
      activityFeed: {
        recentUsers,
        recentInterviews,
        recentQuestions,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching admin overview telemetry',
      error: error.message,
    });
  }
};

// ─── 2. User Management (CRUD & Role Administration) ────────────────
export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const role = req.query.role;
    const search = (req.query.search || '').trim();
    const skip = (page - 1) * limit;

    const filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, totalItems] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    // Populate role profiles in parallel
    const populatedUsers = await Promise.all(
      users.map(async (u) => {
        let profile = null;
        if (u.role === 'student') {
          profile = await StudentProfile.findOne({ studentId: u._id }).select('semester selectedCareer readinessScore');
        } else if (u.role === 'faculty') {
          profile = await FacultyProfile.findOne({ facultyId: u._id }).select('department employeeId isHOD');
        } else if (u.role === 'alumni') {
          profile = await AlumniProfile.findOne({ alumniId: u._id }).select('graduationYear currentCompany jobRole');
        } else if (u.role === 'recruiter') {
          profile = await RecruiterProfile.findOne({ recruiterId: u._id }).select('companyName designation');
        }
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          profile,
        };
      })
    );

    return res.status(200).json({
      success: true,
      users: populatedUsers,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'student', profileData = {} } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const validRoles = ['student', 'faculty', 'alumni', 'recruiter', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${validRoles.join(', ')}`,
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
    });

    // Create role-specific profile document
    if (role === 'student') {
      await StudentProfile.create({
        studentId: user._id,
        semester: profileData.semester || 1,
        selectedCareer: profileData.selectedCareer || '',
        readinessScore: profileData.readinessScore || 0,
      });
    } else if (role === 'faculty') {
      await FacultyProfile.create({
        facultyId: user._id,
        employeeId: profileData.employeeId || `FAC-${Date.now().toString().slice(-4)}`,
        department: profileData.department || 'Computer Science & Engineering',
        isHOD: profileData.isHOD || false,
      });
    } else if (role === 'alumni') {
      await AlumniProfile.create({
        alumniId: user._id,
        graduationYear: profileData.graduationYear || new Date().getFullYear() - 1,
        currentCompany: profileData.currentCompany || 'Alumni Partner',
        jobRole: profileData.jobRole || 'Software Engineer',
      });
    } else if (role === 'recruiter') {
      await RecruiterProfile.create({
        recruiterId: user._id,
        companyName: profileData.companyName || 'Hiring Partner',
        designation: profileData.designation || 'Technical Talent Acquisition',
      });
    }

    return res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while creating user',
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password, profileData = {} } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID format' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check email uniqueness if email changed
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (role) user.role = role;
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password.trim(), salt);
    }

    await user.save();

    // Update role profiles
    if (user.role === 'student' && profileData) {
      await StudentProfile.findOneAndUpdate(
        { studentId: user._id },
        { $set: profileData },
        { upsert: true }
      );
    } else if (user.role === 'faculty' && profileData) {
      await FacultyProfile.findOneAndUpdate(
        { facultyId: user._id },
        { $set: profileData },
        { upsert: true }
      );
    } else if (user.role === 'alumni' && profileData) {
      await AlumniProfile.findOneAndUpdate(
        { alumniId: user._id },
        { $set: profileData },
        { upsert: true }
      );
    } else if (user.role === 'recruiter' && profileData) {
      await RecruiterProfile.findOneAndUpdate(
        { recruiterId: user._id },
        { $set: profileData },
        { upsert: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating user',
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid User ID format' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cascade delete role profile and associated sprint records
    await Promise.all([
      StudentProfile.deleteOne({ studentId: id }),
      FacultyProfile.deleteOne({ facultyId: id }),
      AlumniProfile.deleteOne({ alumniId: id }),
      RecruiterProfile.deleteOne({ recruiterId: id }),
      WeeklyGoal.deleteOne({ userId: id }),
      User.deleteOne({ _id: id }),
    ]);

    return res.status(200).json({
      success: true,
      message: `User ${user.name} and associated profile records removed successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: error.message,
    });
  }
};

// ─── 3. Career Roadmaps & Master Curriculum Data (SRS R.2) ───────────
export const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await CareerRoadmap.find().sort({ careerName: 1 });
    const populated = await Promise.all(
      roadmaps.map(async (rm) => {
        const semesterPlans = await SemesterPlan.find({ roadmapId: rm._id }).sort({ semesterNumber: 1 });
        const enrolledStudents = await StudentProfile.countDocuments({ selectedCareer: rm.careerName });
        return {
          id: rm._id,
          careerName: rm.careerName,
          description: rm.description,
          requiredSkills: rm.requiredSkills || [],
          semesterPlans,
          enrolledStudents,
        };
      })
    );

    return res.status(200).json({
      success: true,
      roadmaps: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching career roadmaps',
      error: error.message,
    });
  }
};

export const createRoadmap = async (req, res) => {
  try {
    const { careerName, description, requiredSkills = [], semesterPlans = [] } = req.body;

    if (!careerName || !careerName.trim()) {
      return res.status(400).json({ success: false, message: 'Career track name is required' });
    }

    const existing = await CareerRoadmap.findOne({ careerName: careerName.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A career roadmap with this track name already exists' });
    }

    const roadmap = await CareerRoadmap.create({
      careerName: careerName.trim(),
      description: (description || '').trim(),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    });

    if (Array.isArray(semesterPlans) && semesterPlans.length > 0) {
      await Promise.all(
        semesterPlans.map((sp) =>
          SemesterPlan.create({
            roadmapId: roadmap._id,
            semesterNumber: sp.semesterNumber || 1,
            subjects: sp.subjects || [],
          })
        )
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Career track roadmap created successfully',
      roadmap,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while creating career roadmap',
      error: error.message,
    });
  }
};

export const updateRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    const { careerName, description, requiredSkills, semesterPlans } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Roadmap ID' });
    }

    const roadmap = await CareerRoadmap.findById(id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    if (careerName) roadmap.careerName = careerName.trim();
    if (description !== undefined) roadmap.description = description.trim();
    if (requiredSkills) roadmap.requiredSkills = requiredSkills;

    await roadmap.save();

    // If semester plans are provided, sync them
    if (Array.isArray(semesterPlans)) {
      await SemesterPlan.deleteMany({ roadmapId: id });
      await Promise.all(
        semesterPlans.map((sp) =>
          SemesterPlan.create({
            roadmapId: id,
            semesterNumber: sp.semesterNumber,
            subjects: sp.subjects || [],
          })
        )
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Career track roadmap updated successfully',
      roadmap,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating career roadmap',
      error: error.message,
    });
  }
};

export const deleteRoadmap = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Roadmap ID' });
    }

    await Promise.all([
      SemesterPlan.deleteMany({ roadmapId: id }),
      CareerRoadmap.deleteOne({ _id: id }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Career track roadmap and semester milestone plans deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting career roadmap',
      error: error.message,
    });
  }
};

// ─── 4. Hiring Partner Companies (SRS R.5) ───────────────────────────
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ companyName: 1 });
    const allStudents = await StudentProfile.find().select('readinessScore');

    const populated = companies.map((c) => {
      const minScore = c.minimumMatchScore || 0;
      const eligibleCount = allStudents.filter((s) => (s.readinessScore || 0) >= minScore).length;
      return {
        id: c._id,
        companyName: c.companyName,
        requiredSkills: c.requiredSkills || [],
        minimumMatchScore: minScore,
        eligibleStudentsCount: eligibleCount,
      };
    });

    return res.status(200).json({
      success: true,
      companies: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching companies',
      error: error.message,
    });
  }
};

export const createCompany = async (req, res) => {
  try {
    const { companyName, requiredSkills = [], minimumMatchScore = 60 } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const existing = await Company.findOne({ companyName: companyName.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Company already registered' });
    }

    const company = await Company.create({
      companyName: companyName.trim(),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      minimumMatchScore: Number(minimumMatchScore) || 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Hiring partner company created successfully',
      company,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while creating company',
      error: error.message,
    });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, requiredSkills, minimumMatchScore } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Company ID' });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    if (companyName) company.companyName = companyName.trim();
    if (requiredSkills) company.requiredSkills = requiredSkills;
    if (minimumMatchScore !== undefined) company.minimumMatchScore = Number(minimumMatchScore);

    await company.save();

    return res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      company,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating company',
      error: error.message,
    });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Company ID' });
    }

    await Company.deleteOne({ _id: id });
    return res.status(200).json({
      success: true,
      message: 'Company deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting company',
      error: error.message,
    });
  }
};

// ─── 5. Department Events (SRS R.6.3) ─────────────────────────────────
export const getEvents = async (req, res) => {
  try {
    const events = await DepartmentEvent.find()
      .populate('hodId', 'name email role')
      .sort({ date: -1 });

    const formatted = events.map((e) => ({
      id: e._id,
      title: e.title,
      targetSkill: e.targetSkill || 'General Placement Prep',
      date: e.date,
      organizer: e.hodId ? { name: e.hodId.name, email: e.hodId.email } : null,
    }));

    return res.status(200).json({
      success: true,
      events: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching department events',
      error: error.message,
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, targetSkill, date } = req.body;

    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: 'Event title and date are required',
      });
    }

    const event = await DepartmentEvent.create({
      hodId: req.user.id,
      title: title.trim(),
      targetSkill: targetSkill ? targetSkill.trim() : 'General Technical Readiness',
      date: new Date(date),
    });

    return res.status(201).json({
      success: true,
      message: 'Department skill improvement event scheduled successfully',
      event,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while scheduling event',
      error: error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Event ID' });
    }

    await DepartmentEvent.deleteOne({ _id: id });
    return res.status(200).json({
      success: true,
      message: 'Department event deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting event',
      error: error.message,
    });
  }
};

// ─── 6. Institutional Analytics (SRS R.6.1 & R.6.2) ──────────────────
export const getSystemAnalytics = async (req, res) => {
  try {
    // 6.1 Career Choice Distribution (SRS R.6.1)
    const careerDistribution = await StudentProfile.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$selectedCareer', 'Unassigned / Exploring'] },
          count: { $sum: 1 },
          avgScore: { $avg: '$readinessScore' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 6.2 Placement Skill Gaps across all students (SRS R.6.2)
    // Gather low scores from EvaluationScore
    const lowEvaluations = await EvaluationScore.aggregate([
      {
        $project: {
          lowTechnical: { $lt: ['$technicalScore', 3] },
          lowCommunication: { $lt: ['$communicationScore', 3] },
          lowConfidence: { $lt: ['$confidenceScore', 3] },
        },
      },
      {
        $group: {
          _id: null,
          technicalGaps: { $sum: { $cond: ['$lowTechnical', 1, 0] } },
          communicationGaps: { $sum: { $cond: ['$lowCommunication', 1, 0] } },
          confidenceGaps: { $sum: { $cond: ['$lowConfidence', 1, 0] } },
          totalEvaluations: { $sum: 1 },
        },
      },
    ]);

    const evalStats = lowEvaluations[0] || {
      technicalGaps: 0,
      communicationGaps: 0,
      confidenceGaps: 0,
      totalEvaluations: 0,
    };

    // Recruiter Feedback sentiments
    const recruiterFeedbacks = await RecruiterFeedback.find().select('recommendation comments createdAt');
    const recommendationCounts = {
      hire: 0,
      consider: 0,
      reject: 0,
    };

    recruiterFeedbacks.forEach((f) => {
      const rec = (f.recommendation || '').toLowerCase();
      if (rec.includes('hire') || rec === 'yes') recommendationCounts.hire++;
      else if (rec.includes('consider') || rec === 'maybe') recommendationCounts.consider++;
      else recommendationCounts.reject++;
    });

    return res.status(200).json({
      success: true,
      careerDistribution: careerDistribution.map((cd) => ({
        career: cd._id || 'Unassigned / Exploring',
        studentCount: cd.count,
        avgReadinessScore: Math.round((cd.avgScore || 0) * 10) / 10,
      })),
      skillGaps: [
        {
          skillDomain: 'System Architecture & Technical Algorithms',
          studentsNeedingImprovement: evalStats.technicalGaps,
          totalAssessed: evalStats.totalEvaluations,
          gapPercentage:
            evalStats.totalEvaluations > 0
              ? Math.round((evalStats.technicalGaps / evalStats.totalEvaluations) * 100)
              : 0,
        },
        {
          skillDomain: 'Professional Communication & Articulation',
          studentsNeedingImprovement: evalStats.communicationGaps,
          totalAssessed: evalStats.totalEvaluations,
          gapPercentage:
            evalStats.totalEvaluations > 0
              ? Math.round((evalStats.communicationGaps / evalStats.totalEvaluations) * 100)
              : 0,
        },
        {
          skillDomain: 'Behavioral Confidence & Scenario Presentation',
          studentsNeedingImprovement: evalStats.confidenceGaps,
          totalAssessed: evalStats.totalEvaluations,
          gapPercentage:
            evalStats.totalEvaluations > 0
              ? Math.round((evalStats.confidenceGaps / evalStats.totalEvaluations) * 100)
              : 0,
        },
      ],
      recruiterSentiment: {
        totalFeedbackLogged: recruiterFeedbacks.length,
        recommendations: recommendationCounts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while generating institutional analytics',
      error: error.message,
    });
  }
};
