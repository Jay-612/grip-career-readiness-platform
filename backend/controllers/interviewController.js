import mongoose from 'mongoose';
import MockInterview from '../model/MockInterview.js';
import User from '../model/User.js';
import googleCalendarService from '../services/googleCalendarService.js';

// ─── POST /api/appointments — Request Mock Interview (Status: Pending) ──
export const scheduleMockInterview = async (req, res) => {
  try {
    const { date, time, facultyId, duration = 45 } = req.body;
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

    // Verify interviewer exists and has faculty role
    const facultyUser = await User.findById(facultyId);
    if (!facultyUser) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found',
      });
    }

    // Construct Date object from date and time strings (supports any arbitrary time)
    let dateTime;
    if (date.includes('T')) {
      dateTime = new Date(date);
    } else {
      dateTime = new Date(`${date}T${time.length === 5 ? `${time}:00` : time}`);
    }

    if (isNaN(dateTime.getTime())) {
      dateTime = new Date(`${date} ${time}`);
      if (isNaN(dateTime.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date or time format provided',
        });
      }
    }

    // Appointment starts in pending status with no meet link generated yet.
    // The Google Meet link is generated strictly when the faculty accepts.
    const createdInterview = await MockInterview.create({
      studentId,
      interviewerId: facultyId,
      dateTime,
      duration: Number(duration) || 45,
      meetLink: '',
      googleEventId: '',
      calendarHtmlLink: '',
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Mock interview requested successfully. Waiting for faculty acceptance.',
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
    const userRole = (req.user?.role || '').toLowerCase();
    const isStudent = userRole === 'student';
    const now = new Date();
    const EARLY_BUFFER_MS = 5 * 60 * 1000; // 5 minutes prior to session

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

      const startTime = apt.dateTime ? new Date(apt.dateTime) : new Date();
      const durationMs = (apt.duration || 45) * 60 * 1000;
      const endTime = new Date(startTime.getTime() + durationMs + 15 * 60 * 1000);

      // Determine time-gate join status
      let canJoin = false;
      let joinStatusReason = 'PENDING';
      let joinMessage = '';

      if (apt.status === 'pending') {
        canJoin = false;
        joinStatusReason = 'PENDING_FACULTY';
        joinMessage = 'Awaiting faculty acceptance. Link will be generated once accepted.';
      } else if (apt.status === 'cancelled' || apt.status === 'rejected') {
        canJoin = false;
        joinStatusReason = 'CANCELLED';
        joinMessage = 'Session has been cancelled or declined.';
      } else if (apt.status === 'completed') {
        canJoin = false;
        joinStatusReason = 'COMPLETED';
        joinMessage = 'Session has concluded.';
      } else if (!apt.meetLink) {
        canJoin = false;
        joinStatusReason = 'NO_LINK';
        joinMessage = 'Meeting link is being generated.';
      } else if (userRole === 'faculty' || userRole === 'admin') {
        canJoin = true;
        joinStatusReason = 'HOST';
        joinMessage = 'Faculty host access active.';
      } else {
        // Student time check: strictly prevent joining before the scheduled start window (5 min prior)
        if (now.getTime() < startTime.getTime() - EARLY_BUFFER_MS) {
          canJoin = false;
          joinStatusReason = 'EARLY_LOCK';
          const diffMs = startTime.getTime() - now.getTime();
          const diffMins = Math.ceil(diffMs / (60 * 1000));
          const diffHrs = Math.floor(diffMins / 60);
          const remainingMins = diffMins % 60;
          const timeUntil = diffHrs > 0 ? `${diffHrs}h ${remainingMins}m` : `${diffMins}m`;
          joinMessage = `Room unlocks 5 minutes before scheduled start (in ${timeUntil}).`;
        } else if (now.getTime() > endTime.getTime()) {
          canJoin = false;
          joinStatusReason = 'EXPIRED';
          joinMessage = 'Session window has closed.';
        } else {
          canJoin = true;
          joinStatusReason = 'ACTIVE';
          joinMessage = 'Session active now. You can join.';
        }
      }

      // If student and session is not joinable yet, mask the raw meetLink to prevent scraping
      const visibleMeetLink = isStudent && !canJoin ? '' : (apt.meetLink || '');

      return {
        id: apt._id,
        date: dateStr,
        time: timeStr,
        dateTime: apt.dateTime,
        duration: apt.duration || 45,
        status: apt.status,
        meetLink: visibleMeetLink,
        rawMeetLinkAvailable: Boolean(apt.meetLink),
        canJoin,
        joinStatusReason,
        joinMessage,
        opensAt: new Date(startTime.getTime() - EARLY_BUFFER_MS),
        googleEventId: apt.googleEventId || '',
        calendarHtmlLink: isStudent && !canJoin ? '' : (apt.calendarHtmlLink || ''),
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

// ─── PATCH /api/appointments/:id/accept — Faculty Accepts & Generates Meet ──
export const acceptAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { customMeetLink = '' } = req.body || {};
    const currentUserId = (req.user?.id || req.user?.userId || '').toString();
    const userRole = (req.user?.role || '').toLowerCase();

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

    // Verify user is assigned faculty member or admin
    const interviewerIdStr = (appointment.interviewerId?._id || appointment.interviewerId || '').toString();
    if (interviewerIdStr !== currentUserId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the assigned faculty interviewer can accept this request.',
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Appointment cannot be accepted because it is already ${appointment.status}`,
        appointment,
      });
    }

    // Generate Google Calendar Event & Google Meet Room upon faculty acceptance
    const calendarResult = await googleCalendarService.createCalendarEventWithMeet({
      summary: `GRIP Mock Interview: ${appointment.studentId?.name || 'Student'} & ${appointment.interviewerId?.name || 'Faculty'}`,
      description: 'GRIP Career Readiness Platform - Mock Technical Interview Session',
      startDateTime: appointment.dateTime || new Date(),
      durationMinutes: appointment.duration || 45,
      student: appointment.studentId,
      faculty: appointment.interviewerId,
      customMeetLink: customMeetLink?.trim(),
    });

    appointment.status = 'scheduled';
    appointment.meetLink = calendarResult.meetLink || '';
    appointment.googleEventId = calendarResult.eventId || '';
    appointment.calendarHtmlLink = calendarResult.calendarHtmlLink || '';
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Interview request accepted and Google Meet link generated successfully',
      appointment: {
        id: appointment._id,
        status: appointment.status,
        dateTime: appointment.dateTime,
        duration: appointment.duration,
        meetLink: appointment.meetLink,
        googleEventId: appointment.googleEventId,
        calendarHtmlLink: appointment.calendarHtmlLink,
        student: appointment.studentId,
        interviewer: appointment.interviewerId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while accepting interview appointment',
      error: error.message,
    });
  }
};

// ─── PATCH /api/appointments/:id/reject — Faculty Declines Appointment ────
export const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body || {};
    const currentUserId = (req.user?.id || req.user?.userId || '').toString();
    const userRole = (req.user?.role || '').toLowerCase();

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

    const interviewerIdStr = (appointment.interviewerId || '').toString();
    if (interviewerIdStr !== currentUserId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the assigned faculty interviewer can decline this appointment.',
      });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Appointment cannot be declined because it is already ${appointment.status}`,
      });
    }

    appointment.status = 'rejected';
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: 'Interview appointment request declined',
      appointment: {
        id: appointment._id,
        status: appointment.status,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while declining interview appointment',
      error: error.message,
    });
  }
};

