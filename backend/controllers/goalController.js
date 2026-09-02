import mongoose from 'mongoose';
import WeeklyGoal from '../model/WeeklyGoal.js';

// ─── POST /api/goals — Save Weekly Goals ──────────────────────────
export const saveWeeklyGoals = async (req, res) => {
  try {
    const { userId, goals, dueDate } = req.body;
    const targetUserId = userId || req.user?.id || req.user?.userId;

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
    const targetDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const goalDocuments = goals.map((goalItem) => {
      const title = typeof goalItem === 'string' ? goalItem.trim() : (goalItem.title || '').trim();
      return {
        studentId: targetUserId,
        title: title || 'Untitled Goal',
        status: 'in-progress',
        dueDate: targetDueDate,
      };
    });

    await WeeklyGoal.insertMany(goalDocuments);

    return res.status(201).json({
      message: 'Weekly goals saved successfully',
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
    } else if (normalizedStatus === 'in-progress' || normalizedStatus === 'inprogress' || normalizedStatus === 'in progress') {
      normalizedStatus = 'in-progress';
    }

    const updatedGoal = await WeeklyGoal.findByIdAndUpdate(
      goalId,
      { status: normalizedStatus },
      { new: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found',
      });
    }

    return res.status(200).json({
      message: 'Goal status updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating goal status',
      error: error.message,
    });
  }
};
