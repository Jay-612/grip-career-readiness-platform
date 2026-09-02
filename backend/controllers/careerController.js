import mongoose from 'mongoose';
import CareerRoadmap from '../model/CareerRoadmap.js';
import SemesterPlan from '../model/SemesterPlan.js';

// ─── POST /api/career/quiz — Submit Career Quiz ──────────────────
export const submitCareerQuiz = async (req, res) => {
  try {
    const { interests = [], strengths = [], weaknesses = [] } = req.body;

    if (!Array.isArray(interests) || !Array.isArray(strengths)) {
      return res.status(400).json({
        success: false,
        message: 'interests and strengths must be arrays of strings',
      });
    }

    const allRoadmaps = await CareerRoadmap.find();

    if (!allRoadmaps || allRoadmaps.length === 0) {
      // Fallback deduction based on keywords if database roadmaps are not seeded yet
      const combinedTraits = [...interests, ...strengths].join(' ').toLowerCase();
      let fallbackCareer = 'Full Stack Developer';

      if (combinedTraits.includes('data') || combinedTraits.includes('python') || combinedTraits.includes('analytics')) {
        fallbackCareer = 'Data Scientist';
      } else if (combinedTraits.includes('ai') || combinedTraits.includes('machine learning') || combinedTraits.includes('model')) {
        fallbackCareer = 'AI/ML Engineer';
      } else if (combinedTraits.includes('cloud') || combinedTraits.includes('devops') || combinedTraits.includes('docker')) {
        fallbackCareer = 'Cloud DevOps Engineer';
      } else if (combinedTraits.includes('cyber') || combinedTraits.includes('security')) {
        fallbackCareer = 'Cybersecurity Analyst';
      }

      return res.status(200).json({
        suggestedCareer: fallbackCareer,
      });
    }

    // Match criteria against roadmaps
    const userTokens = [...interests, ...strengths].map((s) => String(s).toLowerCase().trim());

    let bestMatch = allRoadmaps[0];
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

    return res.status(200).json({
      suggestedCareer: bestMatch.careerName,
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
      // Try finding by exact or case-insensitive career name
      roadmap = await CareerRoadmap.findOne({
        careerName: { $regex: new RegExp(`^${careerId}$`, 'i') },
      });
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
      career: roadmap.careerName,
      steps,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching career roadmap',
      error: error.message,
    });
  }
};
