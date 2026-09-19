# Implementation Plan: Faculty Dashboard

## 1. Goal
Construct `FacultyDashboard.jsx` based on `.claude/specs/frontend-specs/faculty/dashboard-spec.md` and screenshot `.claude/images/stitch/Faculty/dashboard/dashboard_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Axios client: `src/services/apiClient.js`
- Layout components: `FacultySidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Faculty/FacultyDashboard.jsx`.
2. Define states:
   - `facultyProfile`: Faculty details (`name`, `department`, `employeeId`, `isHOD`).
   - `cohortStats`: Placement statistics, readiness average, at-risk count.
   - `pendingSubmissions`: Array of student milestone submissions.
   - `skillGaps`: Object with cohort deficit metrics and affected candidate counts.
   - `todaySessions`: Array of today's scheduled interviews.
   - `recruiterDrives`: Array of visiting partner companies and eligible counts.
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`, invoke concurrent requests:
   - `GET /api/users/profile` -> `facultyProfile`
   - `GET /api/department/placement-stats` -> `cohortStats`
   - `GET /api/department/skill-gaps` -> `skillGaps`
   - `GET /api/guidance/requests` -> `pendingSubmissions`
   - `GET /api/appointments` -> `todaySessions`
   - Set `isLoading = false`.

### Phase 2: Structural Layout & Navigation
1. Wrap page with `FacultySidebar` and `PortalTopBar`.
2. Construct 2-column flex grid:
   - Main left section: Hero banner, top metric row, pending submissions table, priority interventions card.
   - Right rail: Today's agenda list, visiting recruiters alignment.

### Phase 3: Submissions Table & Intervention Widgets
1. Build `PendingMilestonesTable`:
   - Student info, milestone name, readiness score bar, timestamp, and action buttons ("Open Rubric", "Review Submission").
   - Clicking "Open Rubric" navigates to `/faculty/evaluations/:interviewId`.
2. Build `PriorityInterventionsCard`:
   - Display diagnostic alert regarding students scoring below cutoffs in System Design & Caching.
   - Action buttons: "Schedule Group Architecture Masterclass", "Send Automated Remedial Sprint Notice".
3. Build `TodayAgendaList`:
   - Sessions list with "Start Session" button linking to live meeting room or evaluation form.

### Phase 4: Loading Skeletons & Error Boundaries
1. Render skeleton blocks for cohort metrics, submissions queue, and agenda while loading.
2. Render error retry card if API requests fail.

### Phase 5: Verification & Routing Registration
1. Add `<Route path="/faculty/dashboard" element={<FacultyDashboard />} />` in `src/App.jsx`.
2. Test role guard to ensure non-faculty users are redirected.
