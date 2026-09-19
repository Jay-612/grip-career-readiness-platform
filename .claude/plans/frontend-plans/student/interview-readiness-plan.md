# Implementation Plan: Student Interview Readiness & Mock Evaluation Center

## 1. Goal
Construct `InterviewReadinessPage.jsx` based on `.claude/specs/frontend-specs/student/interview-readiness-spec.md` and screenshot `.claude/images/stitch/Student/interview-readiness-center/interview_readiness_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Centralized Axios client: `src/services/apiClient.js`
- Layout components: `StudentSidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Student/InterviewReadinessPage.jsx`.
2. Define states:
   - `readinessScore`: Comprehensive readiness object (`overallScore`, `tier1Status`, `domainScores`).
   - `upcomingInterviews`: Array of confirmed upcoming mock sessions.
   - `availableSlots`: Array of bookable evaluator slots.
   - `historicalScorecards`: Array of completed evaluation records with rubrics.
   - `isBookingModalOpen`: Boolean (`false`).
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`:
   - Fetch `GET /api/users/profile` to get `studentId`.
   - Concurrently fetch:
     - `GET /api/placement/readiness/:studentId`
     - `GET /api/progress/interviews/:studentId`
     - `GET /api/appointments`
   - Map payload into state and set `isLoading = false`.

### Phase 2: Comprehensive Score Banner & Domain Breakdown
1. Render `ComprehensiveScoreCard`:
   - Display 85% overall score, Tier-1 Qualified status badge, and timeline target ("Tier-1 Recruitment Window: Oct 2026").
   - Render 4 domain score progress bars:
     - DSA & Problem Solving (88%)
     - System Design & Architecture (80%)
     - Behavioral & STAR Communication (90%)
     - Core CS Fundamentals (84%)

### Phase 3: Upcoming Sessions & Bookable Slots
1. Render `UpcomingConfirmedMockInterviews`:
   - Session cards with interview mode (In-Person / Virtual Google Meet), evaluator name, date/time, and action buttons ("Download Rubric Sheet", "Join Video Room").
2. Render `BookMockInterviewSlots`:
   - Filter pills: All Slots (12), Faculty Evaluators, Industry Alumni, Placement Panels.
   - Slot cards with topic, panel lead, room/link, and "Book Slot ->" action button.
   - On booking, dispatch `POST /api/appointments` and refresh list.

### Phase 4: Historical Evaluation Scorecards & Remedial Banner
1. Render `HistoricalScorecardsList`:
   - Scorecards with overall grade (A+, A-), score (4.5/5.0, 4.2/5.0), rubric progress bars, quoted evaluator feedback, and digital signature badge.
2. Render `TargetImprovementSprintBanner`:
   - Display recommended sprint ("Solidify Raft Consensus & Distributed Leader Election") and CTA button.

### Phase 5: Verification & Routing Registration
1. Mount `<Route path="/student/interview-readiness" element={<InterviewReadinessPage />} />` in `src/App.jsx`.
2. Verify slot booking and score display integrity.
