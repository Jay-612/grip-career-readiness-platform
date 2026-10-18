# Implementation Plan: Recruiter Candidate Interview Evaluation & Feedback Portal

## 1. Goal
Construct `StudentFeedbackPage.jsx` based on `.claude/specs/frontend-specs/recruiter/student-feedback-spec.md` and screenshot `.claude/images/stitch/Recruiter/student-feedback/student_feedback_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Centralized Axios client: `src/services/apiClient.js`
- React Router v6: `useParams`, `useNavigate`
- Layout components: `RecruiterSidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Recruiter/StudentFeedbackPage.jsx`.
2. Define states:
   - `queue`: Array of candidates awaiting post-interview evaluation.
   - `selectedCandidateId`: String / ObjectId (default to first student in queue).
   - `selectedCandidate`: Object (`name`, `studentId`, `rollNo`, `cgpa`, `round`, `role`).
   - `scores`: `{ architecture: 4.8, concurrency: 4.5, lld: 4.6, star: 4.8 }`.
   - `evaluatorNotes`: `{ architecture: '', concurrency: '', lld: '', star: '' }`.
   - `feedbackText`: String (`''`).
   - `verdict`: String (`'strong_hire'`).
   - `syncWorkday`: Boolean (`true`).
   - `notifyPlacementCell`: Boolean (`true`).
   - `filter`: String (`'needs_feedback'`).
   - `isSubmitting`: Boolean (`false`).
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`:
   - Fetch candidate list via `GET /api/department/placement-stats` or candidate queue.
   - If candidates exist, select first candidate and fetch `GET /api/users/:id` and `GET /api/placement/readiness/:studentId`.
   - Set `isLoading = false`.

### Phase 2: Master-Detail Split Pane Scaffolding
1. Wrap page with `RecruiterSidebar` and `PortalTopBar`.
2. Construct 2-column layout:
   - Left Priority Queue (w-96): Summary badges (Pending Feedback 14, Strong Hire 10), filter tabs, and queue of candidate cards.
   - Right Detail Scorecard (flex-1): Candidate header banner, 4 competency rubrics, constructive feedback editor, and hiring verdict cards.

### Phase 3: Candidate Banner & Rubric Scoring
1. Build `CandidateDossierBanner`:
   - Candidate name, CGPA, target role, composite score (4.7 / 5.0), and "Extend Super Dream Offer (26 LPA)" CTA button.
2. Build `CompetencyRubricList`:
   - 4 competency domains: System Architecture, Concurrency & Thread Safety, Low-Level Design, STAR Behavioral.
   - 5-button discrete score selector (1.0 to 5.0) and evaluator notes textarea.
   - Live composite score calculation:
     `compositeScore = (scores.architecture * 0.3) + (scores.concurrency * 0.25) + (scores.lld * 0.25) + (scores.star * 0.2)`.

### Phase 4: Constructive Feedback & Hiring Verdict
1. Build `ConstructiveFeedbackEditor`:
   - Markdown editor pre-structured with Key Strengths and Areas for Growth.
2. Build `HiringVerdictCards`:
   - 4 selectable cards:
     - `Strong Hire — Super Dream Offer` (26 LPA)
     - `Hire — Core SDE-1 Offer` (22 LPA)
     - `Hold for Second Technical Review`
     - `Non-Select`
3. Checkboxes: Workday ATS sync and Placement Cell notification.
4. Action buttons: "Save Draft", "Request Co-Panelist Sign-off", "Finalize Scorecard & Dispatch to Student Portal".

### Phase 5: Submission & API Dispatch
1. Implement `handleSubmitFeedback()`:
   - Validate non-empty feedback notes.
   - Set `isSubmitting = true`.
   - Dispatch `POST /api/feedback` with payload:
     ```json
     {
       "studentId": selectedCandidate.studentId,
       "ratings": {
         "technical": scores.architecture,
         "communication": scores.star,
         "industryReadiness": scores.concurrency
       },
       "comments": feedbackText,
       "verdict": verdict,
       "scores": scores,
       "compositeScore": compositeScore
     }
     ```
   - On success, update candidate status in queue and display success toast.
   - Set `isSubmitting = false`.

### Phase 6: Verification & Routing Registration
1. Add `<Route path="/recruiter/feedback" element={<StudentFeedbackPage />} />` and `<Route path="/recruiter/feedback/:studentId" element={<StudentFeedbackPage />} />` in `src/App.jsx`.
2. Test rubric rating updates, composite score recalculation, and `POST /api/feedback` payload integrity.
