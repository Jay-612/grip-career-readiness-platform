import mongoose from 'mongoose';
import DepartmentEvent from '../model/DepartmentEvent.js';
import User from '../model/User.js';
import FacultyProfile from '../model/FacultyProfile.js';
import StudentProfile from '../model/StudentProfile.js';
import { notifyStudentsOfNewEvent, getEligibleStudentUserIds } from '../services/eventReminderService.js';

// ─── Schedule Improvement Event (POST /events or /api/events) ─────────────────
export const createEvent = async (req, res) => {
  try {
    const {
      hodId,
      title,
      targetSkill,
      date,
      time,
      venue,
      description,
      eventType,
      audienceType,
      targetDepartment,
      targetSemester,
    } = req.body;

    const effectiveHodId = hodId || req.user?.id || req.user?._id;

    // 1. Validate required fields
    if (!effectiveHodId || !title || !date) {
      return res.status(400).json({
        success: false,
        message: 'hodId, title, and date are required fields',
      });
    }

    // 2. Validate effectiveHodId format
    if (!mongoose.Types.ObjectId.isValid(effectiveHodId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid HOD ID format',
      });
    }

    // 3. Verify user exists and has faculty or admin role
    const hodUser = await User.findById(effectiveHodId);
    if (!hodUser) {
      return res.status(404).json({
        success: false,
        message: 'HOD or creator user not found',
      });
    }

    // Allow Admin or Faculty (with isHOD)
    if (hodUser.role !== 'admin') {
      if (hodUser.role !== 'faculty') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. The specified user is not authorized to create events',
        });
      }

      // 4. Verify user has isHOD: true in FacultyProfile
      const facultyProfile = await FacultyProfile.findOne({ facultyId: effectiveHodId });
      if (!facultyProfile || !facultyProfile.isHOD) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only faculty members with HOD status (isHOD: true) or Admins can schedule department events',
        });
      }
    }

    // 5. Validate event date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided',
      });
    }

    // Normalize audience targeting
    const cleanAudienceType = ['all_students', 'department', 'semester', 'department_semester'].includes(audienceType)
      ? audienceType
      : 'all_students';

    // 6. Create the department event
    const event = await DepartmentEvent.create({
      hodId: effectiveHodId,
      title: title.trim(),
      targetSkill: targetSkill ? targetSkill.trim() : 'General Technical Readiness',
      date: parsedDate,
      time: time ? time.trim() : '11:00 AM',
      venue: venue ? venue.trim() : 'Seminar Hall',
      description: description ? description.trim() : '',
      eventType: eventType ? eventType.trim() : 'Workshop',
      audienceType: cleanAudienceType,
      targetDepartment: targetDepartment ? targetDepartment.trim() : '',
      targetSemester: targetSemester ? Number(targetSemester) : null,
      status: 'scheduled',
      remindersSent: { '24h': false, '1h': false },
    });

    // Populate HOD details for response
    const populatedEvent = await DepartmentEvent.findById(event._id).populate(
      'hodId',
      'name email role'
    );

    // 7. Fire in-app notifications to eligible students asynchronously
    notifyStudentsOfNewEvent(populatedEvent).catch((err) => {
      console.warn('Background notification error on event publish:', err.message);
    });

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
    const { hodId, targetSkill, audienceType, department, semester, upcomingOnly } = req.query;
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

    if (audienceType) {
      filter.audienceType = audienceType;
    }

    if (upcomingOnly === 'true' || upcomingOnly === true) {
      filter.date = { $gte: new Date() };
      filter.status = { $ne: 'cancelled' };
    }

    let events = await DepartmentEvent.find(filter)
      .populate('hodId', 'name email role')
      .sort({ date: 1 });

    // If caller is an authenticated student, filter out events not targeted to them
    if (req.user && req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ studentId: req.user.id });
      const studentDept = (studentProfile?.department || 'Computer Science & Engineering').toLowerCase();
      const studentSem = studentProfile?.semester || 1;

      events = events.filter((e) => {
        const aud = e.audienceType || 'all_students';
        if (aud === 'all_students') return true;
        if (aud === 'department') {
          return !e.targetDepartment || e.targetDepartment.toLowerCase() === studentDept;
        }
        if (aud === 'semester') {
          return !e.targetSemester || e.targetSemester === studentSem;
        }
        if (aud === 'department_semester') {
          const matchDept = !e.targetDepartment || e.targetDepartment.toLowerCase() === studentDept;
          const matchSem = !e.targetSemester || e.targetSemester === studentSem;
          return matchDept && matchSem;
        }
        return true;
      });
    }

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

      if (hodUser.role !== 'faculty') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. The specified user is not a faculty member',
        });
      }

      const facultyProfile = await FacultyProfile.findOne({ facultyId: hodId });
      if (!facultyProfile || !facultyProfile.isHOD) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only faculty members with HOD status (isHOD: true) can schedule or be assigned to department events',
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
