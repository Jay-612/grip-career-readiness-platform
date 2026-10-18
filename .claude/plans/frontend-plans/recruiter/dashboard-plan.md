# Implementation Plan: Recruiter Talent Dashboard & Campus Pipeline

## 1. Goal
Construct `RecruiterDashboard.jsx` based on `.claude/specs/frontend-specs/recruiter/dashboard-spec.md` and screenshot `.claude/images/stitch/Recruiter/dashboard/dashboard_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Centralized Axios client: `src/services/apiClient.js`
- Layout components: `RecruiterSidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Recruiter/RecruiterDashboard.jsx`.
2. Define states:
   - `recruiterProfile`: Object (`name`, `company`, `role`).
   - `talentPool`: `{ preScreenedCount: 32, endorsedCount: 24, bookedSlots: 48, totalSlots: 60, targetOffers: 15 }`.
   - `candidateBench`: Array of top eligible student candidate objects.
   - `driveSchedule`: Object containing funnel stages and 3-day recruitment timeline.
   - `competencyAlignment`: Array of alignment percentages (Distributed Systems 92%, DSA 84%, Cloud 84%, STAR 89%).
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`, execute concurrent API requests:
   - `GET /api/users/profile` -> `recruiterProfile`
   - `GET /api/department/placement-stats` -> `talentPool`
   - `GET /api/department/skill-gaps` -> `competencyAlignment`
   - `GET /api/events` -> `driveSchedule`
   - Set `isLoading = false`.

### Phase 2: Top KPI Strip & Brand Pipeline Banner
1. Render `RecruiterHeaderBanner`:
   - Company title ("TechCorp Global — Campus Recruitment & Talent Pipeline"), target cohort tags, and "Filter Criteria" / "Share Roster" action buttons.
2. Render 4 metric summary cards:
   - Pre-Screened Talent Pool (32 Candidates)
   - Faculty & Alumni Endorsed (24 Verified)
   - Interview Slots Booked (48 / 60 Slots)
   - Target Offers Allocation (15 SDE-1 Offers)

### Phase 3: Candidate Bench & Campus Drive Schedule
1. Build `PreScreenedCandidateBench`:
   - List candidate cards (Rohan Mehta 96% Fit, Ananya Iyer 91% Fit, Pooja Hegde 88% Fit).
   - Display CGPA, technical highlights, and action buttons ("Fast-Track to Final Round", "Shortlist for Panel 1", "View Dossier").
2. Build `CampusDriveFunnelAndSchedule`:
   - Pipeline funnel bar (142 Cohort -> 68 OA Shortlist -> 32 In Panels -> 15 Offers).
   - 3-Day recruitment schedule cards with dates, times, and candidate counts.
   - Workday ATS live connection status indicator.

### Phase 4: Curriculum Competency Alignment & ATS Export
1. Build `CompetencyAlignmentSection`:
   - 4 progress bars comparing student cohort preparation to TechCorp hiring rubrics.
   - "Export Candidate Manifest to Workday ATS" CTA button.

### Phase 5: Verification & Routing Registration
1. Add `<Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />` in `src/App.jsx`.
2. Test responsive breakpoint behavior and role authorization guard.
