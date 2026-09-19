# Screen Specification: Student Interview Readiness & Mock Evaluation Center

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Student/interview-readiness-center/interview_readiness_screen.png`
- **Visual Description**: Mock interview diagnostic and preparation center. Header displays title "Placement Readiness & Mock Interview Center", subtitle "Standardized campus evaluation rubrics, faculty-reviewed mock interviews, and AI-driven skill diagnostics.", live presence badge ("14 Faculty & Alumni Evaluators Active This Week"), "Export Readiness Transcript (PDF)", and "+ Book New Mock Interview" buttons. Top section features a Comprehensive Score Card with Overall Score 85% (+12% this month), Tier-1 Qualified Status badge ("5 of 6 Rubrics Verified"), and 4 domain score bars: DSA & Problem Solving (88%), System Design & Architecture (80%), Behavioral & STAR Communication (90%), Core CS Fundamentals (84%). Section 1 displays Upcoming Confirmed Mock Interviews (Faculty System Design Mock Screen with Prof. Neha Sharma, in-person; Alumni Staff Engineer Technical Screen with Amit Verma, virtual via Google Meet). Section 2 displays Book Faculty & Alumni Mock Interview Slots with filter pills (All Slots 12, Faculty Evaluators, Industry Alumni, Placement Panels) and bookable slots (System Design: Large-Scale Microservices, Tier-1 Recruiter Simulated HR, DevOps & Cloud SRE Mock). Section 3 displays Historical Evaluation Scorecards & Faculty Feedback Log (Scorecard 1: Grade A+ Exceptional 4.5/5.0 Distributed Systems by Prof. Neha Sharma with 3 rubric bars, feedback quote, and "Digital Signature Verified"; Scorecard 2: Grade A- Strong Pass 4.2/5.0 Advanced DSA by Amit Verma). Bottom section features a Target Improvement Sprint card ("Solidify Raft Consensus & Distributed Leader Election") with CTA "Start Recommended Sprint 5.4 ->".

## 2. Intended User Role
- `student` (with corresponding evaluation interfaces for `faculty`, `alumni`, and `recruiter`).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/placementRoutes.js`
  - `backend/routes/progressRoutes.js`
  - `backend/routes/appointmentRoutes.js`
  - `backend/routes/userRoutes.js`
- **Controllers**:
  - `backend/controllers/placementController.js` (`getPlacementReadiness`)
  - `backend/controllers/progressController.js` (`getInterviewAnalysis`, `getProgressDashboard`)
  - `backend/controllers/interviewController.js` (`getAppointments`, `scheduleMockInterview`)
- **Models**: `MockInterview.js`, `EvaluationScore.js`, `StudentProfile.js`, `User.js`

## 4. Exact API Endpoints Mapped
- `GET /api/placement/readiness/:studentId` — Retrieves comprehensive readiness percentage and rubric pass/fail counts.
- `GET /api/progress/interviews/:studentId` — Retrieves past mock interview evaluations, rubric score breakdowns, and evaluator comments.
- `GET /api/appointments` — Retrieves upcoming scheduled mock interview sessions for this student.
- `POST /api/appointments` — Books a new mock interview appointment slot.

## 5. Required HTTP Operations
- `GET`: Loads readiness scores, domain competency bars, upcoming mock sessions, and historical evaluation scorecards.
- `POST`: Schedules a new mock interview session with an evaluator.

## 6. Reusable Components
- `StudentSidebar`: Standard student navigation sidebar.
- `PortalTopBar`: Top navigation and search bar.
- `ScoreBar`: Progress bar displaying score percentage and rating level.
- `ScheduledSessionCard`: Card displaying upcoming interview details and meeting actions.
- `BookableSlotCard`: Card showing interview topic, evaluator panel, time, and "Book Slot ->" button.
- `EvaluationScorecard`: Detailed card with overall grade, rating, rubric bars, quoted feedback, and digital signature badge.

## 7. Page-Specific Components
- `ComprehensiveScoreBanner`: Top card with circular or delta badge and 4 core domain score bars.
- `TargetImprovementSprintBanner`: Bottom callout highlighting specific curriculum sprint to close rubric gaps.
- `BookMockModal`: Modal for selecting topic, panel, and scheduling slot.

## 8. Loading States
- Shimmer placeholders for score bars and historical scorecards while fetching.
- Booking button enters disabled spinner state while appointment is created.

## 9. Error States
- Alert banner if evaluation history fails to load.
- Toast error if booking slot is already taken.

## 10. Empty States
- "No historical mock evaluations on record" with "Book Your First Diagnostic Mock" prompt.
- "No upcoming interviews scheduled" with booking shortcut.

## 11. Form Validation Requirements
- Slot booking requires selected date, time, and interview round category.

## 12. RBAC Restrictions
- Restricted to authenticated `student` (own records). Evaluators view/submit via their respective consoles.

## 13. Routing Path
- `/student/interview-readiness`

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: 2-column grid for upcoming interviews; 3-column grid for bookable slots; 2-column grid for historical scorecards.
- **Tablet (768px - 1279px)**: 2-column grid for slots; stacked scorecards.
- **Mobile (< 768px)**: 1-column layout for all sections; score breakdown bars stack vertically.
