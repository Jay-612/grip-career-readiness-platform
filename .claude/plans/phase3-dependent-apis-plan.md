# Phase 3: Interactive Dependent APIs Implementation Plan

## Phase 1: Environment & Model Verification
1. Verify the project root directory and navigate to `backend/`.
2. Inspect `backend/model/index.js` to ensure the following models are exported:
   - `CareerRoadmap`
   - `SemesterPlan`
   - `WeeklyGoal`
   - `GuidanceRequest`
   - `GuidanceReply`
   - `FacultyProfile`
   - `AlumniProfile`
   - `MockInterview`
   - `EvaluationScore`
   - `RecruiterFeedback`
3. Confirm `backend/middleware/authMiddleware.js` is implemented and exports the JWT authentication verification function.

---

## Phase 2: Career Roadmap & Goals Implementation
4. **Create `backend/controllers/careerController.js`:**
   - Implement `submitCareerQuiz`: Evaluate input traits (`interests`, `strengths`, `weaknesses`) against `CareerRoadmap` and return `{ suggestedCareer }`.
   - Implement `getRoadmapById`: Query `CareerRoadmap` and joined/referenced `SemesterPlan` documents to return `{ career, steps }`.

5. **Create `backend/controllers/goalController.js`:**
   - Implement `saveWeeklyGoals`: Persist weekly goal records to `WeeklyGoal` collection with default status `in-progress`.
   - Implement `updateGoalStatus`: Find a goal by `req.params.goalId` and update its status (e.g., `"Done"` or `"Pending"`).

6. **Create `backend/routes/careerRoutes.js`:**
   - `POST /quiz` -> `careerController.submitCareerQuiz` (protected by `authMiddleware`)
   - `GET /roadmap/:careerId` -> `careerController.getRoadmapById` (protected by `authMiddleware`)

7. **Create `backend/routes/goalRoutes.js`:**
   - `POST /` -> `goalController.saveWeeklyGoals` (protected by `authMiddleware`)
   - `PUT /:goalId` -> `goalController.updateGoalStatus` (protected by `authMiddleware`)

---

## Phase 3: Guidance Replies & Mentor Recommendations Implementation
8. **Update `backend/controllers/guidanceController.js`:**
   - Implement `replyGuidanceRequest`:
     - Verify `req.user.role` is `'Faculty'` or `'Alumni'`.
     - Create `GuidanceReply` referencing `req.params.id` and mentor `req.user.userId`.
     - Return `{ message: "Reply sent successfully" }`.
   - Implement `getMentorRecommendations`:
     - Query `FacultyProfile` and `AlumniProfile` populated with `User` details.
     - Return mapped list of `[{ name, role, careerTag }]`.

9. **Update `backend/routes/guidanceRoutes.js`:**
   - `POST /:id/reply` -> `guidanceController.replyGuidanceRequest` (protected by `authMiddleware`)

10. **Create `backend/routes/mentorRoutes.js`:**
    - `GET /recommendation` -> `guidanceController.getMentorRecommendations` (protected by `authMiddleware`)

---

## Phase 4: Mock Interview & Skill Evaluation Implementation
11. **Create `backend/controllers/interviewController.js`:**
    - Implement `scheduleMockInterview`:
      - Validate request fields (`date`, `time`, `facultyId`).
      - Create `MockInterview` document with `studentId = req.user.userId`, `interviewerId = facultyId`, `date`, `time`, and status `scheduled`.
      - Return `{ message: "Appointment confirmed" }`.
    - Implement `getAppointments`:
      - Fetch mock interviews where `studentId` or `interviewerId` equals `req.user.userId`.
      - Return `[{ date, time, status }]`.

12. **Create `backend/controllers/evaluationController.js`:**
    - Implement `saveEvaluationScore`:
      - Verify `req.user.role` is `'Faculty'`.
      - Validate score ranges (0–10) for `communication`, `confidence`, and `technical`.
      - Save record to `EvaluationScore` linked to `interviewId`.
      - Return `{ message: "Scores saved successfully" }`.

13. **Create `backend/routes/appointmentRoutes.js`:**
    - `POST /` -> `interviewController.scheduleMockInterview` (protected by `authMiddleware`)
    - `GET /` -> `interviewController.getAppointments` (protected by `authMiddleware`)

14. **Create `backend/routes/evaluationRoutes.js`:**
    - `POST /evaluation` -> `evaluationController.saveEvaluationScore` (protected by `authMiddleware`)

---

## Phase 5: Recruiter Feedback Implementation
15. **Create `backend/controllers/feedbackController.js`:**
    - Implement `addRecruiterFeedback`:
      - Verify `req.user.role` is `'Recruiter'` or `'Placement Cell'`.
      - Create `RecruiterFeedback` document with `studentId`, `recruiterId = req.user.userId`, and `comments`.
      - Return `{ message: "Recruiter feedback saved successfully" }`.

16. **Create `backend/routes/feedbackRoutes.js`:**
    - `POST /` -> `feedbackController.addRecruiterFeedback` (protected by `authMiddleware`)

---

## Phase 6: Server Route Mounting & Verification
17. Open `backend/index.js` (or server entrypoint).
18. Import route files:
    - `careerRoutes`
    - `goalRoutes`
    - `mentorRoutes`
    - `appointmentRoutes`
    - `evaluationRoutes`
    - `feedbackRoutes`
19. Mount endpoints under `/api`:
    - `app.use('/api/career', careerRoutes)`
    - `app.use('/api/goals', goalRoutes)`
    - `app.use('/api/mentors', mentorRoutes)`
    - `app.use('/api/appointments', appointmentRoutes)`
    - `app.use('/api/skills', evaluationRoutes)`
    - `app.use('/api/feedback', feedbackRoutes)`
20. Run `npm run dev` to verify all routes mount cleanly with no missing imports or syntax issues.
