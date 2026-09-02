import mongoose from 'mongoose';
import EvaluationScore from '../model/EvaluationScore.js';
import MockInterview from '../model/MockInterview.js';

// ─── POST /api/skills/evaluation — Save Skill Evaluation Scores ────
export const saveEvaluationScore = async (req, res) => {
  try {
    const userRole = (req.user?.role || '').toLowerCase();

    if (userRole !== 'faculty' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Faculty can evaluate mock interview skills.',
      });
    }

    const {
      interviewId,
      communication,
      confidence,
      technical,
      communicationScore,
      confidenceScore,
      technicalScore,
    } = req.body;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: 'interviewId is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format',
      });
    }

    const commVal = communication !== undefined ? Number(communication) : Number(communicationScore);
    const confVal = confidence !== undefined ? Number(confidence) : Number(confidenceScore);
    const techVal = technical !== undefined ? Number(technical) : Number(technicalScore);

    if (
      isNaN(commVal) ||
      isNaN(confVal) ||
      isNaN(techVal) ||
      commVal < 0 ||
      commVal > 10 ||
      confVal < 0 ||
      confVal > 10 ||
      techVal < 0 ||
      techVal > 10
    ) {
      return res.status(400).json({
        success: false,
        message: 'Scores for communication, confidence, and technical must be numbers between 0 and 10',
      });
    }

    // Verify mock interview exists
    const interview = await MockInterview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Mock interview appointment not found',
      });
    }

    // Update interview status to completed
    interview.status = 'completed';
    await interview.save();

    await EvaluationScore.create({
      interviewId,
      communicationScore: commVal,
      confidenceScore: confVal,
      technicalScore: techVal,
    });

    return res.status(201).json({
      message: 'Scores saved successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while saving evaluation score',
      error: error.message,
    });
  }
};
