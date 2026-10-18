import mongoose from 'mongoose';
import CareerRoadmap from '../model/CareerRoadmap.js';
import SemesterPlan from '../model/SemesterPlan.js';
import StudentProfile from '../model/StudentProfile.js';

// ─── POST /api/career/quiz — Submit Career Quiz ──────────────────
export const submitCareerQuiz = async (req, res) => {
  try {
    const { interests = [], strengths = [], autoApply = false } = req.body;

    if (!Array.isArray(interests) || !Array.isArray(strengths)) {
      return res.status(400).json({
        success: false,
        message: 'interests and strengths must be arrays of strings',
      });
    }

    const allRoadmaps = await CareerRoadmap.find();
    let bestMatch = null;

    if (!allRoadmaps || allRoadmaps.length === 0) {
      // Fallback deduction based on keywords if database roadmaps are not seeded yet
      const combinedTraits = [...interests, ...strengths].join(' ').toLowerCase();
      let fallbackCareer = 'Distributed Systems & Cloud Backend Engineer';

      if (combinedTraits.includes('data') || combinedTraits.includes('python') || combinedTraits.includes('analytics')) {
        fallbackCareer = 'AI & Data Systems Engineer';
      } else if (combinedTraits.includes('ai') || combinedTraits.includes('machine learning') || combinedTraits.includes('model')) {
        fallbackCareer = 'AI & Data Systems Engineer';
      } else if (combinedTraits.includes('cloud') || combinedTraits.includes('devops') || combinedTraits.includes('docker') || combinedTraits.includes('kubernetes')) {
        fallbackCareer = 'DevOps & Cloud Infrastructure Specialist';
      } else if (combinedTraits.includes('fullstack') || combinedTraits.includes('react') || combinedTraits.includes('frontend') || combinedTraits.includes('web')) {
        fallbackCareer = 'Full-Stack Product Engineering';
      }

      bestMatch = {
        careerName: fallbackCareer,
        description: 'Recommended trajectory based on your interest diagnostics.',
        requiredSkills: ['Core Engineering', 'Problem Solving'],
      };
    } else {
      // Match criteria against roadmaps
      const userTokens = [...interests, ...strengths].map((s) => String(s).toLowerCase().trim());
      bestMatch = allRoadmaps[0];
      let highestScore = -1;

      for (const roadmap of allRoadmaps) {
        let currentScore = 0;
        const careerNameTokens = roadmap.careerName.toLowerCase().split(/\s+/);
        const skillsTokens = (roadmap.requiredSkills || []).map((sk) => sk.toLowerCase());
        const descriptionText = (roadmap.description || '').toLowerCase();

        for (const token of userTokens) {
          if (!token) continue;
          if (skillsTokens.some((skill) => skill.includes(token) || token.includes(skill))) {
            currentScore += 3;
          }
          if (careerNameTokens.some((cnt) => cnt.includes(token) || token.includes(cnt))) {
            currentScore += 2;
          }
          if (descriptionText.includes(token)) {
            currentScore += 1;
          }
        }

        if (currentScore > highestScore) {
          highestScore = currentScore;
          bestMatch = roadmap;
        }
      }
    }

    // For authenticated student, persist completion state and career suggestion to StudentProfile
    let updatedProfile = null;
    const completedAt = new Date();
    const studentUserId = req.user?.id || req.user?.userId;

    if (studentUserId) {
      const existingProfile = await StudentProfile.findOne({ studentId: studentUserId });
      const currentSelected = existingProfile?.selectedCareer || '';
      const targetCareer = autoApply || !currentSelected ? bestMatch.careerName : currentSelected;

      updatedProfile = await StudentProfile.findOneAndUpdate(
        { studentId: studentUserId },
        {
          $set: {
            selectedCareer: targetCareer,
            readinessQuizCompletedAt: completedAt,
          },
          $push: {
            careerHistory: {
              career: bestMatch.careerName,
              date: completedAt,
              source: 'quiz',
            },
          },
        },
        { new: true, upsert: true }
      );
    }

    return res.status(200).json({
      success: true,
      hasCompletedQuiz: true,
      readinessQuizCompletedAt: completedAt,
      suggestedCareer: bestMatch.careerName,
      selectedCareer: updatedProfile?.selectedCareer || bestMatch.careerName,
      description: bestMatch.description,
      requiredSkills: bestMatch.requiredSkills,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while evaluating career quiz',
      error: error.message,
    });
  }
};

// ─── GET /api/career/roadmap/:careerId — Retrieve Roadmap Details ─
export const getRoadmapById = async (req, res) => {
  try {
    const { careerId } = req.params;

    let roadmap = null;

    if (mongoose.Types.ObjectId.isValid(careerId)) {
      roadmap = await CareerRoadmap.findById(careerId);
    }

    if (!roadmap) {
      // Safely escape regex characters for exact or case-insensitive search
      const escaped = String(careerId).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      roadmap = await CareerRoadmap.findOne({
        careerName: { $regex: new RegExp(`^${escaped}$`, 'i') },
      });
      if (!roadmap) {
        roadmap = await CareerRoadmap.findOne({
          careerName: { $regex: new RegExp(escaped, 'i') },
        });
      }
    }

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Career roadmap not found',
      });
    }

    // Query associated semester plans
    const semesterPlans = await SemesterPlan.find({ roadmapId: roadmap._id }).sort({
      semesterNumber: 1,
    });

    let steps = [];
    if (semesterPlans && semesterPlans.length > 0) {
      steps = semesterPlans.map((plan) => {
        const subjectsStr = (plan.subjects || []).join(', ');
        return `Semester ${plan.semesterNumber}: ${subjectsStr || 'Core Electives & Projects'}`;
      });
    } else if (roadmap.requiredSkills && roadmap.requiredSkills.length > 0) {
      steps = roadmap.requiredSkills.map(
        (skill, index) => `Phase ${index + 1}: Master ${skill}`
      );
    } else {
      steps = [
        'Semester 1: Computer Science Fundamentals & Mathematics',
        'Semester 2: Data Structures & Algorithms',
        'Semester 3: Core Domain Technologies & Frameworks',
        'Semester 4: Advanced Systems, Capstone Projects & Placement Readiness',
      ];
    }

    return res.status(200).json({
      success: true,
      career: roadmap.careerName,
      description: roadmap.description,
      requiredSkills: roadmap.requiredSkills,
      steps,
      semesterPlans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching career roadmap',
      error: error.message,
    });
  }
};

// ─── GET /api/career/tracks — Get All Available Career Tracks ────────
export const getCareerTracks = async (req, res) => {
  try {
    const roadmaps = await CareerRoadmap.find().sort({ careerName: 1 });
    const tracks = roadmaps.map((r) => ({
      id: r._id,
      careerName: r.careerName,
      description: r.description,
      requiredSkills: r.requiredSkills || [],
    }));

    return res.status(200).json({
      success: true,
      count: tracks.length,
      tracks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching career tracks',
      error: error.message,
    });
  }
};

