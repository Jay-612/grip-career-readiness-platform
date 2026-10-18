import mongoose from 'mongoose';
import WeeklyGoal from '../model/WeeklyGoal.js';
import { calculateStudentReadiness } from '../services/readinessService.js';

// ─── POST /api/goals — Save Weekly Goals ──────────────────────────
export const saveWeeklyGoals = async (req, res) => {
  try {
    const { userId, goals, dueDate } = req.body;
    // Security: Student cannot insert goals for another student
    let targetUserId = req.user?.id || req.user?.userId;
    if (req.user?.role === 'admin' && userId) {
      targetUserId = userId;
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    if (!goals || !Array.isArray(goals) || goals.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'goals must be a non-empty array of strings',
      });
    }

    // Default dueDate to 7 days from now if not specified
    let targetDueDate;
    if (dueDate) {
      const parsed = new Date(dueDate);
      targetDueDate = isNaN(parsed.getTime()) ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : parsed;
    } else {
      targetDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const goalDocuments = goals.map((goalItem) => {
      const title = typeof goalItem === 'string' ? goalItem.trim() : (goalItem.title || '').trim();
      return {
        studentId: targetUserId,
        title: title || 'Untitled Goal',
        status: 'in-progress',
        dueDate: targetDueDate,
      };
    });

    const createdGoals = await WeeklyGoal.insertMany(goalDocuments);

    // Asynchronously update student readiness
    calculateStudentReadiness(targetUserId).catch((err) =>
      console.error('Async readiness update failed after goal creation:', err.message)
    );

    return res.status(201).json({
      success: true,
      message: 'Weekly goals saved successfully',
      count: createdGoals.length,
      goals: createdGoals,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while saving weekly goals',
      error: error.message,
    });
  }
};

// ─── PUT /api/goals/:goalId — Update Goal Status ──────────────────
export const updateGoalStatus = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid goal ID format',
      });
    }

    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'status is required',
      });
    }

    // Normalize status to enum ['pending', 'in-progress', 'completed']
    let normalizedStatus = status.trim().toLowerCase();
    if (normalizedStatus === 'done' || normalizedStatus === 'completed') {
      normalizedStatus = 'completed';
    } else if (normalizedStatus === 'pending') {
      normalizedStatus = 'pending';
    } else if (
      normalizedStatus === 'in-progress' ||
      normalizedStatus === 'inprogress' ||
      normalizedStatus === 'in progress'
    ) {
      normalizedStatus = 'in-progress';
    }

    // Verify goal exists and student owns it
    const existingGoal = await WeeklyGoal.findById(goalId);
    if (!existingGoal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // RBAC: Students can only update their own goals
    if (
      req.user?.role === 'student' &&
      existingGoal.studentId.toString() !== (req.user?.id || req.user?.userId).toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own goals.',
      });
    }

    existingGoal.status = normalizedStatus;
    await existingGoal.save();

    // Trigger instant asynchronous recalculation of readiness score
    calculateStudentReadiness(existingGoal.studentId).catch((err) =>
      console.error('Async readiness update failed after goal status change:', err.message)
    );

    return res.status(200).json({
      success: true,
      message: 'Goal status updated successfully',
      goal: existingGoal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating goal status',
      error: error.message,
    });
  }
};

// ─── PUT /api/goals/:goalId/edit — Edit Goal Details (Title & Due Date) ────
export const editGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { title, dueDate, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid goal ID format',
      });
    }

    const existingGoal = await WeeklyGoal.findById(goalId);
    if (!existingGoal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // RBAC: Students can only edit their own goals
    if (
      req.user?.role === 'student' &&
      existingGoal.studentId.toString() !== (req.user?.id || req.user?.userId).toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own goals.',
      });
    }

    if (title && typeof title === 'string' && title.trim()) {
      existingGoal.title = title.trim();
    }

    if (dueDate) {
      const parsedDate = new Date(dueDate);
      if (!isNaN(parsedDate.getTime())) {
        existingGoal.dueDate = parsedDate;
      }
    }

    if (status && typeof status === 'string') {
      const norm = status.trim().toLowerCase();
      if (['pending', 'in-progress', 'completed'].includes(norm)) {
        existingGoal.status = norm;
      }
    }

    await existingGoal.save();

    // Trigger async readiness recalculation
    calculateStudentReadiness(existingGoal.studentId).catch((err) =>
      console.error('Async readiness update failed after goal edit:', err.message)
    );

    return res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      goal: existingGoal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while editing goal',
      error: error.message,
    });
  }
};

// ─── DELETE /api/goals/:goalId — Delete a Weekly Goal ─────────────
export const deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(goalId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid goal ID format',
      });
    }

    const goal = await WeeklyGoal.findById(goalId);
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    // RBAC: Students can only delete their own goals
    if (
      req.user?.role === 'student' &&
      goal.studentId.toString() !== (req.user?.id || req.user?.userId).toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own goals.',
      });
    }

    const studentId = goal.studentId;
    await WeeklyGoal.findByIdAndDelete(goalId);

    // Trigger async readiness recalculation
    calculateStudentReadiness(studentId).catch((err) =>
      console.error('Async readiness update failed after goal deletion:', err.message)
    );

    return res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      goalId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting goal',
      error: error.message,
    });
  }
};

