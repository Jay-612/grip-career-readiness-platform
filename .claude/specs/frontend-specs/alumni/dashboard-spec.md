# Screen Specification: Alumni Mentorship & Network Dashboard

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Alumni/dashboard/dashboard_screen.png`
- **Visual Description**: Alumni mentor command center. Left sidebar shows alumni avatar ("VS"), name "Vikram Singhania" (Senior SWE @ TechCorp), status badge "Accepting Mentees (2 Slots)", navigation items (Alumni Dashboard active, Experience Publisher, Mentorship Inbox with badge "4 unread", Campus Referrals [TechCorp], Mock Interview Hub, Alumni Network, Settings, Sign Out), and bottom contributor callout ("Top 5% Contributor - 18 Students Placed via your verified mentorship & company referrals."). Top navigation bar displays breadcrumbs, student search input, status pill "1:1 Mentoring: Open", "+ Publish Experience" primary button, notifications, and profile avatar. Hero card displays greeting "Welcome back, Vikram!", badges: "Verified TechCorp Alumni", "Super Mentor (50+ Hours)", supportive text ("Empowering the next generation of software engineers from your alma mater [Dept. of CSE, Class of 2026]"), and buttons: "Sync Calendar", "Office Hours Settings". Top metric strip shows: Students Mentored (24 Students, +4 this month, +18.6%), Campus Referrals (14 Submitted, 5 Placed, 35.7% placement rate), Published Guides (6 Published, 4,820 Reads, 312 Saves, Top Read), and Mentorship Rating (4.96 / 5.0 with 28 Reviews). Middle left features Upcoming Mentorship & Mock Interview Sessions (2 Scheduled Today: Rohan Mehta at 6:30 PM with buttons "Launch Video Room" & "View Candidate Dossier", Ananya Iyer tomorrow with "Prepare Rubric" & "Reschedule", and link "Manage Full Calendar & Office Hours"). Middle right features AI Pre-Matched for TechCorp (Rohan Mehta 96% Team Match with "Refer to Panel" button, Pooja Hegde 91% Team Match with "Review & Refer" button, and link "View 12 More Matched Candidates ->"). Bottom left displays Your Published Experiences & Breakdown Guides with "+ Write New Guide" button and 3 published guide cards with read/bookmark stats. Bottom right displays Student Q&A in Your Domain (4 Awaiting Response) with student cards, questions, and "Quick Reply" buttons.

## 2. Intended User Role
- `alumni` (graduated mentors).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/userRoutes.js`
  - `backend/routes/alumniRoutes.js`
  - `backend/routes/appointmentRoutes.js`
  - `backend/routes/guidanceRoutes.js`
  - `backend/routes/placementRoutes.js`
- **Controllers**:
  - `backend/controllers/userController.js` (`getProfile`)
  - `backend/controllers/alumniController.js` (`createOrUpdateAlumniProfile`)
  - `backend/controllers/alumniPostController.js` (`getAllPosts`)
  - `backend/controllers/interviewController.js` (`getAppointments`)
  - `backend/controllers/guidanceController.js` (`getGuidanceRequests`)
  - `backend/controllers/placementController.js` (`getLeaderboard`)
- **Models**: `AlumniProfile.js`, `ExperiencePost.js`, `User.js`, `MockInterview.js`, `GuidanceRequest.js`, `StudentProfile.js`

## 4. Exact API Endpoints Mapped
- `GET /api/users/profile` — Retrieves alumni profile, current employer, job role, and graduation batch.
- `GET /api/alumni/posts` — Retrieves published interview guides, article metrics, and read/upvote counts.
- `GET /api/appointments` — Retrieves alumni's scheduled mock interviews and 1-on-1 mentorship appointments.
- `GET /api/guidance/requests` — Retrieves student guidance inquiries awaiting responses.
- `GET /api/placement/leaderboard` — Queries high-readiness student candidates eligible for company referral.

## 5. Required HTTP Operations
- `GET`: Fetches alumni profile, published guides, scheduled appointments, candidate referral matches, and unanswered queries.

## 6. Reusable Components
- `AlumniSidebar`: Standard alumni navigation sidebar with mentee capacity status.
- `PortalTopBar`: Top bar with search input and "+ Publish Experience" button.
- `MetricSummaryCard`: Top impact metric cards.
- `CandidateMatchCard`: Card displaying student name, match percentage, verified achievements, and "Refer to Panel" CTA.
- `GuideSnippetCard`: Card displaying published article title, category badge, read counts, and upvotes.
- `StudentQueryCard`: Mini card displaying student doubt, topic, and "Quick Reply" button.

## 7. Page-Specific Components
- `AlumniHeroBanner`: Welcome banner with alma mater badge, super mentor badge, and office hours settings.
- `UpcomingAlumniSessions`: Scheduled session cards with direct video meeting launch.
- `ReferralTalentBench`: Candidate list filtered for the alumnus's employer.

## 8. Loading States
- Shimmer cards for metric tiles, scheduled sessions, and published guides during fetch.
- Video room launch button shows brief connection state.

## 9. Error States
- Banner error if appointment sync or guides feed fails.
- Toast alert if video room URL is unavailable.

## 10. Empty States
- "No pending student questions in your domain" when all queries are answered.
- "No published guides yet" with "+ Write New Guide" button.

## 11. Form Validation Requirements
- Search input: Non-empty query string on submit.
- Quick reply requires non-empty text before sending.

## 12. RBAC Restrictions
- Protected by `protect` and `authorize('alumni', 'admin')`.

## 13. Routing Path
- `/alumni/dashboard`

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: 3-column layout (Sidebar 240px, Middle sessions & guides flex-1, Right referral & Q&A rail 360px).
- **Tablet (768px - 1279px)**: 2-column layout; referral and Q&A stack below main content.
- **Mobile (< 768px)**: 1-column layout; metric cards wrap into 2x2 grid.
