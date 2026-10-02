import mongoose from 'mongoose';
import MockInterview from '../model/MockInterview.js';
import User from '../model/User.js';
import googleCalendarService from '../services/googleCalendarService.js';

// ─── POST /api/appointments — Schedule Mock Interview ─────────────
export const scheduleMockInterview = async (req, res) => {
  try {
    const { date, time, facultyId, duration = 45, customMeetLink = '' } = req.body;
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

    // Fetch student user
    const studentUser = await User.findById(studentId);

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

    // Automatically provision Google Calendar Event and Google Meet Room
    const calendarResult = await googleCalendarService.createCalendarEventWithMeet({
      summary: `GRIP Mock Interview: ${studentUser?.name || 'Student'} & ${facultyUser?.name || 'Faculty'}`,
      description: 'GRIP Career Readiness Platform - Mock Technical Interview Session',
      startDateTime: dateTime,
      durationMinutes: Number(duration) || 45,
      student: studentUser,
      faculty: facultyUser,
      customMeetLink: customMeetLink?.trim(),
    });

    const createdInterview = await MockInterview.create({
      studentId,
      interviewerId: facultyId,
      dateTime,
      duration: Number(duration) || 45,
      meetLink: calendarResult.meetLink || '',
      googleEventId: calendarResult.eventId || '',
      calendarHtmlLink: calendarResult.calendarHtmlLink || '',
      status: 'scheduled',
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment confirmed with Google Meet room',
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
        duration: apt.duration || 45,
        status: apt.status,
        meetLink: apt.meetLink || '',
        googleEventId: apt.googleEventId || '',
        calendarHtmlLink: apt.calendarHtmlLink || '',
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

// ─── POST /api/appointments/:id/create-meet — Generate / Refresh Google Meet ──
export const createOrRefreshMeetLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { customMeetLink } = req.body || {};
    const currentUserId = (req.user?.id || req.user?.userId || '').toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format',
      });
    }

    const appointment = await MockInterview.findById(id)
      .populate('studentId', 'name email')
      .populate('interviewerId', 'name email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Authorization check
    const studentIdStr = (appointment.studentId?._id || appointment.studentId || '').toString();
    const interviewerIdStr = (appointment.interviewerId?._id || appointment.interviewerId || '').toString();

    if (
      studentIdStr !== currentUserId &&
      interviewerIdStr !== currentUserId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only manage Google Meet for your own appointments.',
      });
    }

    // If user provided a custom Meet link (e.g. from meet.google.com/new), save it directly
    if (customMeetLink && typeof customMeetLink === 'string' && customMeetLink.trim()) {
      let cleanLink = customMeetLink.trim();
      if (!/^https?:\/\//i.test(cleanLink)) {
        cleanLink = `https://${cleanLink}`;
      }
      appointment.meetLink = cleanLink;
      await appointment.save();

      return res.status(200).json({
        success: true,
        message: 'Meeting room link updated successfully',
        meetLink: appointment.meetLink,
        googleEventId: appointment.googleEventId,
        calendarHtmlLink: appointment.calendarHtmlLink,
      });
    }

    // Call calendar service
    const calendarResult = await googleCalendarService.createCalendarEventWithMeet({
      summary: `GRIP Mock Interview: ${appointment.studentId?.name || 'Student'} & ${appointment.interviewerId?.name || 'Faculty'}`,
      description: 'GRIP Career Readiness Platform - Mock Technical Interview Session',
      startDateTime: appointment.dateTime || new Date(),
      durationMinutes: appointment.duration || 45,
      student: appointment.studentId,
      faculty: appointment.interviewerId,
    });

    appointment.meetLink = calendarResult.meetLink;
    appointment.googleEventId = calendarResult.eventId;
    appointment.calendarHtmlLink = calendarResult.calendarHtmlLink;
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Meeting room generated successfully',
      meetLink: appointment.meetLink,
      googleEventId: appointment.googleEventId,
      calendarHtmlLink: appointment.calendarHtmlLink,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while generating Google Meet link',
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

    // If Google Calendar event exists, delete it
    if (appointment.googleEventId) {
      await googleCalendarService.deleteCalendarEvent(appointment.googleEventId);
    }

    appointment.status = 'cancelled';
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully and removed from calendar',
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

