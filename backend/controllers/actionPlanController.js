import mongoose from 'mongoose';
import {
  previewActionPlan,
  createAndAssignActionPlan,
  getActionPlansByStudent,
  getActionPlanByInterview,
  getActionPlanById,
} from '../services/actionPlanService.js';
import ActionPlan from '../model/ActionPlan.js';
import WeeklyGoal from '../model/WeeklyGoal.js';

/**
 * POST /api/action-plans/preview
 * Generate real-time in-memory action plan preview for faculty grading console
 */
export const getActionPlanPreview = async (req, res) => {
  try {
    const { scores, notes, technical, communication, confidence } = req.body;

    const resolvedScores = scores || {
      technical,
      communication,
      confidence,
    };

    const preview = previewActionPlan({
      scores: resolvedScores,
      notes: notes || {},
    });

    return res.status(200).json({
      success: true,
      preview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate action plan preview',
      error: error.message,
    });
  }
};

/**
 * GET /api/action-plans/student/:studentId
 * Get all action plans for a student with associated remedial weekly goals
 */
export const getStudentActionPlans = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    // Role check: students can only access their own action plans
    const userRole = (req.user?.role || '').toLowerCase();
    const currentUserId = (req.user?.id || req.user?._id || '').toString();
    if (userRole === 'student' && currentUserId !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You may only view your own action plans',
      });
    }

    const actionPlans = await getActionPlansByStudent(studentId);

    // Fetch corresponding remedial goals for these action plans
    const actionPlanIds = actionPlans.map((ap) => ap._id);
    const remedialGoals = await WeeklyGoal.find({
      studentId,
      $or: [{ actionPlanId: { $in: actionPlanIds } }, { isRemedial: true }],
    })
      .populate('assignedBy', 'name email role')
      .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      count: actionPlans.length,
      actionPlans,
      remedialGoals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve student action plans',
      error: error.message,
    });
  }
};

/**
 * GET /api/action-plans/my-plans
 * Convenience endpoint for logged-in students to fetch their active action plans
 */
export const getMyActionPlans = async (req, res) => {
  try {
    const studentId = req.user?.id || req.user?._id;
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const actionPlans = await getActionPlansByStudent(studentId);
    const remedialGoals = await WeeklyGoal.find({
      studentId,
      $or: [{ actionPlanId: { $in: actionPlans.map((a) => a._id) } }, { isRemedial: true }],
    })
      .populate('assignedBy', 'name email role')
      .sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      actionPlans,
      remedialGoals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve your action plans',
      error: error.message,
    });
  }
};

/**
 * GET /api/action-plans/interview/:interviewId
 * Get the action plan associated with a specific interview appointment
 */
export const getInterviewActionPlan = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interview ID format',
      });
    }

    const actionPlan = await getActionPlanByInterview(interviewId);

    if (!actionPlan) {
      return res.status(404).json({
        success: false,
        message: 'No action plan found for this interview',
      });
    }

    const remedialGoals = await WeeklyGoal.find({
      actionPlanId: actionPlan._id,
    }).populate('assignedBy', 'name email role');

    return res.status(200).json({
      success: true,
      actionPlan,
      remedialGoals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve interview action plan',
      error: error.message,
    });
  }
};

/**
 * POST /api/action-plans/generate
 * Manually trigger or regenerate action plan and remedial assignments
 */
export const generateActionPlanManually = async (req, res) => {
  try {
    const userRole = (req.user?.role || '').toLowerCase();
    if (userRole !== 'faculty' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only faculty or admin can dispatch action plans',
      });
    }

    const { studentId, interviewId, scores, notes } = req.body;
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required',
      });
    }

    const result = await createAndAssignActionPlan({
      studentId,
      interviewId,
      scores,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Action plan created and remedial goals assigned successfully',
      actionPlan: result.actionPlan,
      assignedGoals: result.assignedGoals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate action plan',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/action-plans/:id/status
 * Update the status of an action plan (e.g. from 'assigned' to 'in-progress' or 'completed')
 */
export const updateActionPlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action plan ID format',
      });
    }

    const validStatuses = ['generated', 'assigned', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const plan = await ActionPlan.findById(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Action plan not found',
      });
    }

    plan.status = status;
    await plan.save();

    return res.status(200).json({
      success: true,
      message: 'Action plan status updated successfully',
      actionPlan: plan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update action plan status',
      error: error.message,
    });
  }
};

export default {
  getActionPlanPreview,
  getStudentActionPlans,
  getMyActionPlans,
  getInterviewActionPlan,
  generateActionPlanManually,
  updateActionPlanStatus,
};
