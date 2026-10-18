# Implementation Plan: Student Goal Tracker & Sprint Management

## 1. Goal
Construct `GoalTrackerPage.jsx` based on `.claude/specs/frontend-specs/student/goal-tracker-spec.md` and screenshot `.claude/images/stitch/Student/goal-tracker/goal_tracker_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Centralized Axios client: `src/services/apiClient.js`
- Layout components: `StudentSidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Student/GoalTrackerPage.jsx`.
2. Define states:
   - `goals`: Array of goal objects.
   - `sprintMetrics`: `{ totalGoals: 6, velocity: 78, weeklyCompletion: 85, daysToDrive: 42 }`.
   - `strategicMilestones`: Array of macro-semester milestones.
   - `auditLog`: Array of verified completed goals.
   - `activeTab`: String (`'all'`).
   - `isModalOpen`: Boolean (`false`).
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`:
   - Fetch `GET /api/users/profile` to get `studentId`.
   - Concurrently fetch:
     - `GET /api/progress/goals/:studentId`
     - `GET /api/progress/dashboard/:studentId`
   - Map goals into state and set `isLoading = false`.

### Phase 2: Top Metric Strip & Filter Tabs
1. Render 4 metric summary cards (Active Goals, Sprint 5 Velocity, Weekly Completion, Placement Drive countdown).
2. Render filter tab pills: All Goals, Active Semester 5, Weekly Sprints, Placement Milestones, Completed Archives with item count badges.
3. Wire sort dropdown (Highest Priority, Due Soonest, Recently Added).

### Phase 3: Strategic Milestones & Sprint Cards
1. Build `SemesterStrategicMilestones`:
   - Render cards for Distributed Systems, LeetCode 150, and AWS Solutions Architect.
   - Include progress bars, checkpoint checklists, and "Update Progress" actions.
2. Build `CurrentSprintSection`:
   - Render 4 sprint task cards with priority chips, due date tags, category, and interactive status buttons.
   - When a status toggle is clicked:
     - Optimistically update task status in state.
     - Dispatch `PUT /api/goals/:goalId` with `{ status: newStatus }`.
     - On error, roll back state and display toast notification.

### Phase 4: Goal Creation Modal & Audit Log Table
1. Build `CreateGoalModal`:
   - Form inputs: Goal title, category, priority, target deadline.
   - On submit, dispatch `POST /api/goals`, append new goal to list, and close modal.
2. Build `GoalCompletionLogTable`:
   - Render completed milestone name, category badge, completion date, faculty verifier, and readiness impact score (+3.0%).

### Phase 5: Verification & Routing Registration
1. Mount route `<Route path="/student/goals" element={<GoalTrackerPage />} />` in `src/App.jsx`.
2. Verify creating a goal and updating task status communicates accurately with `/api/goals`.
