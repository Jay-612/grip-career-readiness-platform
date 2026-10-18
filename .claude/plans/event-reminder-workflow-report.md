# Event Reminder Workflow

## Existing Event Architecture

The GRIP platform initially provided a basic department event infrastructure:
- **Model**: `DepartmentEvent` in [DepartmentEvent.js](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/model/DepartmentEvent.js) tracked basic event properties (`title`, `department`, `eventDate`, `createdBy`, `attendees`).
- **Controllers & Endpoints**:
  - `departmentEventController.js`: Provided `createEvent`, `getAllEvents`, and `getUpcomingEvents`.
  - `adminController.js`: Provided administrative event management capabilities (`/api/admin/events`).
  - `eventRoutes.js`: Exposed `/api/events` endpoints.
- **Frontend**:
  - HOD analytics included a modal dialog (`ScheduleEventModal.jsx`) used to create department sessions.
  - Admin portal included an `EventManagementPage.jsx` for scheduling institution-wide events.
  - Student side lacked direct event visibility, notifications, and event details screens.

To fulfill the requirements while preserving architectural integrity, we extended the existing `DepartmentEvent` schema rather than creating a disparate collection.

---

## Audience Targeting

Events now support precise student targeting with backend-enforced filtering:
- **`audienceType` options**:
  - `all_students`: Targets all active students across all departments and semesters.
  - `department`: Targets students matching `targetDepartment` (or event `department`).
  - `semester`: Targets students matching `targetSemester` across any department.
  - `department_semester`: Targets students matching both department and semester concurrently (e.g., "CSE — Semester 5").
- **Backend Resolution (`eventReminderService.js`)**:
  - Inspects `StudentProfile` records mapped to active student `User` records.
  - Performs intelligent regex and normalized department matching (e.g., matching `"CSE"` with `"Computer Science & Engineering"`).
  - Handles legacy profiles where department defaults to CSE.
- **Progressive Disclosure in UI**:
  - Both HOD (`ScheduleEventModal.jsx`) and Admin (`EventManagementPage.jsx`) interfaces feature an audience selector.
  - When `department` or `department_semester` is selected, a department dropdown appears.
  - When `semester` or `department_semester` is selected, a semester dropdown appears.
  - Default view remains clean and uncluttered.

---

## Notification Architecture

A unified and durable notification system was introduced without creating fragmented notification silos:
- **Storage Model**: `Notification` in [Notification.js](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/model/Notification.js):
  - Fields: `userId`, `type` (`new_event`, `event_reminder`, `guidance_reply`, `interview_update`, `general`), `eventId`, `title`, `message`, `actionPath`, `read`, `readAt`, and timestamps.
  - Lean design: Contains navigation pointer (`actionPath: /student/events/:eventId` and `eventId`) rather than duplicating entire event records.
- **TopBar Bell Integration ([TopBar.jsx](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/layout/TopBar.jsx))**:
  - Queries `GET /api/notifications` upon mount and periodically refreshes.
  - Displays unread notification count badge in real time.
  - Renders unified feed including "New Event", "Event Reminder", "Guidance Reply", and "Interview Update".
  - Clicking a notification marks it as read via `PUT /api/notifications/:id/read` and routes directly to the relevant event details page.

---

## Student Dashboard Integration

To avoid dashboard overload while keeping students informed:
- **Compact Widget**: `UpcomingEventsSection` in [UpcomingEventsSection.jsx](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/student/dashboard/UpcomingEventsSection.jsx).
- **Hard Limit**: Renders at most **2 upcoming relevant events** on the main student dashboard ([Dashboard.jsx](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/pages/Student/Dashboard.jsx)).
- **Event Information Displayed**:
  - Event Title
  - Date & Time
  - Venue / Location
  - Target Audience Badge
  - Direct "View Details →" button linking to `/student/events/:eventId`
- **Overflow Navigation**: When more than 2 relevant events exist, a clean "View All Events →" link routes to `/student/events`.
- **Student Event Details Screen**: [StudentEventDetailPage.jsx](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/pages/Student/StudentEventDetailPage.jsx) provides a dedicated, clean view displaying description, organizer, venue, and audience details without exposing administrative or editing controls.

