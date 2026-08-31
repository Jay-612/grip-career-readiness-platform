# Phase 2: Dependent APIs Specification

## Overview
Implement dependent APIs for User Profile Management, Alumni Directory, and Career Guidance systems with strict Role-Based Access Control (RBAC).

## Data Models Reference

### User Model (`User`)
- `_id`: ObjectId
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required)
- `role`: Enum ['student', 'faculty', 'alumni', 'recruiter', 'admin'] (default: 'student')
- `createdAt`, `updatedAt`: timestamps

### StudentProfile Model
- `studentId`: ObjectId (ref: User, required, unique)
- `semester`: Number (required)
- `selectedCareer`: String (default: '')
- `readinessScore`: Number (default: 0)

### AlumniProfile Model
- `alumniId`: ObjectId (ref: User, required, unique)
- `graduationYear`: Number (required)
- `currentCompany`: String (default: '')
- `jobRole`: String (default: '')

### GuidanceRequest Model
- `studentId`: ObjectId (ref: User, required)
- `question`: String (required)
- `date`: Date (default: Date.now)

### GuidanceReply Model
- `requestId`: ObjectId (ref: GuidanceRequest, required)
- `mentorId`: ObjectId (ref: User, required)
- `answerText`: String (required)

### FacultyProfile Model
- `facultyId`: ObjectId (ref: User, required, unique)
- `employeeId`: String (required)
- `department`: String (required)
- `isHOD`: Boolean (default: false)

---

## API 1: User Profile Management (`/api/users`)

### Endpoints

#### GET `/api/users/profile`
- **Description**: Get authenticated user's profile with role-specific data
- **Auth**: Required (JWT)
- **RBAC**: All authenticated roles
- **Response**: 
  ```json
  {
    "success": true,
    "user": { "id", "name", "email", "role" },
    "profile": { /* role-specific profile data */ }
  }
  ```

#### PUT `/api/users/profile`
- **Description**: Update authenticated user's profile
- **Auth**: Required (JWT)
- **RBAC**: All authenticated roles
- **Body**: Role-specific fields
- **Response**: Updated profile

#### GET `/api/users/:id`
- **Description**: Get user by ID (public info only)
- **Auth**: Required (JWT)
- **RBAC**: All authenticated roles
- **Response**: Public user info (name, email, role)

#### GET `/api/users`
- **Description**: List users with pagination and role filter
- **Auth**: Required (JWT)
- **RBAC**: Admin only
- **Query**: `page`, `limit`, `role`
- **Response**: Paginated user list

---

## API 2: Alumni Directory (`/api/alumni`)

### Endpoints

#### GET `/api/alumni`
- **Description**: List all alumni with filters
- **Auth**: Required (JWT)
- **RBAC**: Student, Faculty, Admin
- **Query**: `graduationYear`, `currentCompany`, `jobRole`, `page`, `limit`
- **Response**: Paginated alumni list with populated user info

#### GET `/api/alumni/:id`
- **Description**: Get alumni profile by ID
- **Auth**: Required (JWT)
- **RBAC**: Student, Faculty, Admin
- **Response**: Alumni profile with user info

#### POST `/api/alumni/profile`
- **Description**: Create/Update authenticated alumni's profile
- **Auth**: Required (JWT)
- **RBAC**: Alumni only
- **Body**: `graduationYear`, `currentCompany`, `jobRole`
- **Response**: Created/Updated alumni profile

---

## API 3: Career Guidance (`/api/guidance`)

### Endpoints

#### POST `/api/guidance/request`
- **Description**: Student creates a guidance request
- **Auth**: Required (JWT)
- **RBAC**: Student only
- **Body**: `question`
- **Response**: Created guidance request

#### GET `/api/guidance/requests`
- **Description**: Get guidance requests (role-based filtering)
- **Auth**: Required (JWT)
- **RBAC**: 
  - Student: Own requests only
  - Faculty/Alumni/Admin: All requests
- **Query**: `status`, `page`, `limit`
- **Response**: Paginated requests with populated student/mentor info

#### GET `/api/guidance/requests/:id`
- **Description**: Get guidance request by ID with replies
- **Auth**: Required (JWT)
- **RBAC**: 
  - Student: Own requests only
  - Faculty/Alumni/Admin: All requests
- **Response**: Request with populated replies

#### POST `/api/guidance/requests/:id/reply`
- **Description**: Mentor (Faculty/Alumni) replies to a guidance request
- **Auth**: Required (JWT)
- **RBAC**: Faculty, Alumni, Admin
- **Body**: `answerText`
- **Response**: Created reply

#### PUT `/api/guidance/reply/:id`
- **Description**: Update mentor's reply
- **Auth**: Required (JWT)
- **RBAC**: Reply author (mentor) or Admin
- **Body**: `answerText`
- **Response**: Updated reply

---

## Authentication Middleware Requirements

### `authMiddleware.js`
- **`protect`**: Verify JWT token, attach `req.user = { id, role }`
- **`authorize(...roles)`**: Check if `req.user.role` is in allowed roles
- **Error Responses**:
  - 401: No token / Invalid token / User not found
  - 403: Insufficient permissions

---

## Strict RBAC Matrix

| Endpoint | Student | Faculty | Alumni | Recruiter | Admin |
|----------|---------|---------|--------|-----------|-------|
| GET /api/users/profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| PUT /api/users/profile | ✓ | ✓ | ✓ | ✓ | ✓ |
| GET /api/users/:id | ✓ | ✓ | ✓ | ✓ | ✓ |
| GET /api/users | ✗ | ✗ | ✗ | ✗ | ✓ |
| GET /api/alumni | ✓ | ✓ | ✗ | ✗ | ✓ |
| GET /api/alumni/:id | ✓ | ✓ | ✗ | ✗ | ✓ |
| POST /api/alumni/profile | ✗ | ✗ | ✓ | ✗ | ✓ |
| POST /api/guidance/request | ✓ | ✗ | ✗ | ✗ | ✗ |
| GET /api/guidance/requests | Own | All | All | ✗ | All |
| GET /api/guidance/requests/:id | Own | All | All | ✗ | All |
| POST /api/guidance/requests/:id/reply | ✗ | ✓ | ✓ | ✗ | ✓ |
| PUT /api/guidance/reply/:id | ✗ | Author | Author | ✗ | ✓ |

---

## Response Format Standards

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev only)"
}
```

### Pagination
```json
{
  "success": true,
  "count": 10,
  "page": 1,
  "totalPages": 5,
  "totalItems": 50,
  "data": [...]
}
```

---

## Validation Rules

1. All ObjectId params must be validated with `mongoose.Types.ObjectId.isValid()`
2. Required fields must be checked before DB operations
3. Role-specific profile creation must verify user role matches
4. Date fields must be validated
4. Trim string inputs