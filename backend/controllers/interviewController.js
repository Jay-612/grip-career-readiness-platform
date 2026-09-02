import mongoose from 'mongoose';
import MockInterview from '../model/MockInterview.js';
import User from '../model/User.js';

// ─── POST /api/appointments — Schedule Mock Interview ─────────────
export const scheduleMockInterview = async (req, res) => {
  try {
    const { date, time, facultyId } = req.body;
    const studentId = req.user?.id || req.user?.userId;

    if (!date || !time || !facultyId) {
      return res.status(400).json({
        success: false,
        message: 'date, time, and facultyId are required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(facultyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid faculty ID format',
      });
    }

    // Verify interviewer exists
    const facultyUser = await User.findById(facultyId);
    if (!facultyUser) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found',
      });
    }

    // Construct Date object from date and time strings
    let dateTime;
    if (date.includes('T')) {
      dateTime = new Date(date);
    } else {
      dateTime = new Date(`${date}T${time}:00`);
    }

    if (isNaN(dateTime.getTime())) {
      // Fallback if parsing with seconds failed
      dateTime = new Date(`${date} ${time}`);
      if (isNaN(dateTime.getTime())) {
        dateTime = new Date();
      }
    }

    await MockInterview.create({
      studentId,
      interviewerId: facultyId,
      dateTime,
      status: 'scheduled',
    });

    return res.status(201).json({
      message: 'Appointment confirmed',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while scheduling mock interview appointment',
      error: error.message,
    });
  }
};

// ─── GET /api/appointments — Get Appointments History ─────────────
export const getAppointments = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const appointments = await MockInterview.find({
      $or: [{ studentId: currentUserId }, { interviewerId: currentUserId }],
    })
      .populate('studentId', 'name email')
      .populate('interviewerId', 'name email')
      .sort({ dateTime: -1 });

    const formattedAppointments = appointments.map((apt) => {
      const dt = apt.dateTime ? new Date(apt.dateTime) : new Date();
      const dateStr = !isNaN(dt.getTime()) ? dt.toISOString().split('T')[0] : '';
      const timeStr = !isNaN(dt.getTime())
        ? dt.toTimeString().slice(0, 5)
        : '';

      return {
        id: apt._id,
        date: dateStr,
        time: timeStr,
        status: apt.status,
      };
    });

    return res.status(200).json(formattedAppointments);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments',
      error: error.message,
    });
  }
};
