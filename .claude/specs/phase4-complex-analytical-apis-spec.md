# Phase 4: Complex Analytical APIs Specification

## Overview
Implement three complex analytical API modules that leverage MongoDB Aggregation Pipelines, cross-collection `$lookup` joins, and mathematical computations to deliver placement readiness scoring, student progress tracking, and department-level analytics dashboards.

---

## Data Models Reference (Collection Names for `$lookup`)

| Model             | Collection Name       | Key Foreign Keys                                |
|-------------------|-----------------------|-------------------------------------------------|
| User              | `Users`               | —                                               |
| StudentProfile    | `Student_Profiles`    | `studentId` → Users                             |
| CareerRoadmap     | `Career_Roadmaps`     | —                                               |
| SemesterPlan      | `Semester_Plans`      | `roadmapId` → Career_Roadmaps                   |
| WeeklyGoal        | `Weekly_Goals`        | `studentId` → Users                             |
| MockInterview     | `Mock_Interviews`     | `studentId` → Users, `interviewerId` → Users    |
| EvaluationScore   | `Evaluation_Scores`   | `interviewId` → Mock_Interviews                 |
| ActionPlan        | `Action_Plans`        | `studentId` → Users                             |
| Company           | `Companies`           | —                                               |
| RecruiterFeedback | `Recruiter_Feedback`  | `studentId` → Users, `recruiterId` → Users      |
| DepartmentEvent   | `Department_Events`   | `hodId` → Users                                 |
| GuidanceRequest   | `Guidance_Requests`   | `studentId` → Users                             |
| GuidanceReply     | `Guidance_Replies`    | `requestId` → Guidance_Requests, `mentorId` → Users |
| ExperiencePost    | `Experience_Posts`    | `alumniId` → Users                              |
| FacultyProfile    | `Faculty_Profiles`    | `facultyId` → Users                             |
| AlumniProfile     | `Alumni_Profiles`     | `alumniId` → Users                              |

---

## API 1: Placement Readiness Engine (`/api/placement`)

### Endpoint 1.1: GET `/api/placement/readiness/:studentId`
**Description**: Calculate a holistic placement readiness score for a student.

**Auth**: Required (JWT)  
**RBAC**: Student (own data only), Faculty, Admin

**Placement Readiness Score Formula**:
```
readinessScore = (goalScore × 0.30) + (interviewScore × 0.40) + (feedbackScore × 0.30)
```
http://dependent-apis-spec.md/
**Component Calculations**:

1. **goalScore** (0–100):
   - Query `Weekly_Goals` where `studentId` matches
   - `goalScore = (completedGoals / totalGoals) × 100`
   - If `totalGoals === 0`, `goalScore = 0`

2. **interviewScore** (0–100):
   - `$lookup` from `Mock_Interviews` → `Evaluation_Scores` (on `interviewId`)
   - Only include interviews with `status: 'completed'`
   - For each evaluation: `avgEval = (technicalScore + communicationScore + confidenceScore) / 3`
   - `interviewScore = (sum of all avgEval / count) × 10` (scale 0–10 to 0–100)
   - If no completed interviews, `interviewScore = 0`

3. **feedbackScore** (0–100):
   - Count `Recruiter_Feedback` documents for the student
   - `feedbackScore = Math.min(feedbackCount × 20, 100)` (each feedback = 20 points, capped at 100)

**Response**:
```json
{
  "success": true,
  "studentId": "...",
  "studentName": "...",
  "readinessScore": 72.5,
  "breakdown": {
    "goalScore": 85.0,
    "interviewScore": 65.0,
    "feedbackScore": 60.0
  },
  "details": {
    "totalGoals": 10,
    "completedGoals": 8,
    "completedInterviews": 3,
    "avgInterviewScore": 6.5,
    "recruiterFeedbackCount": 3
  }
}
```

---

### Endpoint 1.2: GET `/api/placement/company-match/:studentId`
**Description**: Match a student against all companies based on skill overlap.

**Auth**: Required (JWT)  
**RBAC**: Student (own data only), Faculty, Recruiter, Admin

**Matching Algorithm**:
1. Get student's `selectedCareer` from `Student_Profiles`
2. `$lookup` `Career_Roadmaps` to get `requiredSkills` for that career
3. For each Company:
   ```
   matchedSkills = intersection(company.requiredSkills, roadmap.requiredSkills)
   matchPercentage = (matchedSkills.length / company.requiredSkills.length) × 100
   ```
4. `isEligible = matchPercentage >= company.minimumMatchScore`

