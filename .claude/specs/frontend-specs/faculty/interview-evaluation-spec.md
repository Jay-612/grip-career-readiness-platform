# Screen Specification: Faculty Mock Interview Evaluation Panel

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Faculty/interview-evaluation/interview_evaluation_screen.png`
- **Visual Description**: Technical mock interview grading and rubric certification console. Header shows breadcrumb "Portal > Interview Evaluation Panel > Evaluation #INT-2026-804", "Save Draft", and "+ Submit & Sign Rubric (PDF)" buttons. Candidate Bar displays student avatar ("RM"), name "Rohan Mehta", "Tier-1 CS" badge, readiness tag ("85% Ready"), Roll No, Year, CGPA 9.24, Rank 4, Mock Technical Screen details ("Distributed Systems & Caching Architecture, 45 min", Dept. Seminar Lab 3), active session timer (`00:38:15 IN PLAY`), "Pause Timer", and "View Resume PDF" buttons. Middle section features the Standardized Evaluation Matrix with 4 Domain Rubrics:
  - Domain 01: System Architecture & Modularity (Weight 30%) - 4.5 / 5.0 (Grade A+ / Exceptional), 5 discrete rating buttons (1.0 to 5.0), evaluator feedback text, and verified rubric checklist tags (`Clean Service Boundaries`, `Courier Acid Patterns`, `Decoupled Async Message-Bus`).
  - Domain 02: Concurrency, Data Consistency & Caching (Weight 25%) - 4.2 / 5.0 (Grade A / Strong).
  - Domain 03: Fault Tolerance & Partition Handling (Weight 25%) - 3.8 / 5.0 (Flagged Improvement Area, Grade B+ / Modest Pass).
  - Domain 04: Technical Articulation & STAR Communication (Weight 20%) - 4.8 / 5.0 (Grade A++ / Top Tier).
Right summary rail displays Cumulative Mock Evaluation Score (4.35 / 5.0, Status: Approved), Placement Readiness Score impact (+4.8% Boost, 85.0% -> Projected 89.8%), Cohort Benchmark (Top 4% of CSE 2026), Recruiter Match Alignment (TechCorp 91.2%, CloudSys 87.5%), Transcript History of past mocks, Digital Faculty Attestation card with evaluator signature details and certification checkbox, and "Publish Evaluation to Student Portal" CTA button. Bottom features Faculty Synthesis & Hiring Recommendation with written summary textarea, placement verdict radios (`Clear for Tier-1 Super-Dream Drives`, `Tier-2 Re-evaluation Required`, `Remedial Prep Required`), and automated remedial sprint badge.

## 2. Intended User Role
- `faculty` (and `admin` / accredited placement evaluators).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/evaluationRoutes.js`
  - `backend/routes/appointmentRoutes.js`
  - `backend/routes/userRoutes.js`
  - `backend/routes/placementRoutes.js`
- **Controllers**:
  - `backend/controllers/evaluationController.js` (`saveEvaluationScore`)
  - `backend/controllers/interviewController.js` (`getAppointments`)
  - `backend/controllers/userController.js` (`getUserById`)
  - `backend/controllers/placementController.js` (`getPlacementReadiness`)
- **Models**: `EvaluationScore.js`, `MockInterview.js`, `StudentProfile.js`, `User.js`

## 4. Exact API Endpoints Mapped
- `POST /api/skills/evaluation` — Submits structured mock interview evaluation scores, rubrics, and feedback notes (handled by `evaluationController.saveEvaluationScore`).
- `GET /api/appointments` — Retrieves active mock interview session details and student candidate info.
- `GET /api/placement/readiness/:studentId` — Retrieves student's current readiness score to calculate projected impact.
- `GET /api/users/:id` — Retrieves student's full academic dossier and resume link.

## 5. Required HTTP Operations
- `GET`: Loads interview metadata, student academic history, and previous evaluation transcripts.
- `POST`: Dispatches signed evaluation rubric and updates student's official readiness score.

## 6. Reusable Components
- `FacultySidebar`: Persistent faculty navigation.
- `PortalTopBar`: Top header bar.
- `RubricRatingButtons`: 5-step discrete rating buttons (1.0 Unsatisfactory, 2.0 Developing, 3.0 Competent, 4.0 Proficient, 5.0 Industry Benchmark).
- `TimerBadge`: Active countdown/count-up session timer with pause control.
- `ReadinessDeltaCard`: Visual comparison of current vs projected readiness score.
- `PrimaryButton`: "Publish Evaluation to Student Portal" action button.

## 7. Page-Specific Components
- `CandidateInfoBar`: Candidate summary banner with CGPA, rank, and resume viewer.
- `EvaluationDomainCard`: Card containing domain weights, discrete rating buttons, written notes, and checklist tags.
- `DigitalAttestationCard`: Faculty verification signature card with digital attestation checkbox.
- `HiringVerdictSelector`: Radio button group selecting placement clearance category.

## 8. Loading States
- Shimmer placeholders for evaluation domains and candidate info while session loads.
- Primary publish button shows spinner during `POST /api/skills/evaluation`.

## 9. Error States
- Form validation banner if any evaluation domain is unrated.
- Warning modal if publishing evaluation without checking the digital attestation checkbox.

## 10. Empty States
- "No active mock interview session selected" if URL parameter is missing.

## 11. Form Validation Requirements
- All 4 domain scores must be assigned between 1.0 and 5.0.
- Evaluator feedback text: Required for any score below 4.0.
- Hiring verdict must be selected.
- Digital attestation checkbox must be checked before final publish.

## 12. RBAC Restrictions
- Restricted to users with role `faculty` or `admin`.

## 13. Routing Path
- `/faculty/evaluations/:interviewId` (or `/faculty/evaluations`)

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: 2-column layout (Left: candidate bar & 4 domain cards flex-1, Right: summary & attestation rail 360px).
- **Tablet (768px - 1279px)**: Stacked single column with summary rail positioned after domains.
- **Mobile (< 768px)**: 1-column layout; candidate bar wraps into compact rows; rating buttons become a sliding horizontal bar or dropdown.
