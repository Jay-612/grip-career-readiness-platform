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

    const createdInterview = await MockInterview.create({
      studentId,
      interviewerId: facultyId,
      dateTime,
      status: 'scheduled',
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment confirmed',
      appointment: createdInterview,
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
        dateTime: apt.dateTime,
        status: apt.status,
        meetLink: apt.meetLink || '',
        student: apt.studentId
          ? {
              id: apt.studentId._id,
              name: apt.studentId.name,
              email: apt.studentId.email,
            }
          : null,
        interviewer: apt.interviewerId
          ? {
              id: apt.interviewerId._id,
              name: apt.interviewerId.name,
              email: apt.interviewerId.email,
            }
          : null,
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

// ─── PATCH /api/appointments/:id/cancel — Cancel Appointment ────────
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = (req.user.id || req.user.userId || '').toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format',
      });
    }

    const appointment = await MockInterview.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Only the student, the interviewer, or an admin can cancel
    const studentIdStr = (appointment.studentId || '').toString();
    const interviewerIdStr = (appointment.interviewerId || '').toString();

    if (
      studentIdStr !== currentUserId &&
      interviewerIdStr !== currentUserId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own appointments.',
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled',
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: {
        id: appointment._id,
        status: appointment.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while cancelling appointment',
      error: error.message,
    });
  }
};

