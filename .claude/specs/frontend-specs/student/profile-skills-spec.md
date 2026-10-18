# Screen Specification: Student Profile & Skills Builder

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Student/profile-skills-builder/profile_skills_screen.png`
- **Visual Description**: Profile and verified skills console. Top profile hero card shows the student avatar with verified badge ("RM"), name "Rohan Mehta", "Tier-1 Placement Candidate" pill, academic degree ("B.Tech CSE • Batch of 2026"), Roll No, email, Cumulative SGPA (8.80 / 10.0, Top 4% Dept Rank), GitHub, LinkedIn, and personal website links, profile completeness bar (95%), "Edit Details" button, and "Sync ATS Resume" button. Below are two academic verification cards: Academic Trajectory (Semester 1-4 SGPA boxes) and Verified Core Coursework (Data Structures, OS, DBMS, Networks, Distributed Systems with grades A+, A). Middle section features the Technical Skills & Competency Matrix with category filter pills (All Skills 18, Languages, Frameworks & Libraries, DevOps & Cloud, Core CS & System Design), "+ Add New Skill" button, interactive skill cards (React.js, Node.js, System Design, Python & DSA, Docker & Kubernetes, PostgreSQL) showing tier, rubric score (e.g., 4.8/5.0), verified by faculty/alumni tag, and "View Proof". Below is a Direct Skill Registration & Assessment Request form (Skill Title, Domain Category, Proficiency Level, "Submit for Verification" CTA). Bottom section displays Professional Competencies ratings and Verified Certifications (AWS Certified, Meta Frontend Developer, Dean's Honor List) with "+ Add Certification" button.

## 2. Intended User Role
- `student` (profile owner; faculty/recruiter can view in read-only mode).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/userRoutes.js`
  - `backend/routes/progressRoutes.js`
  - `backend/routes/placementRoutes.js`
- **Controllers**:
  - `backend/controllers/userController.js` (`getProfile`, `updateProfile`)
  - `backend/controllers/progressController.js` (`getProgressDashboard`)
  - `backend/controllers/placementController.js` (`getPlacementReadiness`)
- **Models**: `User.js`, `StudentProfile.js`

## 4. Exact API Endpoints Mapped
- `GET /api/users/profile` — Retrieves logged-in user profile, role-specific student profile details, academic records, and skills.
- `PUT /api/users/profile` — Updates profile information, portfolio links, academic fields, and registers new skill entries.
- `GET /api/placement/readiness/:studentId` — Retrieves benchmark readiness metrics influenced by verified skills.

## 5. Required HTTP Operations
- `GET`: Loads authenticated student profile, academic semester history, and verified skills.
- `PUT`: Submits profile updates or newly added skills for verification.

## 6. Reusable Components
- `StudentSidebar`: Persistent role navigation.
- `PortalTopBar`: Search, export profile button, notifications.
- `CategoryFilterPills`: Horizontal filter bar for competencies.
- `SkillCompetencyCard`: Card displaying skill title, tier, rubric rating, verification badge, and proof action link.
- `ProgressBar`: Strip progress indicator for profile completeness and competencies.
- `InputField`: Styled input for skill title and URL links.
- `SelectDropdown`: Dropdown for domain categories and proficiency levels.

## 7. Page-Specific Components
- `StudentProfileHero`: Large banner card with avatar, social links, and completeness meter.
- `AcademicTrajectoryGrid`: Grid of semester SGPA cards with cumulative GPA callout.
- `SkillRegistrationForm`: Form for requesting skill assessment and faculty verification.
- `CertificationList`: Stack of verified industry certifications with verification badges.

## 8. Loading States
- Skeleton loader cards for profile hero and competency matrix while fetching.
- Submit button displays spinner during `PUT /api/users/profile`.

## 9. Error States
- Error alert if profile fetch fails.
- Field validation errors if skill title is empty or URL is malformed.
- Server error toast if skill update fails.

## 10. Empty States
- "No certifications added yet" with "Add Certification" prompt when list is empty.
- "No skills found under this category" with "+ Add Skill" button when category filter has no results.

## 11. Form Validation Requirements
- Skill Title: Required, min 2 characters.
- Domain Category: Required selection.
- Proficiency Level: Required selection.
- Portfolio / GitHub URLs: Must match valid URL format.

## 12. RBAC Restrictions
- Authenticated `student` role has full edit rights to own profile.
- Non-owners (e.g. `faculty`, `recruiter`) have read-only view.

## 13. Routing Path
- `/student/profile`

## 14. Responsive Behavior
- **Desktop (>= 1024px)**: Multi-column grid for skills (3 cards per row) and academic trajectory (4-box row).
- **Tablet (768px - 1023px)**: 2 columns for skill cards; academic trajectory wraps into 2x2 grid.
- **Mobile (< 768px)**: 1 column for all cards; category pills horizontally scrollable.
