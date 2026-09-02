# Phase 3: Interactive Dependent APIs Specification

## 1. Project Context & Objective
* **Goal:** Implement Phase 3 Interactive Dependent APIs (Career Quiz, Roadmaps, Weekly Goals, Guidance Replies, Mentor Recommendations, Mock Interviews, Skill Evaluations, and Recruiter Feedback) strictly adhering to the REST API documentation.
* **Security & Role-Based Access Control (RBAC):**
  * All endpoints require verification via `authMiddleware` to inject `req.user` (`userId` and `role`) from the JWT.
  * `POST /api/guidance/:id/reply` is restricted strictly to users with role `'Faculty'` or `'Alumni'`.
  * `POST /api/skills/evaluation` is restricted strictly to users with role `'Faculty'`.
  * `POST /api/feedback` is restricted strictly to users with role `'Recruiter'` or `'Placement Cell'`.
  * `POST /api/appointments` is initiated by students booking available faculty mock interview slots.
* **Data Models Used:**
  * Interacts with `CareerRoadmap`, `SemesterPlan`, `WeeklyGoal`, `GuidanceRequest`, `GuidanceReply`, `FacultyProfile`, `AlumniProfile`, `MockInterview`, `EvaluationScore`, `RecruiterFeedback`, and `User` located in `backend/model/index.js`.

---

## 2. API Endpoint Specifications

### Career & Goal APIs

#### `POST /api/career/quiz`
* **Access:** Authenticated user
* **Request Body:**
  ```json
  {
    "interests": ["Web Development", "UI/UX"],
    "strengths": ["JavaScript", "Problem Solving"],
    "weaknesses": ["Public Speaking"]
  }
  ```
* **Logic:** Matches criteria against career roadmaps.
* **Response (200 OK):**
  ```json
  {
    "suggestedCareer": "Full Stack Developer"
  }
  ```

---

#### `GET /api/career/roadmap/:careerId`
* **Access:** Authenticated user
* **URL Params:** `careerId` (String / ObjectId)
* **Logic:** Retrieves roadmap details and associated semester plan subjects.
* **Response (200 OK):**
  ```json
  {
    "career": "Full Stack Developer",
    "steps": [
      "Semester 1: CS Fundamentals",
      "Semester 2: Data Structures & Algorithms",
      "Semester 3: Frontend Development (React)",
      "Semester 4: Backend & APIs (Node.js/Express)"
    ]
  }
  ```

---

#### `POST /api/goals`
* **Access:** Authenticated student / user
* **Request Body:**
  ```json
  {
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "goals": [
      "Complete 5 LeetCode problems",
      "Finish React project module"
    ]
  }
  ```
* **Logic:** Persists weekly goals to `WeeklyGoal` with status `in-progress`.
* **Response (201 Created):**
  ```json
  {
    "message": "Weekly goals saved successfully"
  }
  ```

---

#### `PUT /api/goals/:goalId`
* **Access:** Authenticated user
* **URL Params:** `goalId` (String / ObjectId)
* **Request Body:**
  ```json
  {
    "status": "Done"
  }
  ```
* **Logic:** Updates the goal document status (e.g., `"Done"` or `"Pending"`).
* **Response (200 OK):**
  ```json
  {
    "message": "Goal status updated successfully"
  }
  ```

---

### Guidance & Mentorship Interaction APIs

#### `POST /api/guidance/:id/reply`
* **Access:** Restricted to roles `'Faculty'` or `'Alumni'`
* **URL Params:** `id` (Guidance Request ID)
* **Request Body:**
  ```json
  {
    "reply": "Focus on data structures and practicing system design fundamentals."
  }
  ```
* **Logic:** Links the authenticated mentor (`req.user.userId`) to `GuidanceReply` and associates with the request.
* **Response (201 Created / 200 OK):**
  ```json
  {
    "message": "Reply sent successfully"
  }
  ```

---

#### `GET /api/mentors/recommendation`
* **Access:** Authenticated user
* **Logic:** Queries `FacultyProfile` and `AlumniProfile` collections populated with user details.
* **Response (200 OK):**
  ```json
  [
    {
      "name": "Dr. Jane Doe",
      "role": "Faculty",
      "careerTag": "Machine Learning"
    },
    {
      "name": "John Smith",
      "role": "Alumni",
      "careerTag": "Full Stack Development"
    }
  ]
  ```

---

### Mock Interview & Evaluation APIs

#### `POST /api/appointments`
* **Access:** Authenticated student
* **Request Body:**
  ```json
  {
    "date": "2026-09-15",
    "time": "14:00",
    "facultyId": "64f1a2b3c4d5e6f7a8b9c0d2"
  }
  ```
* **Logic:** Validates fields, creates a `MockInterview` record with status `scheduled`.
* **Response (201 Created):**
  ```json
  {
    "message": "Appointment confirmed"
  }
  ```

---

#### `GET /api/appointments`
* **Access:** Authenticated student or faculty member
* **Logic:** Retrieves appointment history for the logged-in student or faculty member (`req.user.userId`).
* **Response (200 OK):**
  ```json
  [
    {
      "date": "2026-09-15",
      "time": "14:00",
      "status": "scheduled"
    }
  ]
  ```

---

#### `POST /api/skills/evaluation`
* **Access:** Restricted to role `'Faculty'`
* **Request Body:**
  ```json
  {
    "interviewId": "64f1a2b3c4d5e6f7a8b9c0d3",
    "communication": 8,
    "confidence": 7,
    "technical": 9
  }
  ```
* **Logic:** Validates score ranges (0–10) and saves to `EvaluationScore`.
* **Response (201 Created / 200 OK):**
  ```json
  {
    "message": "Scores saved successfully"
  }
  ```

---

### Recruiter Feedback API

#### `POST /api/feedback`
* **Access:** Restricted to roles `'Recruiter'` or `'Placement Cell'`
* **Request Body:**
  ```json
  {
    "studentId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "comments": "Demonstrated strong core computer science fundamentals and clear articulation during problem solving."
  }
  ```
* **Logic:** Saves review with `recruiterId` (`req.user.userId`) into `RecruiterFeedback`.
* **Response (201 Created / 200 OK):**
  ```json
  {
    "message": "Recruiter feedback saved successfully"
  }
  ```