**Response**:
```json
{
  "success": true,
  "studentId": "...",
  "studentName": "...",
  "selectedCareer": "Full Stack Developer",
  "studentSkills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "matches": [
    {
      "companyId": "...",
      "companyName": "TechCorp",
      "requiredSkills": ["JavaScript", "React", "Node.js"],
      "matchedSkills": ["JavaScript", "React", "Node.js"],
      "matchPercentage": 100,
      "minimumMatchScore": 70,
      "isEligible": true
    }
  ]
}
```

---

### Endpoint 1.3: GET `/api/placement/leaderboard`
**Description**: Rank all students by their readiness scores.

**Auth**: Required (JWT)  
**RBAC**: Faculty, Admin

**Query Params**: `page` (default: 1), `limit` (default: 10)

**Aggregation Pipeline**:
1. `$match` Users with `role: 'student'`
2. `$lookup` to `Student_Profiles` (on `_id` → `studentId`)
3. `$unwind` the student profile
4. `$sort` by `readinessScore` descending
5. `$skip` / `$limit` for pagination
6. `$project` final shape

**Response**:
```json
{
  "success": true,
  "count": 10,
  "page": 1,
  "totalPages": 5,
  "totalItems": 50,
  "leaderboard": [
    {
      "rank": 1,
      "studentId": "...",
      "studentName": "...",
      "email": "...",
      "semester": 5,
      "selectedCareer": "Full Stack Developer",
      "readinessScore": 92.5
    }
  ]
}
```

---

## API 2: Student Progress Tracker (`/api/progress`)

### Endpoint 2.1: GET `/api/progress/dashboard/:studentId`
**Description**: Comprehensive student progress dashboard with cross-collection data.

**Auth**: Required (JWT)  
**RBAC**: Student (own data only), Faculty, Admin

**Aggregation**: Uses `$lookup` across 5 collections.

**Response**:
```json
{
  "success": true,
  "studentId": "...",
  "studentName": "...",
  "profile": {
    "semester": 5,
    "selectedCareer": "Full Stack Developer",
    "readinessScore": 72.5
  },
  "goals": {
    "total": 10,
    "completed": 7,
    "inProgress": 2,
    "pending": 1,
    "completionRate": 70.0
  },
  "interviews": {
    "total": 5,
    "completed": 3,
    "scheduled": 1,
    "cancelled": 1,
    "averageScores": {
      "technical": 7.5,
      "communication": 8.0,
      "confidence": 6.5,
      "overall": 7.33
    }
  },
  "actionPlans": {
    "total": 3,
    "items": [
      { "weakSkill": "System Design", "recommendedTask": "Complete HLD course" }
    ]
  },
  "guidanceRequests": {
    "total": 4,
    "repliesReceived": 6
  }
}
```

---

### Endpoint 2.2: GET `/api/progress/goals/:studentId`
**Description**: Detailed weekly goals analysis with time-based breakdowns.

**Auth**: Required (JWT)  
**RBAC**: Student (own data only), Faculty, Admin

**Query Params**: `status` (optional filter: pending, in-progress, completed)

**Response**:
```json
{
  "success": true,
  "studentId": "...",
  "summary": {
    "total": 10,
    "completed": 7,
    "inProgress": 2,
    "pending": 1,
    "completionRate": 70.0
  },
  "goals": [
    {
      "id": "...",
      "title": "Complete React tutorial",
      "status": "completed",
      "dueDate": "2026-09-15T00:00:00.000Z"
    }
  ]
}
```

---

### Endpoint 2.3: GET `/api/progress/interviews/:studentId`
**Description**: Detailed interview performance analytics.

**Auth**: Required (JWT)  
**RBAC**: Student (own data only), Faculty, Admin

**Aggregation Pipeline**:
1. `$match` MockInterviews for the student
2. `$lookup` to `Evaluation_Scores` (localField: `_id`, foreignField: `interviewId`)
3. `$unwind` evaluation (preserveNullAndEmptyArrays)
4. `$lookup` to `Users` for interviewer info
5. `$project` final shape

**Response**:
```json
{
  "success": true,
  "studentId": "...",
  "summary": {
    "total": 5,
    "completed": 3,
    "scheduled": 1,
    "cancelled": 1,
    "averageScores": {
      "technical": 7.5,
      "communication": 8.0,
      "confidence": 6.5,
      "overall": 7.33
    }
  },
  "interviews": [
    {
      "interviewId": "...",
      "interviewerName": "Dr. Smith",
      "dateTime": "...",
      "meetLink": "...",
      "status": "completed",
      "scores": {
        "technical": 8,
        "communication": 9,
        "confidence": 7,
        "average": 8.0
      }
    }
  ]
}
```