// ─── GET /api/appointments/:id/join — Secure Join Gate with Time Check ──
export const joinAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = (req.user?.id || req.user?.userId || '').toString();
    const userRole = (req.user?.role || '').toLowerCase();

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

    const isStudent = (appointment.studentId || '').toString() === currentUserId;
    const isInterviewer = (appointment.interviewerId || '').toString() === currentUserId;
    const isAdmin = userRole === 'admin';

    if (!isStudent && !isInterviewer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant in this mock interview.',
      });
    }

    if (appointment.status === 'pending') {
      return res.status(400).json({
        success: false,
        code: 'APPOINTMENT_PENDING',
        message: 'This interview appointment is still pending faculty acceptance.',
      });
    }

    if (appointment.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        code: 'APPOINTMENT_NOT_ACTIVE',
        message: `This interview appointment is ${appointment.status}.`,
      });
    }

    if (!appointment.meetLink) {
      return res.status(404).json({
        success: false,
        code: 'NO_MEET_LINK',
        message: 'No video meeting link found for this appointment.',
      });
    }

    // Time-gate validation for student: cannot join before scheduled start (with 5-minute pre-session buffer)
    if (isStudent && !isAdmin) {
      const now = new Date();
      const startTime = new Date(appointment.dateTime);
      const EARLY_BUFFER_MS = 5 * 60 * 1000; // 5 min prior
      const durationMs = (appointment.duration || 45) * 60 * 1000;
      const endTime = new Date(startTime.getTime() + durationMs + 15 * 60 * 1000);

      if (now.getTime() < startTime.getTime() - EARLY_BUFFER_MS) {
        const diffMs = startTime.getTime() - now.getTime();
        const diffMins = Math.ceil(diffMs / (60 * 1000));
        return res.status(403).json({
          success: false,
          code: 'EARLY_JOIN_FORBIDDEN',
          message: `You cannot join the meeting before the scheduled time. Room opens 5 minutes before the session (in ${diffMins} minutes).`,
          opensAt: new Date(startTime.getTime() - EARLY_BUFFER_MS),
        });
      }

      if (now.getTime() > endTime.getTime()) {
        return res.status(403).json({
          success: false,
          code: 'SESSION_EXPIRED',
          message: 'This mock interview session window has concluded.',
        });
      }
    }

    return res.status(200).json({
      success: true,
      meetLink: appointment.meetLink,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while checking meeting room access',
      error: error.message,
    });
  }
};

