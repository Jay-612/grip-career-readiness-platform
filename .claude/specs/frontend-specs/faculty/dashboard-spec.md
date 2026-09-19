# Screen Specification: Faculty Dashboard

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Faculty/dashboard/dashboard_screen.png`
- **Visual Description**: Placement cohort oversight and student advising dashboard for faculty. Left sidebar shows faculty avatar ("NS"), name "Prof. Neha Sharma" (Associate Prof • Placement Evaluator), status indicator "Available for Mocks", navigation links (Faculty Dashboard active, Interview Evaluation with badge "3 pending", Guidance Inbox with badge "5 unread", HOD Analytics with badge "HOD Dept"), bottom Cohort Readiness gauge (78.4% Avg Score, 142 Active Mentees), and Faculty Settings / Sign Out. Top navigation shows breadcrumbs, department tag ("Computer Science & Engineering"), mentee search input, "+ Schedule Office Hours", "+ Evaluate Student", notifications, and profile avatar. Hero banner displays greeting "Good Morning, Prof. Sharma! Here is your CSE Placement Cohort Overview.", cohort details ("Class of 2026 • 142 Registered Candidates • Target Day-1 Tier-1 Enterprise & High-Growth Tech Placements"), countdown badge ("TIER-1 WINDOW: Oct 2026 [42 Days]"), and "Export Cohort Report" button. Metric row features: Cohort Placement Readiness (78.4%, 58 Tier-1 Qualified Candidates, "View Roster ->"), Pending Milestone Reviews (8 Reviews, 3 Urgent / Due Today, "View Queue ->"), Today's Scheduled Interviews (4 Sessions, First sync at 4:00 PM, "Daily Agenda ->"), and At-Risk Candidates (12 Students, Readiness <65%, "Intervene ->"). Middle left features a Pending Student Milestone Submissions table (Student name, milestone submission, readiness bar, timestamp, evaluation action buttons "Open Rubric", "Review Submission", "Verify Code") and a Priority Interventions & Skill Gaps callout box ("12 Candidates Falling Below TechCorp Cut-off in System Design & Caching" with action buttons "Schedule Group Architecture Masterclass" and "Send Automated Remedial Sprint Notice"). Middle right displays Today's Agenda list (with session start and prep note links) and Visiting Tech Recruiters Alignment cards (TechCorp, CloudSys, FinTech Apex with eligible candidate counts).

## 2. Intended User Role
- `faculty` (and `admin`).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/userRoutes.js`
  - `backend/routes/departmentRoutes.js`
  - `backend/routes/placementRoutes.js`
  - `backend/routes/guidanceRoutes.js`
  - `backend/routes/appointmentRoutes.js`
- **Controllers**:
  - `backend/controllers/userController.js` (`getProfile`)
  - `backend/controllers/departmentController.js` (`getPlacementStats`, `getSkillGaps`)
  - `backend/controllers/placementController.js` (`getLeaderboard`)
  - `backend/controllers/guidanceController.js` (`getGuidanceRequests`)
  - `backend/controllers/interviewController.js` (`getAppointments`)
- **Models**: `FacultyProfile.js`, `User.js`, `StudentProfile.js`, `EvaluationScore.js`, `MockInterview.js`, `Company.js`

## 4. Exact API Endpoints Mapped
- `GET /api/users/profile` — Retrieves faculty user details and `FacultyProfile` (`department`, `employeeId`, `isHOD`).
- `GET /api/department/placement-stats` — Retrieves cohort placement readiness statistics and score distributions.
- `GET /api/department/skill-gaps` — Retrieves cohort skill deficits and remedial flags.
- `GET /api/placement/leaderboard` — Retrieves list of department students, readiness indices, and risk tags.
- `GET /api/guidance/requests` — Retrieves pending student milestone reviews and questions.
- `GET /api/appointments` — Retrieves faculty member's scheduled interview sessions for today.

## 5. Required HTTP Operations
- `GET`: Fetches faculty profile, cohort statistics, student submission queues, scheduled mock interviews, and recruiter drive dates.

## 6. Reusable Components
- `FacultySidebar`: Persistent faculty navigation sidebar with status badge and cohort score meter.
- `PortalTopBar`: Top bar with search input and schedule office hours button.
- `MetricSummaryCard`: Metric card with status delta and action link.
- `ReadinessBadge`: Status badge with score percentage.
- `TodayAgendaItem`: Card displaying session time, candidate, topic, and "Start Session" button.
- `RecruiterDriveCard`: Card showing company name, drive date, and eligible candidate counts.

## 7. Page-Specific Components
- `FacultyHeroBanner`: Gradient banner with cohort summary and report export button.
- `PendingMilestonesTable`: Table of student submissions awaiting faculty review.
- `CohortInterventionCard`: Diagnostic callout card highlighting at-risk students and group masterclass CTA.

## 8. Loading States
- Shimmer skeletons for cohort metrics, submissions table, and today's agenda while loading.
- Search input displays loading indicator while filtering mentees.

## 9. Error States
- Banner alert if cohort telemetry fails to load.
- Toast error if session launch fails.

## 10. Empty States
- "No pending milestone reviews in queue" when all student submissions are evaluated.
- "No scheduled sessions for today" with "Add Office Hours Slot" button.

## 11. Form Validation Requirements
- Mentee search input requires at least 2 characters.
- Office hours scheduler requires valid start/end times and location/link.

## 12. RBAC Restrictions
- Protected by `protect` and `authorize('faculty', 'admin')`.
- HOD-only tools (like deep institutional analytics) are conditional on `isHOD === true`.

## 13. Routing Path
- `/faculty/dashboard`

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: 3-column layout (Sidebar 240px, Middle queue & interventions flex-1, Right agenda rail 340px).
- **Tablet (768px - 1279px)**: 2-column layout; agenda stacks below submissions table.
- **Mobile (< 768px)**: 1-column layout; sidebar becomes a drawer; table allows horizontal scroll.
