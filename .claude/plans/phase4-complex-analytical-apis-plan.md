# Phase 4: Complex Analytical APIs — Implementation Plan

## Prerequisites
- All Phase 2 models and controllers operational
- Auth middleware (`protect`, `authorize`) in place
- All 17 Mongoose models registered in `backend/model/index.js`

---

## Step-by-Step Execution

### Controller 1: `placementController.js`

**Step 1**: Create file `backend/controllers/placementController.js`  
**Step 2**: Import dependencies: `mongoose`, `User`, `StudentProfile`, `WeeklyGoal`, `MockInterview`, `EvaluationScore`, `RecruiterFeedback`, `CareerRoadmap`, `Company`  
**Step 3**: Implement `getPlacementReadiness` — validates studentId, guards student-only-self access, runs 3 parallel queries for goalScore/interviewScore/feedbackScore, applies weighted formula  
**Step 4**: Implement `getCompanyMatch` — lookups student career → roadmap skills, iterates companies for set-intersection matching  
**Step 5**: Implement `getLeaderboard` — MongoDB aggregation pipeline: `$match` → `$lookup` → `$unwind` → `$sort` → pagination with `$facet`  

### Controller 2: `progressController.js`

**Step 6**: Create file `backend/controllers/progressController.js`  
**Step 7**: Import dependencies: `mongoose`, `User`, `StudentProfile`, `WeeklyGoal`, `MockInterview`, `EvaluationScore`, `ActionPlan`, `GuidanceRequest`, `GuidanceReply`  
**Step 8**: Implement `getProgressDashboard` — parallel queries across 5 collections, computes goal rates, interview averages  
**Step 9**: Implement `getGoalsAnalysis` — query WeeklyGoals with optional status filter, compute summary stats  
**Step 10**: Implement `getInterviewAnalysis` — aggregation pipeline with `$lookup` to Evaluation_Scores + `$lookup` to Users for interviewer  

### Controller 3: `departmentController.js`

**Step 11**: Create file `backend/controllers/departmentController.js`  
**Step 12**: Import dependencies: `mongoose`, `User`, `StudentProfile`, `WeeklyGoal`, `MockInterview`, `EvaluationScore`, `ActionPlan`, `DepartmentEvent`, `GuidanceRequest`, `GuidanceReply`, `FacultyProfile`  
**Step 13**: Implement HOD verification helper `verifyHODAccess(req)`  
**Step 14**: Implement `getDepartmentAnalytics` — 5 parallel aggregation queries (students, goals, interviews, events, guidance)  
**Step 15**: Implement `getSkillGaps` — aggregation with `$group` by weakSkill, `$sort`, `$limit`  
**Step 16**: Implement `getPlacementStats` — student counts, career selection rate, readiness score distribution with `$bucket`-style logic  

### Routes

**Step 17**: Create `backend/routes/placementRoutes.js` with 3 GET routes  
**Step 18**: Create `backend/routes/progressRoutes.js` with 3 GET routes  
**Step 19**: Create `backend/routes/departmentRoutes.js` with 3 GET routes  

### Integration

**Step 20**: Update `backend/index.js` — add 3 import statements  
**Step 21**: Add 3 `app.use()` route mount lines  
**Step 22**: Add console.log route listing for the new 9 endpoints  

### Verification

**Step 23**: Verify all imports resolve correctly  
**Step 24**: Verify RBAC matrix matches spec  
**Step 25**: Verify all `$lookup` collection names match actual Mongoose model third arguments  
**Step 26**: Verify all mathematical formulas match spec definitions  

---

## Collection Name Cross-Reference for `$lookup`

| `from` field value     | Model              | Schema 3rd arg        |
|------------------------|--------------------|-----------------------|
| `Student_Profiles`     | StudentProfile     | `'Student_Profiles'`  |
| `Weekly_Goals`         | WeeklyGoal         | `'Weekly_Goals'`      |
| `Mock_Interviews`      | MockInterview      | `'Mock_Interviews'`   |
| `Evaluation_Scores`    | EvaluationScore    | `'Evaluation_Scores'` |
| `Action_Plans`         | ActionPlan         | `'Action_Plans'`      |
| `Companies`            | Company            | `'Companies'`         |
| `Recruiter_Feedback`   | RecruiterFeedback  | `'Recruiter_Feedback'`|
| `Career_Roadmaps`      | CareerRoadmap      | `'Career_Roadmaps'`   |
| `Department_Events`    | DepartmentEvent    | `'Department_Events'` |
| `Guidance_Requests`    | GuidanceRequest    | `'Guidance_Requests'` |
| `Guidance_Replies`     | GuidanceReply      | `'Guidance_Replies'`  |
| `Faculty_Profiles`     | FacultyProfile     | `'Faculty_Profiles'`  |
| `Users`                | User               | `'Users'`             |