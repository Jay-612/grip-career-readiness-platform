# Implementation Plan: Department Head (HOD) Analytics & Cohort Competency Center

## 1. Goal
Construct `HODAnalyticsPage.jsx` based on `.claude/specs/frontend-specs/faculty/hod-analytics-spec.md` and screenshot `.claude/images/stitch/Faculty/hod-analytics/hod_analytics_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Axios client: `src/services/apiClient.js`
- Layout components: `FacultySidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: Access Control & Data Fetching
1. Create `src/pages/Faculty/HODAnalyticsPage.jsx`.
2. Define states:
   - `analyticsData`: Department overview and macro-readiness metrics.
   - `skillGaps`: Competency list with benchmarks and gap percentages.
   - `placementStats`: Tier distribution and enterprise shortlists.
   - `roster`: Array of student candidates with readiness indices.
   - `rosterFilter`: String (`'all'`).
   - `searchQuery`: String (`''`).
   - `isAuthorized`: Boolean (`true`).
   - `isWorkshopModalOpen`: Boolean (`false`).
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`:
   - Fetch `GET /api/users/profile` to inspect `user.profile.isHOD`.
   - If not HOD, set `isAuthorized = false`, `isLoading = false`, and return.
   - Concurrently fetch:
     - `GET /api/department/analytics`
     - `GET /api/department/skill-gaps`
     - `GET /api/department/placement-stats`
     - `GET /api/placement/leaderboard`
   - Store responses and set `isLoading = false`.

### Phase 2: Executive KPI Tiles & Kickoff Banner
1. If `!isAuthorized`, render a stylized "Access Denied - Restricted to Department Heads" card.
2. Render top kickoff banner with 14-day countdown pill and official report signature button.
3. Render 5 KPI summary tiles:
   - Overall Readiness Index (84.6%, +8.4%)
   - Tier-1 Super-Dream (38 Students)
   - Tier-2 Dream (64 Students)
   - Remedial / At-Risk (18 Students)
   - Faculty Mock Capacity (386 Evaluated of 420)

### Phase 3: Skill Gap Matrix & Placement Funnel
1. Build `DepartmentSkillGapMatrix`:
   - List curriculum competencies (DSA, Concurrency & ACID, System Design, Cloud & Distributed, STAR Communication).
   - Display progress bar, department score, benchmark comparison, and delta tag.
   - Action card: "Deploy Remedial Credit: Distributed Systems Workshop".
2. Build `PlacementTierDistributionCard`:
   - Stacked multi-color cohort bar: Super Dream (38), Dream (64), Core Tech (22), Remedial (18).
   - Enterprise shortlist list: TechCorp Global (52), FinTech Apex (38), DataScale AI (18).

### Phase 4: Student Cohort Roster & Remedial Management
1. Build `CohortRosterTable`:
   - Search input for candidate name/USN.
   - Filter pills: All (142), Tier-1 Ready (38), Dream (64), At-Risk (18).
   - Columns: Student Name & USN, Section & CGPA, Readiness Index bar, Primary Competency Gap, Assigned Evaluator, Mock Status, Readiness Status, and Actions ("View Full Roster", "Assign Remedial", "Mandatory Sync").
2. Build `DeployWorkshopModal`:
   - Form for scheduling remedial event via `POST /api/events`.

### Phase 5: Verification & Routing Registration
1. Add `<Route path="/faculty/hod-analytics" element={<HODAnalyticsPage />} />` in `src/App.jsx`.
2. Test RBAC restriction: ensure faculty with `isHOD: false` cannot view data.
