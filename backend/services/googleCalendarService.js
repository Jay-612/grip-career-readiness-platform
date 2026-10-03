import { google } from 'googleapis';
import crypto from 'crypto';
import { getGoogleOAuthClient, isGoogleConfigured } from '../config/googleOAuth.js';

/**
 * Generate an instant, active WebRTC room URL (Jitsi Meet).
 * NEVER returns fake meet.google.com URLs that error on Google's servers.
 */
export const generateSimulatedMeetLink = () => {
  const roomId = crypto.randomUUID().slice(0, 10);
  return `https://meet.jit.si/grip-mock-interview-${roomId}`;
};

/**
 * Generate a Google Calendar Web Add-To-Calendar link
 */
export const generateWebCalendarLink = ({ summary, description, startDateTime, endDateTime, meetLink }) => {
  try {
    const formatTime = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const startStr = formatTime(startDateTime);
    const endStr = formatTime(endDateTime);
    const title = encodeURIComponent(summary || 'GRIP Mock Technical Interview');
    const details = encodeURIComponent(
      `${description || 'GRIP Platform Mock Interview Session'}\n\nJoin Video Room: ${meetLink}`
    );
    const location = encodeURIComponent(meetLink);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  } catch {
    return 'https://calendar.google.com';
  }
};

/**
 * Create a Google Calendar Event with an attached video room
 *
 * @param {Object} params
 * @param {string} params.summary - Event title
 * @param {string} params.description - Event description/notes
 * @param {Date} params.startDateTime - Start date and time
 * @param {number} [params.durationMinutes=45] - Duration in minutes
 * @param {Object} [params.student] - Student user object ({ name, email })
 * @param {Object} [params.faculty] - Faculty user object ({ name, email })
 * @param {string} [params.customMeetLink] - User-supplied custom meeting link (e.g. from meet.google.com/new)
 * @returns {Promise<{ success: boolean, eventId: string, meetLink: string, calendarHtmlLink: string, isSimulated: boolean, meetingType: string, meetingProvider: string }>}
 */
export const createCalendarEventWithMeet = async ({
  summary = 'GRIP Mock Technical Interview',
  description = 'Mock technical interview and performance evaluation on the GRIP platform.',
  startDateTime,
  durationMinutes = 45,
  student = null,
  faculty = null,
  customMeetLink = '',
}) => {
  const start = startDateTime instanceof Date ? startDateTime : new Date(startDateTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  // If a valid custom meeting link was explicitly supplied by user (e.g., from meet.google.com/new)
  if (customMeetLink && typeof customMeetLink === 'string' && customMeetLink.trim()) {
    let cleanLink = customMeetLink.trim();
    if (!/^https?:\/\//i.test(cleanLink)) {
      cleanLink = `https://${cleanLink}`;
    }
    const isGoogleMeet = cleanLink.includes('meet.google.com');
    const simulatedEventId = `grip-custom-${crypto.randomUUID().slice(0, 12)}`;
    return {
      success: true,
      eventId: simulatedEventId,
      meetLink: cleanLink,
      meetingType: isGoogleMeet ? 'google_meet' : 'custom_webrtc',
      meetingProvider: isGoogleMeet ? 'Google Meet (Custom Link)' : 'Custom Video Room',
      calendarHtmlLink: generateWebCalendarLink({
        summary,
        description,
        startDateTime: start,
        endDateTime: end,
        meetLink: cleanLink,
      }),
      isSimulated: false,
    };
  }

  const auth = getGoogleOAuthClient();

  // ─── If Google OAuth is configured, call Google Calendar API ───
  if (auth) {
    try {
      const calendar = google.calendar({ version: 'v3', auth });

      const attendees = [];
      if (student?.email) {
        attendees.push({
          email: student.email,
          displayName: student.name || 'Student Candidate',
        });
      }
      if (faculty?.email) {
        attendees.push({
          email: faculty.email,
          displayName: faculty.name || 'Faculty Evaluator',
        });
      }

      const eventPayload = {
        summary,
        description: `${description}\n\nStudent: ${student?.name || 'N/A'} (${student?.email || 'N/A'})\nEvaluator: ${faculty?.name || 'N/A'} (${faculty?.email || 'N/A'})\nPlatform: GRIP Career Readiness Platform`,
        start: {
          dateTime: start.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        attendees,
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        sendUpdates: 'all',
        requestBody: eventPayload,
      });

      const data = response.data;
      const hangoutLink =
        data.hangoutLink ||
        data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri;

      console.log('✓ Successfully created Google Calendar event with Google Meet:', hangoutLink);

      return {
        success: true,
        eventId: data.id,
        meetLink: hangoutLink || '',
        meetingType: 'google_meet',
        meetingProvider: 'Google Meet',
        calendarHtmlLink: data.htmlLink || generateWebCalendarLink({ summary, description, startDateTime: start, endDateTime: end, meetLink: hangoutLink }),
        isSimulated: false,
      };
    } catch (apiError) {
      console.warn('⚠️ Google Calendar API call failed (falling back to instant WebRTC room):', apiError.message);
    }
  }

  // ─── Fallback Mode (When Google OAuth is unconfigured in .env) ───
  // Note: Random fake strings on meet.google.com are rejected with "Invalid meeting code".
  // We provide an active, instant, working WebRTC room fallback (no login/keys required)
  // or allow faculty/students to paste their real Google Meet link created at meet.google.com/new.
  const simulatedEventId = `grip-${crypto.randomUUID().slice(0, 10)}`;
  const workingVideoRoom = `https://meet.jit.si/grip-mock-interview-${simulatedEventId}`;
  const calendarHtmlLink = generateWebCalendarLink({
    summary,
    description,
    startDateTime: start,
    endDateTime: end,
    meetLink: workingVideoRoom,
  });

  return {
    success: true,
    eventId: simulatedEventId,
    meetLink: workingVideoRoom,
    meetingType: 'instant_webrtc',
    meetingProvider: 'Instant WebRTC Room (Jitsi Meet)',
    calendarHtmlLink,
    isSimulated: true,
  };
};

/**
 * Delete a Calendar Event when an appointment is cancelled
 *
 * @param {string} eventId - Google Calendar Event ID
 * @returns {Promise<{ success: boolean }>}
 */
export const deleteCalendarEvent = async (eventId) => {
  if (!eventId || eventId.startsWith('grip-sim-')) {
    return { success: true, isSimulated: true };
  }

  const auth = getGoogleOAuthClient();
  if (!auth) {
    return { success: true, isSimulated: true };
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });
    console.log(`✓ Deleted Google Calendar event ${eventId}`);
    return { success: true, isSimulated: false };
  } catch (error) {
    console.warn(`Could not delete Google Calendar event ${eventId}:`, error.message);
    return { success: false, error: error.message };
  }
};

export default {
  createCalendarEventWithMeet,
  deleteCalendarEvent,
  generateSimulatedMeetLink,
  generateWebCalendarLink,
};