---

## Reminder Scheduling

- **Durable Background Scanner**:
  - Node.js `setTimeout()` was deliberately avoided to ensure reliability across server reboots, scaling, and crashes.
  - A background periodic runner (`runEventReminderScan()`) executes every 5 minutes in [backend/index.js](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/index.js).
  - Inspects upcoming events using database timestamp arithmetic.
  - **Sensible Reminder Points**:
    - **24-hour reminder**: Triggers when `eventDate` is within `[now, now + 24 hours]`.
    - **1-hour reminder**: Triggers when `eventDate` is within `[now, now + 1 hour]`.

---

## Duplicate Prevention

Idempotency and anti-noise safeguards operate at both schema and service layers:
- **Event Level Tracking**:
  - `DepartmentEvent` schema tracks `remindersSent: { '24h': Boolean, '1h': Boolean }`.
  - Once a reminder batch executes, `remindersSent[reminderType]` is set to `true`.
- **Notification Level Deduplication**:
  - Compound database index `{ userId: 1, eventId: 1, type: 1 }` prevents duplicate notifications per student per event.
  - The notification creation pipeline uses `find({ userId, eventId, type })` check before inserting.
- **Cancelled & Past Event Filtering**:
  - Status check excludes events marked `status: 'cancelled'` or `status: 'completed'`.
  - Timestamp condition `eventDate: { $gt: now }` strictly prevents alerts for past events.

---

## Authorization

- **Event Creation**:
  - Restricted to authenticated users with `role: 'hod'`, `role: 'faculty'`, or `role: 'admin'`.
- **Event Viewing**:
  - Public or authenticated student access via `optionalAuth` middleware on `/api/events`.
  - When accessed by an authenticated student, `/api/events` automatically applies audience criteria matching the student's department and semester.
  - Admin editing/management controls are isolated to `/api/admin/events` and are never exposed in student views.
- **Notification API**:
  - Scoped to `req.user._id` via `authenticateToken` middleware, guaranteeing students can only read, fetch, or update their own notifications.

---

## Tests

An end-to-end automated verification script was developed and executed in [scripts/verify-event-reminder-workflow.js](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/scripts/verify-event-reminder-workflow.js):
1. **Stage 1 (HOD Event Creation)**: Successfully created targeted event `"CSE Placement Preparation Workshop - 10 Oct 2026"` for `department: "Computer Science & Engineering"` and `semester: 5`.
2. **Stage 2 (Audience Notification Check)**: Targeted student (`student@grip.edu`, Semester 5 CSE) immediately received the `"New Event: CSE Placement Preparation Workshop - 10 Oct 2026 — 10 Oct 2026 at 11:00 AM"` notification.
3. **Stage 3 (Audience Exclusion Check)**: Non-matching student (`student_other@grip.edu`, Semester 3 IT) received zero notifications.
4. **Stage 4 (Student Dashboard & Audience Filtering)**: Targeted student fetched events from `/api/events` and received the workshop; non-matching student received an empty list.
5. **Stage 5 (Event Details Access)**: Student successfully fetched event details via `/api/events/:eventId` verifying organizer, venue, and description without administrative controls.
6. **Stage 6 (24-Hour Reminder Generation)**: Created event scheduled 12 hours ahead. Reminder scan triggered; targeted student received `"Reminder: Placement Workshop Tomorrow"`.
7. **Stage 7 (Duplicate Prevention)**: Triggered reminder scan a second time; no redundant notifications generated (`remindersSent['24h']` prevented re-issuing).
8. **Stage 8 (Notification Read State)**: Student marked notification as read; verified unread counter decreased and `read: true` persisted.
9. **Stage 9 (Cancelled Event Verification)**: Created event in reminder window with `status: 'cancelled'`; confirmed zero reminder notifications were generated.

---

## Remaining Issues

None. All backend APIs, durable reminder services, frontend student dashboard components, event detail views, TopBar notification integrations, and progressive disclosure forms are fully implemented, verified, and operational.
