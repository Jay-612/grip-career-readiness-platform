# Screen Specification: User Login

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Auth/login/login_screen.png`
- **Visual Description**: Two-column layout with a dark dot-grid pattern background. Left column displays brand badges ("SECURE CAMPUS ACCESS"), headline ("Welcome Back to Your Career Command Center"), supportive copy, dynamic campus live telemetry preview cards (Upcoming Faculty Mentorship, Semester 5 Milestone Track with 60% radial progress, Campus Recruiter Activity), and social proof avatars with enrollment counters. Right column displays a glassmorphic login card with campus role selector tabs, email input with `.edu` validation requirement badge, password input with show/hide toggle and "Forgot Password?" link, session persistence checkbox with "Encrypted 256-bit" badge, high-contrast gradient CTA ("Sign In to GRIP ->"), divider for University SSO (SAML/Shibboleth), and redirect link to Registration.

## 2. Intended User Role
- Public / Unauthenticated users targeting roles: `student`, `faculty`, `alumni`, `recruiter`, and `admin`.

## 3. Backend Architecture Inspection
- **Routes**: `backend/routes/authRoutes.js`
- **Controllers**: `backend/controllers/authController.js` (`login`)
- **Models**: `backend/model/User.js` (`email`, `password`, `role`, `name`)

## 4. Exact API Endpoints Mapped
- `POST /api/auth/login` (Public login endpoint handled by `authController.login`)

## 5. Required HTTP Operations
- `POST`: Submits user authentication payload (`email`, `password`) to receive a signed JWT token and user profile details.

## 6. Reusable Components
- `CampusBadge`: Reusable badge pill with dot indicator ("SECURE CAMPUS ACCESS").
- `RoleSelectorTabs`: Segmented button control for role selection.
- `InputField`: Reusable form input with leading icon, label, error display, and badge slots.
- `PasswordInput`: Input component with embedded lock icon and visibility toggle.
- `PrimaryButton`: Full-width gradient action button with loading spinner state.
- `SocialProofBar`: Stacked avatar circles with impact copy.
- `GlobalFooter`: Institutional compliance links ("Institutional Governance", "FERPA & Data Privacy", "Technical Support").

## 7. Page-Specific Components
- `LoginTelemetryPreview`: Left-column mock status cards showing live platform stats.
- `UniversitySSOButton`: Dedicated institution SAML authentication button.

## 8. Loading States
- Submit button enters loading state with spinning SVG indicator and text "Signing in...".
- Inputs and role tabs become disabled (`pointer-events: none`, reduced opacity) during in-flight authentication.

## 9. Error States
- Inline validation error below email or password input for empty or invalid fields.
- Form-level alert banner displaying backend error messages (e.g., "Invalid email or password", HTTP 400/401).
- Network disconnection alert if backend is unreachable.

## 10. Empty States
- Initial pristine form with empty credentials and role default.

## 11. Form Validation Requirements
- Email: Required, must match valid email format regex (`^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$`).
- Password: Required, non-empty.
- Client validation executed on submit and `onBlur`.

## 12. RBAC Restrictions
- Accessible to unauthenticated users (`/login`). If user already possesses a valid JWT token, redirect immediately to their role dashboard (`/student/dashboard`, `/faculty/dashboard`, `/alumni/dashboard`, `/recruiter/dashboard`).

## 13. Routing Path
- `/login`

## 14. Responsive Behavior
- **Desktop (>= 1024px)**: Two-column grid (Left: value prop & telemetry cards, Right: centered login form).
- **Tablet (768px - 1023px)**: Single-column centered layout; telemetry card stack rendered below the login card.
- **Mobile (< 768px)**: Single column with edge-to-edge padded card; telemetry cards hidden or collapsed to preserve focus on the login form.
