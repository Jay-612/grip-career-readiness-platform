import DepartmentEvent from '../model/DepartmentEvent.js';
import StudentProfile from '../model/StudentProfile.js';
import Notification from '../model/Notification.js';

/**
 * Identify all student user IDs matching an event's audience criteria.
 *
 * @param {Object} event - DepartmentEvent document
 * @returns {Promise<Array<mongoose.Types.ObjectId>>} List of matching student user IDs
 */
export async function getEligibleStudentUserIds(event) {
  const filter = {};

  const audienceType = event.audienceType || 'all_students';

  if (audienceType === 'department') {
    if (event.targetDepartment) {
      const isCSE = /computer science/i.test(event.targetDepartment);
      if (isCSE) {
        filter.$or = [
          { department: { $regex: new RegExp(`^${event.targetDepartment.trim()}$`, 'i') } },
          { department: { $exists: false } },
          { department: null },
          { department: '' },
        ];
      } else {
        filter.department = { $regex: new RegExp(`^${event.targetDepartment.trim()}$`, 'i') };
      }
    }
  } else if (audienceType === 'semester') {
    if (event.targetSemester) {
      filter.semester = Number(event.targetSemester);
    }
  } else if (audienceType === 'department_semester') {
    if (event.targetSemester) {
      filter.semester = Number(event.targetSemester);
    }
    if (event.targetDepartment) {
      const isCSE = /computer science/i.test(event.targetDepartment);
      if (isCSE) {
        filter.$or = [
          { department: { $regex: new RegExp(`^${event.targetDepartment.trim()}$`, 'i') } },
          { department: { $exists: false } },
          { department: null },
          { department: '' },
        ];
      } else {
        filter.department = { $regex: new RegExp(`^${event.targetDepartment.trim()}$`, 'i') };
      }
    }
  }
  // 'all_students' leaves filter empty, matching all student profiles

  const studentProfiles = await StudentProfile.find(filter).select('studentId department semester');
  return studentProfiles.map((sp) => sp.studentId).filter(Boolean);
}

/**
 * Dispatch "New Event" publication notifications to matching audience.
 *
 * @param {Object} event - Created/Published DepartmentEvent document
 */
export async function notifyStudentsOfNewEvent(event) {
  try {
    const studentUserIds = await getEligibleStudentUserIds(event);
    if (!studentUserIds.length) return 0;

    const eventDate = new Date(event.date);
    const dateFormatted = isNaN(eventDate.getTime())
      ? ''
      : eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeFormatted = event.time || '11:00 AM';

    const title = 'New Event';
    const message = `New Event: ${event.title} — ${dateFormatted} at ${timeFormatted}`;
    const actionPath = `/student/events/${event._id || event.id}`;

    const notificationsToInsert = studentUserIds.map((userId) => ({
      userId,
      type: 'new_event',
      eventId: event._id || event.id,
      title,
      message,
      actionPath,
      read: false,
    }));

    // Insert idempotently (ignore duplicates if any)
    const result = await Notification.insertMany(notificationsToInsert, { ordered: false }).catch((err) => {
      // If some duplicates existed, insertMany throws with insertedDocs
      return err.insertedDocs || [];
    });

    return Array.isArray(result) ? result.length : notificationsToInsert.length;
  } catch (err) {
    console.error('Error dispatching new event notifications:', err);
    return 0;
  }
}

/**
 * Dispatch upcoming event reminders for approaching events.
 * Idempotent: checks and flips `remindersSent['24h']` / `remindersSent['1h']`.
 */
export async function runEventReminderScan() {
  const now = new Date();
  const summary = { checked: 0, reminders24h: 0, reminders1h: 0 };

  try {
    // Only scheduled, future events within the next 26 hours
    const maxLookahead = new Date(now.getTime() + 26 * 60 * 60 * 1000);
    const upcomingEvents = await DepartmentEvent.find({
      status: 'scheduled',
      date: { $gte: now, $lte: maxLookahead },
    });

    summary.checked = upcomingEvents.length;

    for (const event of upcomingEvents) {
      const eventTime = new Date(event.date).getTime();
      const diffMs = eventTime - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // ─── 24-Hour Reminder (Between 1 hour and 25 hours before event) ───
      if (diffHours <= 25 && diffHours > 1 && !event.remindersSent?.['24h']) {
        const studentUserIds = await getEligibleStudentUserIds(event);
        if (studentUserIds.length > 0) {
          const dateFormatted = new Date(event.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const timeFormatted = event.time || '11:00 AM';

          const title = 'Event Reminder';
          const message = `Reminder (Tomorrow): "${event.title}" is on ${dateFormatted} at ${timeFormatted} (${event.venue || 'Seminar Hall'}).`;
          const actionPath = `/student/events/${event._id || event.id}`;

          const notifications = studentUserIds.map((userId) => ({
            userId,
            type: 'event_reminder',
            eventId: event._id,
            title,
            message,
            actionPath,
            read: false,
          }));

          await Notification.insertMany(notifications, { ordered: false }).catch(() => {});
          summary.reminders24h += notifications.length;
        }

        // Mark 24h reminder sent on the event document
        await DepartmentEvent.updateOne(
          { _id: event._id },
          { $set: { 'remindersSent.24h': true } }
        );
      }

      // ─── 1-Hour Reminder (Within 1.5 hours and >= 0) ───
      if (diffHours <= 1.5 && diffHours >= 0 && !event.remindersSent?.['1h']) {
        const studentUserIds = await getEligibleStudentUserIds(event);
        if (studentUserIds.length > 0) {
          const timeFormatted = event.time || '11:00 AM';

          const title = 'Event Starting Soon';
          const message = `Starting Soon: "${event.title}" begins at ${timeFormatted} today in ${event.venue || 'Seminar Hall'}!`;
          const actionPath = `/student/events/${event._id || event.id}`;

          const notifications = studentUserIds.map((userId) => ({
            userId,
            type: 'event_reminder',
            eventId: event._id,
            title,
            message,
            actionPath,
            read: false,
          }));

          await Notification.insertMany(notifications, { ordered: false }).catch(() => {});
          summary.reminders1h += notifications.length;
        }

        // Mark 1h reminder sent on the event document
        await DepartmentEvent.updateOne(
          { _id: event._id },
          { $set: { 'remindersSent.1h': true } }
        );
      }
    }

    return summary;
  } catch (err) {
    console.error('Error during event reminder scan:', err);
    return summary;
  }
}
