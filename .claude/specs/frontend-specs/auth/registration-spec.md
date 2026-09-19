# Screen Specification: User Registration

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Auth/registration/registration_screen.png`
- **Visual Description**: Two-column layout with ambient light/dark dotted background. Left column displays brand pill ("FROM CAMPUS TO CAREER"), hero headline ("Start Your Journey to Placement Readiness"), supporting text, a prominent Readiness Benchmark Card with radial 85% gauge, rubric progress bar ("7/8 Done"), and 3 feature summary cards ("Personalized Career Roadmaps", "1-on-1 Faculty Mentorship", "Verified Alumni Network"), followed by social proof circles. Right column displays a registration form with 4 interactive Campus Role cards (Student - Candidate, Faculty - Mentor & Evaluator, Alumni - Industry Advisor, Recruiter - Campus Hiring), Full Name, Department/Branch select dropdown, Institutional/College Email with badge ("Requires .edu / official campus domain"), Create Password & Confirm Password inputs with "Matched" check indicator, a 3-segment Password Security Strength meter ("Strong", min 8 chars, 1 number, 1 uppercase), Terms & Conditions checkbox, "Create Account ->" submit button, login redirect link, and SAML 2.0 compatibility tag.

## 2. Intended User Role
- Public / Unregistered candidate enrolling as: `student`, `faculty`, `alumni`, or `recruiter`.

## 3. Backend Architecture Inspection
- **Routes**: `backend/routes/authRoutes.js`
- **Controllers**: `backend/controllers/authController.js` (`register`)
- **Models**: `backend/model/User.js`, `backend/model/StudentProfile.js`, `backend/model/FacultyProfile.js`, `backend/model/AlumniProfile.js`, `backend/model/RecruiterProfile.js`

## 4. Exact API Endpoints Mapped
- `POST /api/auth/register` (Public registration endpoint handled by `authController.register`)

## 5. Required HTTP Operations
- `POST`: Sends new account payload (`name`, `email`, `password`, `role`) to create user in database and return JWT token.

## 6. Reusable Components
- `RoleCardSelector`: 4-column selectable role cards with role icons and subtitles.
- `InputField`: Reusable input wrapper with icons, labels, and validation text.
- `SelectDropdown`: Dropdown component for department/branch selection.
- `PasswordStrengthMeter`: Multi-tier strength indicator bar with validation checks.
- `Checkbox`: Styled terms agreement checkbox.
- `PrimaryButton`: Submit button with animated loading state.

## 7. Page-Specific Components
- `ReadinessBenchmarkCard`: Radial visual preview of readiness score and rubric completion.
- `FeatureValueStack`: 3 stacked feature benefit cards.

## 8. Loading States
- Primary button shows inline spinner and text "Creating Account...".
- Form fields are disabled during request submission.

## 9. Error States
- Red border on mismatched passwords.
- Form alert banner if backend returns HTTP 400 (validation fail) or HTTP 409 (email already in use).
- Email format validation alert if missing university domain or invalid structure.

## 10. Empty States
- Form displays initial empty fields with "Student" selected by default.

## 11. Form Validation Requirements
- Full Name: Non-empty string.
- Department/Branch: Selected value.
- Email: Valid format, required.
- Password: Min 8 characters, at least 1 uppercase letter, at least 1 number.
- Confirm Password: Must strictly match `password`.
- Terms agreement checkbox: Must be checked.

## 12. RBAC Restrictions
- Accessible to unauthenticated visitors. Authenticated users are redirected to their active role portal.

## 13. Routing Path
- `/register`

## 14. Responsive Behavior
- **Desktop (>= 1024px)**: Two-column grid (Left: value prop & readiness preview, Right: registration card).
- **Tablet (768px - 1023px)**: Single-column centered layout; role selector adapts to a 2x2 grid.
- **Mobile (< 768px)**: 1-column layout with 2x2 or vertically stacked role cards; left column collapsed.
