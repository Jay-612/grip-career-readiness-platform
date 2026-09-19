# Implementation Plan: User Registration

## 1. Goal
Construct the `RegisterPage.jsx` view corresponding to `.claude/specs/frontend-specs/auth/registration-spec.md` and reference image `.claude/images/stitch/Auth/registration/registration_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Axios client: `src/services/apiClient.js`
- React Router v6 hooks: `useNavigate`, `Link`

## 3. Phased Implementation Steps

### Phase 1: Component Initialization & State Setup
1. Create `src/pages/Auth/RegisterPage.jsx`.
2. Define states:
   - `formData`: `{ name: '', email: '', password: '', confirmPassword: '', department: 'Computer Science & Engineering', role: 'student', agreedToTerms: false }`
   - `validationErrors`: `{}`
   - `passwordStrength`: `{ score: 0, hasMinLen: false, hasNumber: false, hasUpper: false }`
   - `isLoading`: Boolean (`false`)
   - `serverError`: String (`''`)

### Phase 2: Form Interaction & Live Validation
1. Build interactive Role Selector cards:
   - Student (Candidate)
   - Faculty (Mentor & Evaluator)
   - Alumni (Industry Advisor)
   - Recruiter (Campus Hiring)
2. Implement live password strength evaluator:
   - Check length >= 8, `/[A-Z]/`, `/[0-9]/`.
   - Update `passwordStrength` object and visual 3-bar progress gauge dynamically.
3. Validate `confirmPassword === password` and display "Matched" check indicator.

### Phase 3: API Integration
1. Implement `handleRegister(e)`:
   - Prevent default form submission.
   - Run complete validation suite. If invalid, populate `validationErrors` and halt.
   - Set `isLoading = true` and clear `serverError`.
   - Send payload to `POST /api/auth/register` with `{ name, email, password, role }`.
   - On success (201 Created):
     - Save returned `token` and `user` object in `localStorage`.
     - Direct user to their designated dashboard (`/student/dashboard`, etc.).
   - On error:
     - Capture `error.response?.data?.message` and set `serverError`.
   - Finally set `isLoading = false`.

### Phase 4: UI Scaffolding & Responsive Layout
1. Implement left column: Readiness Benchmark Card with radial progress, feature summary cards, and social proof avatars.
2. Implement right column: Registration card with role cards, inputs, dropdowns, and buttons.
3. Configure responsive breakpoints (1-column on mobile/tablet, 2-column on desktop).

### Phase 5: Verification & Routing Registration
1. Add `<Route path="/register" element={<RegisterPage />} />` in `src/App.jsx`.
2. Verify role selection updates `formData.role` and successful registration redirects to the appropriate role dashboard.
