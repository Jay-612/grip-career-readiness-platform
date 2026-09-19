# Screen Specification: Student Dashboard

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Student/dashboard/dashboard_screen.png`
- **Visual Description**: Comprehensive student career command center. Left sidebar contains the student profile snippet (Rohan Mehta, 3rd Year • CSE Track), navigation links (Dashboard active, Profile & Skills, Career Compass, Goal Tracker [Sprint], Mentorship & Q&A, Interview & Readiness), and bottom readiness meter (85% Placement Ready, 7 of 8 Rubrics Done, TechCorp Partner Verified). Top navigation bar displays portal breadcrumbs, session cycle ("Spring 2026"), search bar, "+ Log Progress", "Request Mentorship" button, notifications, and profile avatar. Hero banner features a deep blue gradient with accreditation tag, personalized greeting, target track subtitle ("Distributed Systems & Cloud Backend Engineer"), and "Placement Ranking: Top 4%". Metric cards show Overall Readiness Score (85%), Active Semester Goals (4 Goals), Mentorship/Mock Interview (1 Scheduled), and Recruiter Profile Views (3 Visiting). Main section features a Semester Stepper (Sem 3 to 7), Active Sprint card, Active Sprint & Semester Goals list (with priority badges and progress bars), and Recent Feedback & Activity live feed. Right sidebar shows a radial Readiness & Alignment gauge, evaluation rubric breakdown, target recruiter match cards, scheduled mock sessions, and recommended action buttons.

## 2. Intended User Role
- `student` (also viewable by `faculty` and `admin` with appropriate permissions).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/userRoutes.js`
  - `backend/routes/progressRoutes.js`
  - `backend/routes/placementRoutes.js`
  - `backend/routes/appointmentRoutes.js`
  - `backend/routes/guidanceRoutes.js`
- **Controllers**:
  - `backend/controllers/userController.js` (`getProfile`)
  - `backend/controllers/progressController.js` (`getProgressDashboard`, `getGoalsAnalysis`)
  - `backend/controllers/placementController.js` (`getPlacementReadiness`, `getCompanyMatch`)
  - `backend/controllers/interviewController.js` (`getAppointments`)
- **Models**: `User.js`, `StudentProfile.js`, `SemesterPlan.js`, `WeeklyGoal.js`, `MockInterview.js`, `Company.js`

## 4. Exact API Endpoints Mapped
- `GET /api/users/profile` — Retrieves logged-in student user and academic profile.
- `GET /api/progress/dashboard/:studentId` — Retrieves aggregate student progress, score history, and active milestones.
- `GET /api/placement/readiness/:studentId` — Retrieves readiness score, percentile rank, and benchmark thresholds.
- `GET /api/placement/company-match/:studentId` — Retrieves recruiter alignment match percentages (e.g., TechCorp, CloudSys).
- `GET /api/appointments` — Retrieves student's scheduled mock interviews and mentor syncs.

## 5. Required HTTP Operations
- `GET`: Fetches student profile, dashboard progress, readiness telemetry, company matches, and scheduled appointments.

## 6. Reusable Components
- `StudentSidebar`: Persistent sidebar with role navigation, active route highlighting, and quick profile stats.
- `PortalTopBar`: Top bar with search input, session selector, and notification bell.
- `MetricSummaryCard`: Standardized metric card displaying counter, delta tag, and icon.
- `RadialProgressGauge`: Circular SVG gauge displaying readiness percentage.
- `GoalItemRow`: Goal item with priority chip, due date, and animated progress bar.
- `ScheduledSessionCard`: Card displaying appointment details, mentor name, meeting mode, and prep link.
- `ActionLinkButton`: Styled action shortcut button with trailing arrow.

## 7. Page-Specific Components
- `StudentHeroBanner`: Deep blue gradient header card with placement ranking callout.
- `SemesterRoadmapStepper`: Visual node timeline showing progress across semesters (Sem 3 to 7).
- `LiveActivityFeed`: Feed displaying faculty approvals, alumni rubrics, and placement officer verifications.
- `RecruiterMatchList`: Stacked list of partner companies with match percentage badges.

## 8. Loading States
- Hero banner, metric cards, and roadmap stepper display shimmer skeleton boxes during initial fetch.
- Appointments and goals lists show pulse placeholders.

## 9. Error States
- Full-page error card with "Retry Dashboard" button if `GET /api/users/profile` fails.
- Card-level error fallback if secondary widgets (e.g. company match) fail to load.

## 10. Empty States
- "No active goals this week" with "+ Create Goal" button when goals array is empty.
- "No upcoming mentor sessions" with "Book Session" shortcut when appointments list is empty.

## 11. Form Validation Requirements
- Search bar: Non-empty query string on enter.
- Quick action modals ("Log Progress", "Request Mentorship") validate required input fields.

## 12. RBAC Restrictions
- Protected by `protect` middleware.
- Restricted to role `student` (or faculty/admin viewing student's profile).

## 13. Routing Path
- `/student/dashboard`

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: 3-column layout (Sidebar 240px, Main content flex-1, Right metrics rail 340px).
- **Tablet (768px - 1279px)**: 2-column layout (Sidebar collapsed or off-canvas drawer, Main and Right rail stacked).
- **Mobile (< 768px)**: 1-column layout; sidebar becomes a hamburger menu; horizontal scrolling for semester stepper.
