# Implementation Plan: Student Career Compass & Strategic Pathways

## 1. Goal
Construct `CareerCompassPage.jsx` based on `.claude/specs/frontend-specs/student/career-compass-spec.md` and screenshot `.claude/images/stitch/Student/career-compass/career_compass_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Centralized Axios client: `src/services/apiClient.js`
- Layout components: `StudentSidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Student/CareerCompassPage.jsx`.
2. Define states:
   - `selectedCareer`: String (`'Distributed Systems & Cloud Backend Engineer'`).
   - `roadmap`: Object containing semester steps, required skills, and milestone nodes.
   - `gapAnalysis`: Object containing missing skills and match percentages.
   - `recommendedMentors`: Array of faculty and alumni mentors.
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`:
   - Fetch `GET /api/users/profile` to retrieve `selectedCareer` and `studentId`.
   - Concurrently fetch:
     - `GET /api/career/roadmap/:careerId`
     - `GET /api/placement/company-match/:studentId`
     - `GET /api/mentors/recommendation`
   - Store responses and set `isLoading = false`.

### Phase 2: Hero Banner & Career Track Cards
1. Render `CareerCompassHero`:
   - Display primary and secondary target badges, partner company badges, and feasibility match percentages.
2. Render 3 `CareerTrackCard` items:
   - Primary: Distributed Systems & Cloud Engineer (85% Match, Active).
   - Alternative: Full-Stack Product Engineer (82% Match).
   - Emerging: DevOps & Site Reliability Engineer (75% Match).
   - Wire "Manage Roadmap" and "Set as Target" buttons to dispatch `PUT /api/users/profile` with new `selectedCareer`.

### Phase 3: Milestone Roadmap Stepper & Gap Analysis
1. Render `RoadmapTimeline`:
   - Milestone nodes for Sem 3, Sem 4, Sem 5 (Current Sprint), Sem 6, and Sem 7-8.
   - Display completed checkmarks, active sprint badge, and upcoming locks.
2. Render `SkillGapClosureCard`:
   - List missing competencies (Kafka, gRPC, Kubernetes CI).
   - "Start Diagnostic Sprint" action button.
3. Render `FacultyAndAlumniGuidance`:
   - List matched mentors with "Schedule 1:1 Review" buttons.

### Phase 4: Multi-Track Comparison Matrix
1. Build comparison table comparing CTC, technical focus, industry weighting, readiness score, and active recruiter searches.
2. Ensure responsive horizontal scroll wrapper for mobile viewports.

### Phase 5: Verification & Routing Registration
1. Add `<Route path="/student/career-compass" element={<CareerCompassPage />} />` in `src/App.jsx`.
2. Verify switching career track updates state and refreshes roadmap milestones.
