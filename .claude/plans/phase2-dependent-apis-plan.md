# Phase 2: Dependent APIs Implementation Plan

## Execution Steps

### Step 1: Create Authentication Middleware
- [ ] Create `backend/middleware/authMiddleware.js`
  - Implement `protect` middleware: verify JWT, attach `req.user`
  - Implement `authorize(...roles)` middleware: role-based authorization
  - Handle errors: 401 (unauthorized), 403 (forbidden)

### Step 2: Create User Controller
- [ ] Create `backend/controllers/userController.js`
  - `getProfile`: GET `/api/users/profile` - Get authenticated user's profile with role-specific data
  - `updateProfile`: PUT `/api/users/profile` - Update authenticated user's profile
  - `getUserById`: GET `/api/users/:id` - Get user by ID (public info)
  - `getAllUsers`: GET `/api/users` - List users with pagination (Admin only)

### Step 3: Create Alumni Controller
- [ ] Create `backend/controllers/alumniController.js`
  - `getAllAlumni`: GET `/api/alumni` - List alumni with filters (Student, Faculty, Admin)
  - `getAlumniById`: GET `/api/alumni/:id` - Get alumni profile by ID
  - `createOrUpdateAlumniProfile`: POST `/api/alumni/profile` - Create/Update alumni profile (Alumni only)

### Step 4: Create Guidance Controller
- [ ] Create `backend/controllers/guidanceController.js`
  - `createGuidanceRequest`: POST `/api/guidance/request` - Student creates request
  - `getGuidanceRequests`: GET `/api/guidance/requests` - List requests (role-based filtering)
  - `getGuidanceRequestById`: GET `/api/guidance/requests/:id` - Get request with replies
  - `replyToGuidanceRequest`: POST `/api/guidance/requests/:id/reply` - Mentor replies
  - `updateGuidanceReply`: PUT `/api/guidance/reply/:id` - Update reply (author or Admin)

### Step 5: Create User Routes
- [ ] Create `backend/routes/userRoutes.js`
  - Mount routes with proper middleware
  - `router.get('/profile', protect, getProfile)`
  - `router.put('/profile', protect, updateProfile)`
  - `router.get('/:id', protect, getUserById)`
  - `router.get('/', protect, authorize('admin'), getAllUsers)`

### Step 6: Create Alumni Routes
- [ ] Create `backend/routes/alumniRoutes.js`
  - Mount routes with proper middleware
  - `router.get('/', protect, authorize('student', 'faculty', 'admin'), getAllAlumni)`
  - `router.get('/:id', protect, authorize('student', 'faculty', 'admin'), getAlumniById)`
  - `router.post('/profile', protect, authorize('alumni'), createOrUpdateAlumniProfile)`

### Step 7: Create Guidance Routes
- [ ] Create `backend/routes/guidanceRoutes.js`
  - Mount routes with proper middleware
  - `router.post('/request', protect, authorize('student'), createGuidanceRequest)`
  - `router.get('/requests', protect, authorize('student', 'faculty', 'alumni', 'admin'), getGuidanceRequests)`
  - `router.get('/requests/:id', protect, authorize('student', 'faculty', 'alumni', 'admin'), getGuidanceRequestById)`
  - `router.post('/requests/:id/reply', protect, authorize('faculty', 'alumni', 'admin'), replyToGuidanceRequest)`
  - `router.put('/reply/:id', protect, authorize('faculty', 'alumni', 'admin'), updateGuidanceReply)`

### Step 8: Update Main Index
- [ ] Update `backend/index.js`
  - Import new route files
  - Mount routes: `app.use('/api/users', userRoutes)`, `app.use('/api/alumni', alumniRoutes)`, `app.use('/api/guidance', guidanceRoutes)`
  - Update startup log messages

### Step 9: Verify Implementation
- [ ] Check all imports are correct
- [ ] Verify Mongoose queries match schema definitions
- [ ] Verify foreign key references (studentId, alumniId, mentorId, requestId)
- [ ] Ensure consistent error handling and response formats