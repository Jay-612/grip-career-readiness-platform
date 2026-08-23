import mongoose from 'mongoose';
import DepartmentEvent from '../model/DepartmentEvent.js';
import User from '../model/User.js';

// ─── Schedule Improvement Event (POST /events or /api/events) ─────────────────
export const createEvent = async (req, res) => {
  try {
    const { hodId, title, targetSkill, date } = req.body;

    // 1. Validate required fields
    if (!hodId || !title || !date) {
      return res.status(400).json({
        success: false,
        message: 'hodId, title, and date are required fields',
      });
    }

    // 2. Validate hodId format
    if (!mongoose.Types.ObjectId.isValid(hodId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid HOD ID format',
      });
    }

    // 3. Verify HOD user exists in database
    const hodUser = await User.findById(hodId);
    if (!hodUser) {
      return res.status(404).json({
        success: false,
        message: 'HOD user not found',
      });
    }

    // 4. Validate event date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided',
      });
    }

    // 5. Create the department event
    const event = await DepartmentEvent.create({
      hodId,
      title: title.trim(),
      targetSkill: targetSkill ? targetSkill.trim() : '',
      date: parsedDate,
    });

    // Populate HOD details for response
    const populatedEvent = await DepartmentEvent.findById(event._id).populate(
      'hodId',
      'name email role'
    );

    res.status(201).json({
      success: true,
      message: 'Department event scheduled successfully',
      event: populatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while scheduling department event',
      error: error.message,
    });
  }
};

// ─── Get All Department Events (GET /events or /api/events) ───────────────────
export const getAllEvents = async (req, res) => {
  try {
    const { hodId, targetSkill } = req.query;
    const filter = {};

    if (hodId) {
      if (!mongoose.Types.ObjectId.isValid(hodId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid HOD ID format in query parameter',
        });
      }
      filter.hodId = hodId;
    }

    if (targetSkill) {
      filter.targetSkill = { $regex: targetSkill, $options: 'i' };
    }

    const events = await DepartmentEvent.find(filter)
      .populate('hodId', 'name email role')
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department events',
      error: error.message,
    });
  }
};

// ─── Get Department Event By ID (GET /events/:id or /api/events/:id) ──────────
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format',
      });
    }

    const event = await DepartmentEvent.findById(id).populate(
      'hodId',
      'name email role'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Department event not found',
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event details',
      error: error.message,
    });
  }
};

// ─── Update Department Event (PUT /events/:id or /api/events/:id) ─────────────
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { hodId, title, targetSkill, date } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format',
      });
    }

    const updateFields = {};

    if (hodId) {
      if (!mongoose.Types.ObjectId.isValid(hodId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid HOD ID format',
        });
      }
      const hodUser = await User.findById(hodId);
      if (!hodUser) {
        return res.status(404).json({
          success: false,
          message: 'HOD user not found',
        });
      }
      updateFields.hodId = hodId;
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
        });
      }
      updateFields.title = title.trim();
    }

    if (targetSkill !== undefined) {
      updateFields.targetSkill = targetSkill.trim();
    }

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format provided',
        });
      }
      updateFields.date = parsedDate;
    }

    const updatedEvent = await DepartmentEvent.findByIdAndUpdate(
      id,
      updateFields,
      { returnDocument: 'after', runValidators: true }
    ).populate('hodId', 'name email role');

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Department event not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating department event',
      error: error.message,
    });
  }
};

// ─── Delete Department Event (DELETE /events/:id or /api/events/:id) ──────────
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Event ID format',
      });
    }

    const deletedEvent = await DepartmentEvent.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Department event not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting department event',
      error: error.message,
    });
  }
};
