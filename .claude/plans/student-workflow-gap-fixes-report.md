# Student Workflow Gap Fixes

## Overview
This engineering report documents the implementation and verification of three connected core student workflows on the GRIP Campus platform:
1. **Mock Interview Cancellation & Slot Release**: Safe, role-aware cancellation for students and faculty with atomic race condition protection, immediate slot unblocking, evaluation shielding, and bidirectional notifications.
2. **First-Time-Only Readiness Quiz**: Persistent database tracking of onboarding diagnostic quiz completion (`readinessQuizCompletedAt`), preventing annoying repeated login interruptions while preserving manual retake in Career Compass.
3. **Unified Student Guidance**: Segregated guidance paths for Faculty vs. Alumni Mentors, dedicated inquiry threads with follow-up support, isolated faculty remedial reviews, and role-enforced access control (IDOR security).

All updates reused existing MongoDB models, controller infrastructure, notification services, and React component styling without disrupting existing database records or redesigning unrelated pages.

---

## First-Time Quiz

### Root Cause
1. Previously, the readiness quiz modal check relied on transient client-side state and navigation query flags (`takeQuiz=true` in `AuthContext.jsx`), combined with an inconsistent check on `user.hasCompletedQuiz`.
2. When submitting the quiz, if the `CareerRoadmap` collection was unseeded (0 records in MongoDB), `careerController.submitCareerQuiz` triggered an early return fallback block that did not update `StudentProfile.readinessQuizCompletedAt` or return `hasCompletedQuiz: true`.
3. In `Dashboard.jsx`, the modal handler did not reset `quizResult` or close the modal immediately on submission, and only set `quizModalOpen(true)` without ever explicitly ensuring `setQuizModalOpen(false)` when `hasCompleted` was true.

### Persistence Strategy
1. **Model Persistence**: Added `readinessQuizCompletedAt: { type: Date, default: null }` to [`StudentProfile.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/model/StudentProfile.js).
2. **Universal Quiz Submission Persistence**: In [`careerController.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/controllers/careerController.js), the fallback logic now assigns `bestMatch` without early returning. Every submission by an authenticated student updates `readinessQuizCompletedAt`, sets the trajectory, records `careerHistory`, and returns `{ success: true, hasCompletedQuiz: true, readinessQuizCompletedAt }`.
3. **Automatic Backfill for Configured Students**: In [`userController.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/controllers/userController.js), `getProfile` automatically persists `readinessQuizCompletedAt` for any student who already has a selected career or career history.
4. **Dashboard Mounting Logic**: [`Dashboard.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/pages/Student/Dashboard.jsx) checks `readinessQuizCompletedAt`, `hasCompletedQuiz`, `selectedCareer`, and `careerHistory`. If completed, it guarantees `setQuizModalOpen(false)`. If truly incomplete (new student), it auto-opens. Upon submission, it updates auth state, updates dashboard data, and closes the modal cleanly.

### Retake Behavior
To allow voluntary re-assessments without intrusive auto-prompts, the "Retake Assessment" trigger was preserved and placed inside [`CareerHeader.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/student/career-compass/CareerHeader.jsx) on the Career Compass page (`/student/career-compass`), empowering students to recalibrate their trajectory on demand.

### Tests
- **Test A1**: `POST /api/career/quiz` returns `200 OK`, `hasCompletedQuiz: true`, and an ISO `readinessQuizCompletedAt` timestamp.
- **Test A2**: Re-authenticating via `POST /api/auth/login` retains `hasCompletedQuiz: true` and `readinessQuizCompletedAt` directly from the database.
- **Test A3**: `GET /api/users/profile` returns `hasCompletedQuiz: true`.

---

## Unified Guidance

### Existing Architecture Reused
The guidance workflow reuses [`GuidanceRequest`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/model/GuidanceRequest.js) and [`guidanceController.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/controllers/guidanceController.js) without creating separate parallel models. The single model was enhanced with `targetAlumniId` (referencing `User`), `resolvedAt`, and `resolvedBy`, maintaining complete backwards compatibility.

