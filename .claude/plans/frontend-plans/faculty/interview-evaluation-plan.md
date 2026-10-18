# Implementation Plan: Faculty Mock Interview Evaluation Panel

## 1. Goal
Construct `InterviewEvaluationPage.jsx` based on `.claude/specs/frontend-specs/faculty/interview-evaluation-spec.md` and screenshot `.claude/images/stitch/Faculty/interview-evaluation/interview_evaluation_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Axios client: `src/services/apiClient.js`
- React Router v6: `useParams`, `useNavigate`
- Layout components: `FacultySidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Faculty/InterviewEvaluationPage.jsx`.
2. Define states:
   - `candidate`: Object (`name`, `studentId`, `rollNo`, `cgpa`, `topic`, `time`).
   - `scores`: `{ systemArch: 4.5, concurrency: 4.2, faultTolerance: 3.8, articulation: 4.8 }`.
   - `notes`: `{ systemArch: '', concurrency: '', faultTolerance: '', articulation: '' }`.
   - `synthesis`: String (`''`).
   - `verdict`: String (`'tier1_super_dream'`).
   - `isAttested`: Boolean (`false`).
   - `timerSeconds`: Number (`2295` -> 38:15).
   - `isTimerRunning`: Boolean (`true`).
   - `isSubmitting`: Boolean (`false`).
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`:
   - Read `interviewId` from URL parameters.
   - Fetch `GET /api/appointments` and find matching interview session.
   - Using student ID, fetch `GET /api/placement/readiness/:studentId` to get base readiness score.
   - Set `isLoading = false`.

### Phase 2: Candidate Bar & Live Timer
1. Render `CandidateInfoBar`:
   - Student avatar, name, CGPA, rank, and mock topic details.
   - Live session timer with `Pause / Resume` button.
   - "View Resume PDF" action link.

### Phase 3: Standardized Evaluation Rubric Matrix
1. Render 4 domain evaluation cards:
   - Domain 1: System Architecture & Modularity (Weight 30%)
   - Domain 2: Concurrency, Data Consistency & Caching (Weight 25%)
   - Domain 3: Fault Tolerance & Partition Handling (Weight 25%)
   - Domain 4: Technical Articulation & STAR Communication (Weight 20%)
2. Include 5-button discrete score selector for each domain (1.0 to 5.0) and evaluator feedback textarea.
3. Dynamically compute weighted composite score:
   `compositeScore = (scores.systemArch * 0.3) + (scores.concurrency * 0.25) + (scores.faultTolerance * 0.25) + (scores.articulation * 0.2)`.

### Phase 4: Right Summary Rail & Digital Attestation
1. Render `CumulativeScoreCard`:
   - Display composite score (e.g. 4.35 / 5.0) and status badge ("Approved").
   - Display placement readiness boost (+4.8% Boost, 85.0% -> 89.8%).
   - Display recruiter alignment match percentages (TechCorp, CloudSys).
2. Render `DigitalFacultyAttestationCard`:
   - Evaluator credentials and digital signature timestamp.
   - Attestation certification checkbox.
3. Build `FacultySynthesisCard`:
   - Written synthesis notes, placement verdict radio group, and "Publish Evaluation to Student Portal" CTA button.

### Phase 5: Submission & API Dispatch
1. Implement `handleSubmitEvaluation()`:
   - Assert `isAttested === true`.
   - Set `isSubmitting = true`.
   - Dispatch `POST /api/skills/evaluation` with payload:
     ```json
     {
       "studentId": candidate.studentId,
       "interviewId": interviewId,
       "scores": scores,
       "compositeScore": compositeScore,
       "notes": notes,
       "synthesis": synthesis,
       "verdict": verdict
     }
     ```
   - On success, redirect to `/faculty/dashboard` with success toast.
   - Set `isSubmitting = false`.

### Phase 6: Verification & Routing Registration
1. Add `<Route path="/faculty/evaluations/:interviewId" element={<InterviewEvaluationPage />} />` in `src/App.jsx`.
2. Verify composite score calculation and validation guard for attestation checkbox.
