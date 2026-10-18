# Screen Specification: Student Goal Tracker & Sprint Management

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Student/goal-tracker/goal_tracker_screen.png`
- **Visual Description**: Academic sprint and weekly commitment tracker. Top header displays page title "Academic Sprint & Placement Goals", subtitle "Track semester milestones, weekly commitments, and skill acquisition deadlines.", status badge "Semester 5 On-Track (Week 3 of 16)", search bar, "Filter by Semester 5" dropdown, and "+ Create New Goal" CTA button. 4 key metric cards at the top show: Active Goals (6 Total, 3 High Priority), Sprint 5 Velocity (78%, 14 of 18 sub-milestones completed), Weekly Completion (85%, Top 10% in CSE Cohort), and Placement Drive (42 Days, Tier-1 Drive Starts Oct 2026). Below is a filter tab strip (All Goals 6, Active Semester 5 4, Weekly Sprints 3, Placement Milestones 2, Completed Archives 18; Sort by: Highest Priority). Section 1 displays Semester Strategic Milestones (3 large cards: Master Distributed Systems Architecture, Solve 150 LeetCode DSA Problems, Secure AWS Solutions Architect Associate Certification) with progress bars, topic breakdowns, and action links. Section 2 displays Current Sprint: Week 3 (Sep 15 - Sep 21) with sprint cards (In Progress: Redis Distributed Cache, Completed: LeetCode Contest & DP Solutions, Pending Review: Microservices Capstone Diagram, Scheduled: Peer Mock Interview on System Design). Section 3 displays Goal Completion & Faculty Verification Log audit table showing Goal Name, Category, Completed Date, Verified By, and Readiness Impact (+3.0% Placement Ready).

## 2. Intended User Role
- `student` (with audit and oversight by `faculty` advisors).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/goalRoutes.js`
  - `backend/routes/progressRoutes.js`
  - `backend/routes/userRoutes.js`
- **Controllers**:
  - `backend/controllers/goalController.js` (`saveWeeklyGoals`, `updateGoalStatus`)
  - `backend/controllers/progressController.js` (`getGoalsAnalysis`, `getProgressDashboard`)
  - `backend/controllers/userController.js` (`getProfile`)
- **Models**: `WeeklyGoal.js`, `ActionPlan.js`, `SemesterPlan.js`, `StudentProfile.js`

## 4. Exact API Endpoints Mapped
- `POST /api/goals` — Saves new weekly goal items for authenticated student.
- `PUT /api/goals/:goalId` — Updates status of a goal item (`Completed`, `In Progress`, `Pending Review`).
- `GET /api/progress/goals/:studentId` — Retrieves goal completion analytics, sprint velocity, and weekly breakdown.
- `GET /api/progress/dashboard/:studentId` — Retrieves active milestones, weekly goals, and audit log.

## 5. Required HTTP Operations
- `GET`: Fetches weekly goals, active sprint milestones, and verification audit records.
- `POST`: Creates and persists new goal items.
- `PUT`: Updates goal progress or toggles completion status.

## 6. Reusable Components
- `StudentSidebar`: Navigation sidebar with "Goal Tracker (Sprint)" active badge.
- `PortalTopBar`: Search, session selection, notifications.
- `MetricSummaryCard`: Top velocity and completion metric tiles.
- `FilterTabs`: Tab pills with badge counts.
- `StatusBadge`: Colored status chips (In Progress - Blue, Completed - Green, Pending Review - Orange, Scheduled - Red/Pink).
- `PrimaryButton`: "+ Create New Goal" button.

## 7. Page-Specific Components
- `SemesterMilestoneCard`: Card displaying macro-objective, checkpoints list, and progress bar.
- `SprintTaskCard`: Card displaying sprint task, deadline, category, and status toggle.
- `VerificationAuditTable`: Table listing verified completed milestones with faculty endorsements and readiness delta.
- `CreateGoalModal`: Modal form for adding weekly goals.

## 8. Loading States
- Skeleton cards for sprint tasks and milestones during initial fetch.
- Task status toggle shows subtle spinning indicator while `PUT /api/goals/:goalId` resolves.

## 9. Error States
- Banner error if goal update fails, reverting optimistic UI checkbox.
- Form error message in goal creation modal if required fields are missing.

## 10. Empty States
- "No tasks scheduled for this sprint" with "+ Add Quick Weekly Task" button when sprint list is empty.

## 11. Form Validation Requirements
- Goal Title: Required, min 3 characters.
- Category: Required (e.g., Core CS, Software Eng, Placement Prep).
- Target Date: Required valid future date.
- Priority: Required selection (High, Medium, Low).

## 12. RBAC Restrictions
- Restricted to authenticated `student` (own goals). Faculty can view student goals via `/api/progress/goals/:studentId`.

## 13. Routing Path
- `/student/goals`

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: 3-card grid for Strategic Milestones; 4-card grid for Current Sprint tasks; full verification table.
- **Tablet (768px - 1279px)**: 2-column grid for milestones and sprint tasks; verification table horizontally scrollable.
- **Mobile (< 768px)**: 1-column card stack; top metric strip wraps into a 2x2 grid.