### Faculty Guidance
- **Recipient Loading**: Implemented `GET /api/guidance/mentors/faculty` returning dynamic faculty members (`name`, `department`, `designation`).
- **Validation**: Strict role check in [`guidanceController.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/controllers/guidanceController.js) ensures the selected user has `role: 'faculty'`.
- **Topics**: Curated faculty topics: *Technical Guidance*, *Career Guidance*, *Placement Preparation*, *Resume Guidance*, *Skill Development*, *Higher Studies*, *Other*.

### Alumni Guidance
- **Recipient Loading**: Implemented `GET /api/guidance/mentors/alumni` returning alumni mentors (`name`, `graduationYear`, `currentCompany`, `currentRole`, `department`).
- **Validation**: Backend ensures the selected mentor has `role: 'alumni'`.
- **Topics**: Industry-oriented topics: *Career Journey*, *Company Interview*, *Referral Guidance*, *Technology / Skills*, *Placement Preparation*, *Industry Advice*, *Higher Studies*, *Other*.
- **Distinction from Alumni Insights**: Private 1-on-1 guidance is preserved in `GuidanceRequest`; public alumni posts remain isolated in `AlumniPost`.

### Student My Questions
- Hosted on `/student/guidance` under the **[My Questions]** tab.
- Filterable by **All**, **Faculty**, and **Alumni**, with status tabs (**All**, **Pending**, **Replied**, **Resolved**).
- Displays cards showing topic, recipient badge with role, inquiry snippet, timestamp, and action to open the conversation thread.

### Faculty Inbox
- Hosted on `/faculty/guidance`.
- Clean separation with top tabs: **[Student Questions]** and **[Remedial Reviews]**.
- Allows faculty to inspect student inquiries, post threaded responses, and mark inquiries resolved.

### Alumni Inbox
- Integrated into `/alumni/mentorship`.
- Tabs: **[Guidance Requests]**, **[Mentorship Requests]**, and **[Completed]**.
- Allows alumni to inspect private student questions and reply directly, without granting access to academic remedial grading or mock evaluations.

### Remedial Separation
- Remedial action plans resulting from mock interview evaluations are kept separate on both student and faculty portals.
- In student portal (`/student/guidance`), the **[Remedial Plans]** tab displays assigned tasks, deadlines, and submission workflows.
- In faculty portal (`/faculty/guidance`), the **[Remedial Reviews]** tab isolates remedial task reviews from general student guidance questions.

### Replies / Follow-Ups
- Replies are stored chronologically in the `replies` subdocument array of `GuidanceRequest`.
- Students can post follow-up questions to both faculty and alumni mentors.
- Once marked as `resolved`, [`guidanceController.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/controllers/guidanceController.js) blocks new replies (`400 Bad Request: This guidance inquiry has been resolved. No further replies can be added.`).

### Notifications
- Student submits faculty question -> Faculty receives in-app notification (`"Jay Patel asked you for Technical Guidance."`).
- Student submits alumni question -> Alumni receives notification (`"Jay Patel asked you for Company Interview guidance."`).
- Mentor replies -> Student receives in-app notification (`"Dr. Rajesh Kumar replied to your guidance request."`).
- Student posts follow-up -> Mentor receives in-app notification.

### Authorization
- Student can only create requests where `studentId === req.user.id`.
- Faculty can only access requests assigned to them or unassigned department questions.
- Alumni can only access requests explicitly addressed to their `targetAlumniId`.

---

## Interview Cancellation

### Appointment Status Rules
- **Cancellable statuses**: `pending`, `accepted`, `scheduled`.
- **Non-cancellable statuses**: `in_progress`, `completed`, `cancelled`.
- Attempting to cancel non-cancellable appointments returns `409 Conflict`.

### Student Cancellation
- Pending requests display **Withdraw Request**.
- Accepted / scheduled sessions display **Cancel Interview**.
- Clicking Cancel triggers [`CancelInterviewModal.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/student/interviews/CancelInterviewModal.jsx) requiring a reason before proceeding.

### Faculty Cancellation
- Scheduled sessions display **Start Evaluation** and **Cancel Interview**.
- Pending sessions retain **Accept** and **Decline** actions.
- Faculty cancellation prompts for a cancellation reason and alerts the student.

### Withdraw Pending Request
- Students can withdraw pending booking requests before faculty accepts.
- The request transitions to `cancelled` and is marked `cancelledByRole: 'student'`.

### Slot Release
- Cancellation immediately releases the faculty time slot.
- Conflict checks in `scheduleMockInterview` filter out cancelled/rejected interviews (`status: { $nin: ['cancelled', 'rejected'] }`).
- `GET /api/appointments/occupied-slots` excludes cancelled sessions, allowing other students to book the liberated slot immediately.

### Race Condition Protection
- Handled atomically via MongoDB conditional update:
  ```javascript
  const updatedAppointment = await MockInterview.findOneAndUpdate(
    {
      _id: appointmentId,
      status: { $in: ['pending', 'accepted', 'scheduled'] },
    },
    {
      $set: {
        status: 'cancelled',
        cancelledByRole,
        cancelledByUser: currentUserId,
        cancelReason: reason.trim(),
        cancelledAt: new Date(),
      },
    },
    { new: true }
  );
  ```
- If a concurrent request modified the appointment status beforehand, `findOneAndUpdate` returns `null`, triggering a `409 Conflict` response with a clean error message.

### Notification Behavior
- If student cancels, faculty receives notification: `"[Student Name] cancelled the mock interview scheduled for [Date] at [Time]. Reason: [Reason]"`.
- If faculty cancels, student receives notification: `"[Faculty Name] cancelled your mock interview scheduled for [Date] at [Time]. Reason: [Reason]"`.

### Meet / Evaluation Protection
- Cancelled interviews hide `Join Meet` and `Start Evaluation` buttons on frontend.
- Backend evaluation controller [`evaluationController.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/controllers/evaluationController.js) strictly validates appointment status and returns `400 Bad Request` if attempting to evaluate a cancelled interview.