---

## API 3: Department Analytics (`/api/department`)

### Endpoint 3.1: GET `/api/department/analytics`
**Description**: Department-wide analytics dashboard for HOD/Admin.

**Auth**: Required (JWT)  
**RBAC**: Faculty (HOD only), Admin

**Aggregation Pipeline** (runs multiple parallel aggregations):

1. **Student Statistics**: Count students, avg readiness score
2. **Goal Analytics**: Total goals, completion rate across all students
3. **Interview Analytics**: Total interviews, average scores
4. **Event Analytics**: Total events, upcoming events count
5. **Guidance Analytics**: Total requests, total replies, response rate

**Response**:
```json
{
  "success": true,
  "analytics": {
    "students": {
      "totalStudents": 120,
      "averageReadinessScore": 68.5
    },
    "goals": {
      "totalGoals": 450,
      "completedGoals": 280,
      "completionRate": 62.22
    },
    "interviews": {
      "totalInterviews": 85,
      "completedInterviews": 60,
      "averageScores": {
        "technical": 7.2,
        "communication": 7.8,
        "confidence": 6.9,
        "overall": 7.30
      }
    },
    "events": {
      "totalEvents": 15,
      "upcomingEvents": 5
    },
    "guidance": {
      "totalRequests": 200,
      "totalReplies": 350,
      "responseRate": 87.5
    }
  }
}
```

---

### Endpoint 3.2: GET `/api/department/skill-gaps`
**Description**: Identify the most common weak skills across all students (from Action Plans).

**Auth**: Required (JWT)  
**RBAC**: Faculty (HOD only), Admin

**Aggregation Pipeline**:
1. `$group` by `weakSkill`, count occurrences
2. `$sort` by count descending
3. `$limit` top 10

**Response**:
```json
{
  "success": true,
  "skillGaps": [
    { "skill": "System Design", "count": 25, "percentage": 20.83 },
    { "skill": "Data Structures", "count": 18, "percentage": 15.0 }
  ],
  "totalStudentsWithActionPlans": 120
}
```

---

### Endpoint 3.3: GET `/api/department/placement-stats`
**Description**: Placement statistics with company-wise eligibility distribution.

**Auth**: Required (JWT)  
**RBAC**: Faculty (HOD only), Admin

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalStudents": 120,
    "studentsWithCareer": 100,
    "averageReadinessScore": 68.5,
    "scoreDistribution": {
      "excellent": { "range": "80-100", "count": 25, "percentage": 20.83 },
      "good": { "range": "60-79", "count": 40, "percentage": 33.33 },
      "average": { "range": "40-59", "count": 35, "percentage": 29.17 },
      "needsImprovement": { "range": "0-39", "count": 20, "percentage": 16.67 }
    }
  }
}
```

---

## Strict RBAC Matrix

| Endpoint                               | Student    | Faculty | Alumni | Recruiter | Admin |
|----------------------------------------|------------|---------|--------|-----------|-------|
| GET /api/placement/readiness/:id       | Own only   | ✓       | ✗      | ✗         | ✓     |
| GET /api/placement/company-match/:id   | Own only   | ✓       | ✗      | ✓         | ✓     |
| GET /api/placement/leaderboard         | ✗          | ✓       | ✗      | ✗         | ✓     |
| GET /api/progress/dashboard/:id        | Own only   | ✓       | ✗      | ✗         | ✓     |
| GET /api/progress/goals/:id            | Own only   | ✓       | ✗      | ✗         | ✓     |
| GET /api/progress/interviews/:id       | Own only   | ✓       | ✗      | ✗         | ✓     |
| GET /api/department/analytics          | ✗          | HOD     | ✗      | ✗         | ✓     |
| GET /api/department/skill-gaps         | ✗          | HOD     | ✗      | ✗         | ✓     |
| GET /api/department/placement-stats    | ✗          | HOD     | ✗      | ✗         | ✓     |

---

## Validation Rules

1. All ObjectId params validated with `mongoose.Types.ObjectId.isValid()`
2. Student-scoped endpoints: `req.user.role === 'student'` → verify `req.user.id === studentId`
3. HOD endpoints: Verify `FacultyProfile.isHOD === true` for faculty users
4. Pagination defaults: `page = 1`, `limit = 10`
5. All scores rounded to 2 decimal places
6. Division-by-zero guarded with ternary/conditional checks
