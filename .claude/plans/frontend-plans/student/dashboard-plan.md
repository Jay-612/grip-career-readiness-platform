# Implementation Plan: Student Dashboard

## 1. Goal
Implement `StudentDashboard.jsx` conforming to `.claude/specs/frontend-specs/student/dashboard-spec.md` and screenshot `.claude/images/stitch/Student/dashboard/dashboard_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Axios instance: `src/services/apiClient.js`
- React Router v6: `useNavigate`, `useLocation`
- Layout components: `StudentSidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Declaration & Data Fetching Hookup
1. Create `src/pages/Student/StudentDashboard.jsx`.
2. Declare component states:
   - `userProfile`: User and student profile details (`name`, `semester`, `selectedCareer`, `readinessScore`).
   - `progressData`: Dashboard analytics (`milestones`, `goals`, `metrics`).
   - `placementData`: Placement readiness and company match data.
   - `appointments`: Scheduled sessions list.
   - `isLoading`: Boolean (`true` initially).
   - `error`: String (`null`).
3. Set up `useEffect` hook to execute concurrent data fetching:
   - Call `GET /api/users/profile` to obtain authenticated student `_id` and base info.
   - Using student `_id`, execute `Promise.allSettled`:
     - `GET /api/progress/dashboard/:studentId`
     - `GET /api/placement/readiness/:studentId`
     - `GET /api/placement/company-match/:studentId`
     - `GET /api/appointments`
   - Store results into respective states and set `isLoading = false`.

### Phase 2: Structural Layout & Navigation
1. Wrap page with `StudentSidebar` and `PortalTopBar`.
2. Construct main 2-column flex grid:
   - Left section (flex-1): Hero banner, metric cards, semester stepper, active sprint goals, live activity feed.
   - Right section (w-80 / w-96): Radial readiness gauge, rubric weights breakdown, company alignment list, scheduled sessions, recommended action buttons.

### Phase 3: Interactive Widgets & Stitch Design Elements
1. Build `StudentHeroBanner`:
   - Display personalized greeting and placement ranking ("Top 4%").
2. Build `SemesterRoadmapStepper`:
   - Render semester nodes with status icons (checked for past semesters, pulsing active ring for Sem 5).
3. Build `ActiveGoalsList`:
   - Render goals with priority badges and dynamic progress bars.
4. Build `ScheduledSessions`:
   - Render interview slot cards with "View Prep Sheet" and "Join Room" actions.

### Phase 4: Loading Skeletons & Error Boundaries
1. Render skeleton shimmer cards for metrics and feed while `isLoading === true`.
2. Wrap components in error boundary cards with retry buttons.

### Phase 5: Verification & Routing Registration
1. Mount route `<Route path="/student/dashboard" element={<StudentDashboard />} />` in `src/App.jsx`.
2. Validate responsiveness on mobile and desktop viewports.