---

## Security / IDOR Tests

| Attack Vector / Scenario | Method & Endpoint | Expected | Result |
| :--- | :--- | :---: | :---: |
| Student B attempts to read Student A guidance request | `GET /api/guidance/:id` | `403 Forbidden` | **PASSED (403)** |
| Unassigned Faculty attempts to access private guidance | `GET /api/guidance/:id` | `403 Forbidden` | **PASSED (403)** |
| Alumni B attempts to read guidance addressed to Alumni A | `GET /api/guidance/:id` | `403 Forbidden` | **PASSED (403)** |
| Student submits guidance specifying faculty role for alumni ID | `POST /api/guidance` | `400 Bad Request` | **PASSED (400)** |
| Student B attempts to cancel Student A interview | `PATCH /api/appointments/:id/cancel` | `403 Forbidden` | **PASSED (403)** |
| Concurrent cancellation on already cancelled interview | `PATCH /api/appointments/:id/cancel` | `409 Conflict` | **PASSED (409)** |
| Evaluator submits evaluation for cancelled interview | `POST /api/evaluations` | `400 Bad Request` | **PASSED (400)** |

---

## Responsive Verification

Affected routes verified across standard viewports (`1440 × 900` Desktop, `768 × 1024` Tablet, `390 × 844` Mobile):
- `/student/dashboard`: Clean metric widgets and action links; diagnostic quiz modal does not auto-open.
- `/student/guidance`: Tab switcher (`[My Questions]` / `[Remedial Plans]`) wraps cleanly; `+ Ask for Guidance` button triggers modal with 2-card selection; conversation thread adapts with max-w-[85%] chat bubbles.
- `/student/interviews`: Upcoming interview card displays "Withdraw Request" (pending) and "Cancel Interview" (scheduled); Cancel modal renders responsive inputs with `Keep Interview` / `Cancel Interview` buttons.
- `/faculty/guidance`: Tab switcher (`[Student Questions]` / `[Remedial Reviews]`) separates inquiries cleanly.
- `/faculty/interviews`: Scheduled cards feature both primary "Start Evaluation" and secondary "Cancel Interview".
- `/alumni/mentorship`: Navigation tabs (`[Guidance Requests]`, `[Mentorship Requests]`, `[Completed]`) render without horizontal page overflow.

---

## APIs Added / Changed

| Endpoint | Method | Changes & Purpose |
| :--- | :---: | :--- |
| `/api/appointments/:id/cancel` | `PATCH` | Role-aware atomic appointment cancellation with reason, timestamp, and participant notification. |
| `/api/appointments/occupied-slots` | `GET` | Returns occupied slots for a faculty member on a given date, excluding cancelled/rejected sessions. |
| `/api/guidance/mentors/faculty` | `GET` | Returns list of eligible faculty mentors with department and designation context. |
| `/api/guidance/mentors/alumni` | `GET` | Returns list of eligible alumni mentors with company, role, and graduation year context. |
| `/api/guidance` | `POST` | Validates recipient role against `recipientType`, creates request, dispatches in-app notification. |
| `/api/guidance/:id/reply` | `POST` | Disallows replies if request is resolved (400); enforces IDOR security (403); dispatches notification. |
| `/api/guidance/:id/resolve` | `PATCH` | Marks inquiry resolved with `resolvedAt` and `resolvedBy`. |
| `/api/career/quiz` | `POST` | Updates `StudentProfile.readinessQuizCompletedAt` to persist quiz completion state in DB. |
| `/api/auth/login` | `POST` | Returns `hasCompletedQuiz` and `readinessQuizCompletedAt` on student login payload. |
| `/api/evaluations` | `POST` | Rejects evaluation submission for cancelled interviews (`400 Bad Request`). |

---

## Models Changed

1. **[`MockInterview.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/model/MockInterview.js)**:
   - `cancelledByRole`: `{ type: String, enum: ['student', 'faculty', 'admin', null], default: null }`
   - `cancelledByUser`: `{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }`
   - `cancelReason`: `{ type: String, default: '' }`
   - `cancelledAt`: `{ type: Date, default: null }`

2. **[`StudentProfile.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/model/StudentProfile.js)**:
   - `readinessQuizCompletedAt`: `{ type: Date, default: null }`

