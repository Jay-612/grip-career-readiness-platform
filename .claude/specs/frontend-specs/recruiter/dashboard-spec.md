# Screen Specification: Recruiter Talent Dashboard & Campus Pipeline

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Recruiter/dashboard/dashboard_screen.png`
- **Visual Description**: Corporate recruiter talent discovery and campus hiring pipeline console. Left sidebar shows recruiter avatar ("MV"), name "Marcus Vance" (Campus TA Lead • TechCorp), status badge "Active Drive (Autumn '26)", navigation items (Recruiter Dashboard active, Company Profile Manager, Candidate Talent Bench with badge "32 Pre-Screened", Active Drives & Schedules [Oct 1], Student Feedback Portal with badge "14 Pending", ATS Integration & Sync [Workday], Recruitment Settings, Sign Out), and bottom partner card ("Campus Partner Status: Tier-1 Super Dream Partner, 15 SDE-1 Target Offers • 94% Past Retention"). Top navigation bar displays breadcrumbs, search input for skills/CGPA, drive countdown pill ("Autumn Drive: Starts in 14 Days [Oct 1]"), "+ Post New Campus Drive" primary button, notifications, and profile avatar. Header banner displays title "TechCorp Global — Campus Recruitment & Talent Pipeline", badges: "NBA Tier-1 Accredited Institution", "Institutional Readiness Pre-Screen Verified", target cohort copy ("Dept. of Computer Science & Engineering [Class of 2026 • 142 Candidates] • SDE-1 Cloud Platform & Core Backend [24 - 28 LPA Super Dream Tier]"), and action buttons "Filter Criteria" and "Share Roster". Top 4 metric cards show: Pre-Screened Talent Pool (32 Candidates, Scored >80% Readiness, 12 Super Dream ready, +8 vs 2025), Faculty & Alumni Endorsed (24 Verified, Endorsed by Prof. Neha Sharma & team), Interview Slots Booked (48 / 60 Slots, 80% Capacity, 3 Technical Panels Assigned), and Target Offers Allocation (15 SDE-1 Offers, CTC: 24-28 LPA). Middle left displays Pre-Screened Top Candidate Bench (Fast-Track Eligible): Rohan Mehta (Final Year CSE-A, 9.24 CGPA, 96% Fit, "Fast-Track to Final Round", "View Dossier"), Ananya Iyer (91% Fit, "Shortlist for Panel 1", "View Dossier"), Pooja Hegde (88% Fit, "Shortlist for Panel 1", "View Dossier"), and link "View All 32 Pre-Screened Candidates in Talent Bench ->". Middle right displays Campus Drive Funnel & 3-Day Schedule (Pipeline bar: 142 Cohort -> 68 OA Shortlisted -> 32 In Panels -> 15 Offers; Day 1 Oct 1 Online OA, Day 2 Oct 2 Technical Panels, Day 3 Oct 3 Bar-Raiser & On-Spot Offers; Workday ATS Connected indicator). Bottom displays Curriculum Competency Alignment with TechCorp Hiring Bar with 4 progress bars (Distributed Systems & Caching 92%, DSA & Concurrency 84%, Cloud Infrastructure 84%, STAR Behavioral 89%) and "Export Candidate Manifest to Workday ATS" CTA button.

## 2. Intended User Role
- `recruiter` (and campus placement administrators).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/userRoutes.js`
  - `backend/routes/placementRoutes.js`
  - `backend/routes/departmentRoutes.js`
  - `backend/routes/eventRoutes.js`
- **Controllers**:
  - `backend/controllers/userController.js` (`getProfile`, `getUserById`)
  - `backend/controllers/placementController.js` (`getCompanyMatch`, `getPlacementReadiness`)
  - `backend/controllers/departmentController.js` (`getSkillGaps`, `getPlacementStats`)
  - `backend/controllers/departmentEventController.js` (`getAllEvents`, `createEvent`)
- **Models**: `RecruiterProfile.js`, `Company.js`, `StudentProfile.js`, `User.js`, `DepartmentEvent.js`

## 4. Exact API Endpoints Mapped
- `GET /api/users/profile` — Retrieves recruiter profile and linked company credentials.
- `GET /api/placement/company-match/:studentId` — Retrieves student match percentages against recruiter's company benchmarks.
- `GET /api/department/placement-stats` — Retrieves candidate pool distributions, readiness statistics, and tier breakdowns.
- `GET /api/department/skill-gaps` — Retrieves cohort competency alignments against company hiring criteria.
- `GET /api/events` — Retrieves scheduled campus drive events and interview panel slots.
- `POST /api/events` — Schedules new campus recruitment drives or assessment rounds.

## 5. Required HTTP Operations
- `GET`: Fetches recruiter profile, pre-screened student candidates, drive schedules, and curriculum alignment metrics.
- `POST`: Creates or schedules new campus recruitment drives.

## 6. Reusable Components
- `RecruiterSidebar`: Persistent recruiter navigation with talent bench badge and partner status.
- `PortalTopBar`: Top bar with talent search and "+ Post New Campus Drive" button.
- `MetricSummaryCard`: Top pre-screened talent KPI cards.
- `CandidateBenchCard`: Card showing candidate name, CGPA, match percentage pill, technical highlights, and shortlist action.
- `ProgressBar`: Hiring bar competency alignment bars.
- `PrimaryButton`: "Export Candidate Manifest to Workday ATS" button.

## 7. Page-Specific Components
- `RecruiterHeaderBanner`: Banner displaying company hiring pipeline scope and partner accreditation.
- `CampusDriveFunnel`: Multi-stage pipeline progress bar (Cohort -> OA -> Panels -> Offers).
- `DriveScheduleList`: 3-day schedule breakdown with date, time, and candidate counts.
- `ATSExportButton`: Button to export candidate data manifest to Workday/enterprise ATS.

## 8. Loading States
- Shimmer skeleton loaders for metric tiles, candidate bench, and schedule funnel while loading.
- Fast-track / shortlist button shows spinner while action resolves.

## 9. Error States
- Banner error if talent pool or schedule fails to fetch.
- Toast error if ATS export connection times out.

## 10. Empty States
- "No candidates currently meet the 80% readiness filter" with option to adjust hiring threshold.

## 11. Form Validation Requirements
- Search query requires non-empty string.
- New drive posting requires start date, target roles, and slot capacity.

## 12. RBAC Restrictions
- Protected by `protect` and `authorize('recruiter', 'admin')`.

## 13. Routing Path
- `/recruiter/dashboard`

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: 3-column layout (Sidebar 240px, Middle candidate bench flex-1, Right drive schedule rail 380px).
- **Tablet (768px - 1279px)**: 2-column layout; drive schedule stacks below candidate bench.
- **Mobile (< 768px)**: 1-column layout; metrics wrap into 2x2 grid; competency bars stack vertically.
