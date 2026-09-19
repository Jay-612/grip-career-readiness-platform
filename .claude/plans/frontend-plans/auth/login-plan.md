# Implementation Plan: User Login

## 1. Goal
Construct the `LoginPage.jsx` view corresponding to `.claude/specs/frontend-specs/auth/login-spec.md` and screenshot `.claude/images/stitch/Auth/login/login_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Centralized Axios client: `src/services/apiClient.js`
- React Router v6 hooks: `useNavigate`, `Link`, `useLocation`

## 3. Phased Implementation Steps

### Phase 1: Component Initialization & Scaffolding
1. Create `src/pages/Auth/LoginPage.jsx`.
2. Define states:
   - `credentials`: `{ email: '', password: '', role: 'student', rememberMe: false }`
   - `errors`: `{ email: '', password: '', general: '' }`
   - `isLoading`: Boolean (`false`)
3. Set up responsive two-column grid wrapper with background dot pattern.

### Phase 2: Form Controls & UX Interactivity
1. Build left column:
   - Header badge: "SECURE CAMPUS ACCESS".
   - Telemetry preview cards (Faculty Mentorship, Semester 5 Milestone 60% gauge, Recruiter views).
   - Social proof student/mentor avatar cluster.
2. Build right column login card:
   - Segmented Role Selector tabs (`student`, `faculty`, `alumni`, `recruiter`).
   - Email input with `.edu` requirement badge.
   - Password input with toggleable visibility eye icon and "Forgot Password?" anchor.
   - "Remember my session for 30 days" checkbox with 256-bit encryption badge.
   - SSO alternative button ("Log In with University Single Sign-On").

### Phase 3: API Integration & Auth Flow
1. Implement `handleSubmit(e)`:
   - Clear `errors.general`.
   - Validate email and password fields. If invalid, populate field errors and abort.
   - Set `isLoading = true`.
   - Invoke `apiClient.post('/api/auth/login', { email: credentials.email, password: credentials.password })`.
   - On success (200 OK):
     - Save `token` and `user` payload into `localStorage`.
     - Read `user.role` and navigate to:
       - `student` -> `/student/dashboard`
       - `faculty` -> `/faculty/dashboard`
       - `alumni` -> `/alumni/dashboard`
       - `recruiter` -> `/recruiter/dashboard`
       - `admin` -> `/faculty/hod-analytics`
   - On error:
     - Extract `error.response?.data?.message` || "Invalid email or password".
     - Set `errors.general = message`.
   - Reset `isLoading = false`.

### Phase 4: Error Handling & Empty States
1. Display red-tinted glassmorphic error banner above submit button when `errors.general` is non-empty.
2. Provide shake animation or border highlight on invalid input fields.

### Phase 5: Verification & Routing Registration
1. Mount route `<Route path="/login" element={<LoginPage />} />` in `src/App.jsx`.
2. Test responsive breakpoint collapse on mobile viewports (< 768px).