3. **[`GuidanceRequest.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/model/GuidanceRequest.js)**:
   - `targetAlumniId`: `{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }`
   - `resolvedAt`: `{ type: Date, default: null }`
   - `resolvedBy`: `{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }`

---

## Existing Business Logic Preserved
- **Remedial Action Plans**: Retained existing grading rubrics, weak-skill generation, and faculty remedial review flow.
- **Google Meet Integration**: Calendar event deletion upon appointment cancellation preserves user Google Calendar sync.
- **Alumni Mentorship Requests**: The existing `/alumni/mentorship` multi-tab system was preserved and extended without altering separate mentorship contract schemas.
- **Career Compass Analytics**: Readiness scoring algorithms, benchmark comparisons, and skill gap visualizations remain intact.

---

## Test Results

Automated test suite [`scripts/verify-student-workflow-fixes.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/scripts/verify-student-workflow-fixes.js) executed against running live services:

```text
========================================================
   GRIP STUDENT WORKFLOW GAP FIXES VERIFICATION
========================================================

0. Authenticating Actor Personas...
  Actors authenticated successfully.

--- TEST A: FIRST-TIME-ONLY READINESS QUIZ ---
  [PASS] Quiz submission returns 200 OK
  [PASS] Quiz response returns hasCompletedQuiz: true
  [PASS] readinessQuizCompletedAt date is returned
  [PASS] Subsequent login returns hasCompletedQuiz: true
  [PASS] Subsequent login retains readinessQuizCompletedAt
  [PASS] GET /users/profile reflects hasCompletedQuiz: true

--- TEST B: FACULTY GUIDANCE WORKFLOW ---
  [PASS] GET /guidance/mentors/faculty returns 200 OK
  [PASS] Dynamic faculty list returned
  [PASS] Student creates faculty guidance request (201 Created)
  [PASS] Faculty received notification for new guidance question
  [PASS] Faculty replies to guidance request (201 Created)
  [PASS] Student received notification when faculty replied
  [PASS] Student posts follow-up in thread (201 Created)
  [PASS] Faculty marks request resolved (200 OK)
  [PASS] New replies rejected on resolved guidance request (400 Bad Request)

--- TEST C: ALUMNI GUIDANCE WORKFLOW ---
  [PASS] GET /guidance/mentors/alumni returns 200 OK
  [PASS] Dynamic alumni list returned
  [PASS] Student creates alumni guidance request (201 Created)
  [PASS] Alumni replies to guidance inquiry (201 Created)

--- TEST SECURITY / IDOR ENFORCEMENT ---
  [PASS] Student B cannot view Student A guidance (403 Forbidden)
  [PASS] Unassigned Faculty cannot access private faculty guidance (403 Forbidden)
  [PASS] Alumni B cannot view guidance addressed to Alumni A (403 Forbidden)
  [PASS] Backend rejects recipient role mismatch (400 Bad Request)

--- TEST D & E: MOCK INTERVIEW CANCELLATION & SLOT RELEASE ---
  [PASS] Student A books mock interview appointment (201 Created)
  [PASS] Faculty accepts appointment -> scheduled (200 OK)
  [PASS] Slot is marked occupied before cancellation
  [PASS] Slot conflict prevented for another student (409/400)
  [PASS] Student A cancels appointment with reason (200 OK)
  [PASS] Appointment status updated to cancelled
  [PASS] cancelledByRole recorded as student
  [PASS] cancelReason persisted
  [PASS] cancelledAt timestamp recorded
  [PASS] SLOT RELEASED: cancelled appointment no longer blocks faculty availability
  [PASS] Student B successfully books released slot (201 Created)
  [PASS] Evaluation of cancelled interview strictly rejected by backend (400 Bad Request)

--- TEST F: WITHDRAW PENDING APPOINTMENT ---
  [PASS] Student withdraws pending request (200 OK)
  [PASS] Withdrawn request status set to cancelled

--- TEST G: ATOMIC RACE CONDITION PROTECTION ---
  [PASS] Subsequent cancellation on already changed status returns 409 Conflict
  [PASS] Unauthorized student cannot cancel another student interview (403 Forbidden)

========================================================
   TOTAL TESTS RUN: 39
   PASSED: 39
   FAILED: 0
========================================================
```

Frontend production build (`npm run build`):
```text
✓ 1836 modules transformed.
dist/index.html                                  0.83 kB
dist/assets/index-BXPq9qHf.css                  66.98 kB
dist/assets/notificationService-B0VVFSDj.js      0.40 kB
dist/assets/index-DrnBSv4x.js                1,018.97 kB
✓ built in 3.96s
```

---

## Remaining Issues
None. All 39 test assertions passed with 0 failures, backend IDOR enforcement was verified, and the frontend compiled cleanly. As requested, further event reminders and production optimizations were omitted to keep the solution lean and focused.
