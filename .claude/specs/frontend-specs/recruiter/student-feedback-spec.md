# Screen Specification: Recruiter Candidate Interview Evaluation & Feedback Portal

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Recruiter/student-feedback/student_feedback_screen.png`
- **Visual Description**: Post-interview evaluation scorecard, rubric grading, and hiring decision console. Top header displays title "Candidate Interview Evaluation & Feedback Portal", subtitle ("Record round outcomes, competency rubrics, hiring recommendations, and actionable student feedback."), drive status badge ("Autumn Drive: Day 2 Technical"), and summary badges: Pending Feedback (14), Driving Hire / Super Dream (10), Under Deliberation (3), Official Offers Extended (8). Filter tabs include: All Evaluations (24), Needs Feedback (14), Round 2: System Design (8), Round 1: DSA (10), Bar-Raiser (4), Offers Extended (8). Left pane displays the Priority Queue (14 Left) with candidate cards (Card 1: Rohan Mehta, Round 2: System Design, Score 4.7/5.0, Strong Hire; Card 2: Ananya Iyer, Score 4.1/5.0, Hire: Core Tier-1; Card 3: Pooja Hegde, Score 4.5/5.0; Card 4: Vikramaditya Rao, Score 3.6/5.0, Hold / Review; Card 5: Sahil Sharma, Score 2.9/5.0, Non-Select). Right detail pane displays selected candidate evaluation for Rohan Mehta:
  - Header: Candidate Name, "Strong Hire [Super Dream]" badge, Final Year B.Tech CSE, CGPA 9.24/10, Target: SDE-1 Cloud Platform (24-28 LPA), Composite Score: 4.7 / 5.0 (Top 2% of Cohort), Interview Panel info (Marcus Vance, Vikram Singhania), buttons: "Dossier (PDF)", "Flag for Co-panel (4/4)", and "Extend Super Dream Offer (26 LPA)" primary CTA button.
  - Technical Competency Evaluation Rubric (Round 2: System Architecture) with 4 domains, discrete rating buttons (1.0 to 5.0), and evaluator notes:
    1. System Architecture & Scalability (Score 4.8 / 5.0).
    2. Concurrency Primitives & Thread Safety (Score 4.5 / 5.0).
    3. Low-Level Design & Code Cleanliness (Score 4.6 / 5.0).
    4. STAR Behavioral & Leadership Principles (Score 4.8 / 5.0).
  - Constructive Feedback for Rohan markdown editor (Key Strengths, Areas for Continuous Growth).
  - Final Hiring Recommendation selection cards:
    - `Strong Hire — Super Dream Offer` (26 LPA, Tier-1 Direct placement) [Selected].
    - `Hire — Core SDE-1 Offer` (22 LPA, Tier-1 Standard placement).
    - `Hold for Second Technical Review`.
    - `Non-Select`.
  - Checkboxes: "Sync scorecard and qualitative notes directly into Workday ATS Job Req: #WD-9641", "Send official hiring recommendation to University Placement Cell (Prof. Neha Sharma)".
  - Bottom actions: "Save Draft", "Request Co-Panelist Sign-off", "Finalize Scorecard & Dispatch to Student Portal (Ctrl+Enter)".

## 2. Intended User Role
- `recruiter` (and placement cell officers).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/feedbackRoutes.js`
  - `backend/routes/userRoutes.js`
  - `backend/routes/placementRoutes.js`
- **Controllers**:
  - `backend/controllers/feedbackController.js` (`addRecruiterFeedback`)
  - `backend/controllers/userController.js` (`getUserById`)
  - `backend/controllers/placementController.js` (`getPlacementReadiness`)
- **Models**: `RecruiterFeedback.js`, `RecruiterProfile.js`, `StudentProfile.js`, `User.js`, `Company.js`

## 4. Exact API Endpoints Mapped
- `POST /api/feedback` — Submits formal recruiter interview feedback, ratings, comments, and hiring verdict (handled by `feedbackController.addRecruiterFeedback`).
- `GET /api/users/:id` — Retrieves candidate profile, past coursework, and resume dossier.
- `GET /api/placement/readiness/:studentId` — Retrieves student's verified readiness score to compare with company benchmark.

## 5. Required HTTP Operations
- `GET`: Loads candidate queue, academic dossier, and past round scorecards.
- `POST`: Submits recruiter scorecard, hiring recommendation, and dispatches feedback.

## 6. Reusable Components
- `RecruiterSidebar`: Standard recruiter navigation with pending feedback badge.
- `PortalTopBar`: Top header bar.
- `FilterTabs`: Category filter tabs.
- `RubricRatingButtons`: 5-step discrete rating buttons (1.0 to 5.0).
- `MarkdownEditor`: Formatting controls for constructive candidate feedback.
- `PrimaryButton`: "Finalize Scorecard & Dispatch to Student Portal" action button.

## 7. Page-Specific Components
- `CandidatePriorityQueue`: Master list of students awaiting interview evaluation.
- `CandidateDossierBanner`: Right-pane candidate summary with composite score and offer extension CTA.
- `HiringVerdictCards`: Selectable recommendation cards (Strong Hire, Standard Hire, Hold, Non-Select).
- `ATSSyncCheckboxes`: Integration confirmation checkboxes for Workday and placement cell notification.

## 8. Loading States
- Shimmer skeletons in priority queue and evaluation form while candidate data loads.
- Primary submit button shows spinner during `POST /api/feedback`.

## 9. Error States
- Banner error if candidate dossier fails to fetch.
- Validation warning if any rubric category is unrated or written feedback is empty.

## 10. Empty States
- "All candidate evaluations completed for this round" when priority queue is empty.

## 11. Form Validation Requirements
- All 4 rubric scores (Architecture, Concurrency, LLD, STAR) must be rated between 1.0 and 5.0.
- Constructive feedback notes: Required, min 20 characters.
- Hiring verdict: Exactly one recommendation must be selected.

## 12. RBAC Restrictions
- Protected by `protect` and `authorize('recruiter', 'placement cell', 'placement', 'admin')`.

## 13. Routing Path
- `/recruiter/feedback` (or `/recruiter/feedback/:studentId`)

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: 2-pane split view (Left priority queue 380px, Right scorecard flex-1).
- **Tablet (768px - 1279px)**: Split view with collapsible list or tab toggling.
- **Mobile (< 768px)**: Master-detail view; scorecard occupies full screen with back button.
