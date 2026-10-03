import mongoose from 'mongoose';
import EvaluationScore from '../model/EvaluationScore.js';
import MockInterview from '../model/MockInterview.js';
import { calculateStudentReadiness } from '../services/readinessService.js';
import { createAndAssignActionPlan } from '../services/actionPlanService.js';

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
      technicalNotes,
      communicationNotes,
      confidenceNotes,
      overallSynthesis,
      facultyFeedback,
      hiringVerdict,
      actionPlanTasks,
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

    // Prevent duplicate evaluation score records
    let scoreRecord = await EvaluationScore.findOne({ interviewId });
    if (scoreRecord) {
      scoreRecord.communicationScore = commVal;
      scoreRecord.confidenceScore = confVal;
      scoreRecord.technicalScore = techVal;
      await scoreRecord.save();
    } else {
      scoreRecord = await EvaluationScore.create({
        interviewId,
        communicationScore: commVal,
        confidenceScore: confVal,
        technicalScore: techVal,
      });
    }

    // Automatically trigger Action Plan and assign remedial WeeklyGoal items
    // (Based on SRS Section R.4.5 & Lab-3 Sequence & Activity Diagrams)
    let actionPlan = null;
    let assignedGoals = [];
    if (interview.studentId) {
      const evaluatorId = req.user?.id || req.user?._id || interview.interviewerId;

      const actionPlanResult = await createAndAssignActionPlan({
        studentId: interview.studentId,
        interviewId: interview._id,
        evaluatorId,
        scores: {
          technical: techVal,
          communication: commVal,
          confidence: confVal,
        },
        notes: {
          technicalNotes,
          communicationNotes,
          confidenceNotes,
          overallSynthesis,
          facultyFeedback: facultyFeedback || overallSynthesis,
          hiringVerdict,
        },
        tasks: Array.isArray(actionPlanTasks) ? actionPlanTasks : [],
        facultyFeedback: facultyFeedback || overallSynthesis,
      });

      actionPlan = actionPlanResult.actionPlan;
      assignedGoals = actionPlanResult.assignedGoals;

      // Recalculate student readiness asynchronously
      calculateStudentReadiness(interview.studentId).catch((err) =>
        console.error('Async readiness update failed after interview evaluation:', err.message)
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Scores saved and action plan processed successfully',
      evaluation: scoreRecord,
      actionPlan,
      assignedGoals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while saving evaluation score',
      error: error.message,
    });
  }
};

export default {
  saveEvaluationScore,
};
