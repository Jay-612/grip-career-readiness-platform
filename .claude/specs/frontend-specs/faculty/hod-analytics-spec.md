# Screen Specification: Department Head (HOD) Analytics & Cohort Competency Center

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Faculty/hod-analytics/hod_analytics_screen.png`
- **Visual Description**: Executive departmental placement telemetry and cohort skill gap command center. Left sidebar shows HOD profile ("Dr. Arvind Swaminathan", HOD, Dept of CSE, at Department Office), navigation items (Faculty Dashboard, Interview Evaluation, Guidance Inbox, HOD Analytics with "Executive" badge, Faculty Workload & SLAs, NBA / NAAC Accreditation), and bottom accreditation indicator (NBA Tier-1 Cycle 2024-27 Verified). Top navigation bar displays breadcrumbs, active cohort selector ("Batch 2022-2026 [Final Year CSE - 142 Students • Semester VII]"), "Download CSV", and "Sign Official Placement Report (PDF)" buttons. Main header displays title "Department Placement Readiness & Cohort Competency Center", accreditation badge ("NBA Tier-1 Criteria 2.2"), and kickoff alert pill ("RECRUITER DRIVE KICKOFF • In 14 Days • 84.6% Cohort Pre-Cleared for Phase-1"). Top metric row displays: Overall Readiness Index (84.6%, +8.4% vs 2025 batch), Tier-1 Super-Dream (38 Students, Target Exceeded), Tier-2 Dream (64 Students, Cleared Bar), Remedial / At-Risk (18 Students, Intervention Active), and Faculty Mock Capacity (386 Evaluated of 420 Capacity, 34 Pending). Middle left displays Department Skill Gap & Curriculum Competency Matrix (Data Structures & Algorithms 85.8%, Concurrency & Database ACID 82.2%, System Design & Microservices 74.2%, Cloud & Distributed Systems 67.8% [-7.2% Critical Gap, 28 students pending], Technical STAR Communication 78.5%) and remedial workshop deployment card ("Deploy Remedial Credit: Distributed Systems Workshop ->"). Middle right displays Placement Tier Distribution & Funnel with cohort segregation bar (Super Dream 38, Dream 64, Core Tech 22, Remedial 18) and pre-drive shortlists by enterprise partners (TechCorp Global 52, FinTech Apex 38, DataScale AI 18). Bottom section features Student Cohort Readiness Roster & Remedial Tracking table with search, filter tabs (All 142, Tier-1 Ready 38, Dream 64, At-Risk 18), student rows with CGPA, readiness bar, primary competency gap, assigned evaluator, mock status, readiness status badge, and actions ("View Full Roster", "Assign Remedial", "Mandatory Sync").

## 2. Intended User Role
- `faculty` with `isHOD === true`, and institutional `admin`.

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/departmentRoutes.js`
  - `backend/routes/placementRoutes.js`
  - `backend/routes/userRoutes.js`
  - `backend/routes/eventRoutes.js`
- **Controllers**:
  - `backend/controllers/departmentController.js` (`getDepartmentAnalytics`, `getSkillGaps`, `getPlacementStats`, `getCareerDistribution`)
  - `backend/controllers/placementController.js` (`getLeaderboard`)
  - `backend/controllers/departmentEventController.js` (`createEvent`)
- **Models**: `FacultyProfile.js`, `StudentProfile.js`, `User.js`, `EvaluationScore.js`, `DepartmentEvent.js`

## 4. Exact API Endpoints Mapped
- `GET /api/department/analytics` — Retrieves department-wide placement readiness, cohort distributions, and mock metrics (verified inside controller for `isHOD === true` or `admin`).
- `GET /api/department/skill-gaps` — Retrieves aggregated curriculum skill gaps and affected student counts.
- `GET /api/department/placement-stats` — Retrieves tier distributions and enterprise shortlist counts.
- `GET /api/placement/leaderboard` — Retrieves student roster with readiness indices and evaluator assignments.
- `POST /api/events` — Schedules and deploys department-wide remedial workshops and review sessions.

## 5. Required HTTP Operations
- `GET`: Loads department analytics, skill matrices, placement statistics, and student cohort rosters.
- `POST`: Schedules remedial workshops and interventions.

## 6. Reusable Components
- `FacultySidebar`: Persistent faculty navigation with executive badge for HOD.
- `PortalTopBar`: Top bar with cohort selector and export report buttons.
- `MetricSummaryCard`: Top executive KPI cards.
- `ProgressBar`: Skill competency and cohort distribution bars.
- `FilterTabs`: Roster category filter tabs.
- `Pagination`: Table pagination controls.

## 7. Page-Specific Components
- `SkillGapMatrix`: Detailed curriculum competency list comparing department scores against industry benchmarks.
- `PlacementFunnelCard`: Visualization of student distribution across Super-Dream, Dream, Core, and Remedial brackets.
- `CohortRosterTable`: Table of all department students with readiness bars, gaps, and remedial action buttons.
- `DeployRemedialWorkshopModal`: Modal for creating an institutional remedial workshop via `POST /api/events`.

## 8. Loading States
- Shimmer skeletons for executive metrics, skill matrix, and roster table while loading.
- CSV download button shows brief spinner during export generation.

## 9. Error States
- Full-page access denied banner if authenticated faculty does not have `isHOD === true`.
- Alert banner if departmental analytics fails to load.

## 10. Empty States
- "No students flagged for remedial action" when remedial array is empty.

## 11. Form Validation Requirements
- Workshop scheduler requires title, date, target competency, and department.

## 12. RBAC Restrictions
- Strictly restricted to `faculty` where `isHOD === true`, or `admin`. Other faculty roles must receive HTTP 403 Forbidden or redirect.

## 13. Routing Path
- `/faculty/hod-analytics`

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: Multi-column executive grid; side-by-side skill matrix and placement funnel.
- **Tablet (768px - 1279px)**: Stacked 1-column layout; table horizontally scrollable with sticky student name column.
- **Mobile (< 768px)**: 1-column card stack; metrics tiles wrap to 2x2 or 1x1 cards.
