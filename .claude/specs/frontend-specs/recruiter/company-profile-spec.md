# Screen Specification: Recruiter Company Profile & Hiring Bar Manager

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Recruiter/company-profile/company_profile_screen.png`
- **Visual Description**: Corporate hiring criteria, compensation tiers, and campus benchmark configuration console. Top header displays breadcrumb "Portal > Enterprise Profile > TechCorp Global Profile & Hiring Bar Manager", live badge "Profile Live on Campus Portal (Autumn 2026 Drive Active)", "Preview Campus View", and "Save & Publish Changes" primary button. Main brand card shows company logo ("TC"), name "TechCorp Global", "Tier-1 Super Dream Partner" badge, "Fortune 100 Tech", tagline ("Building next-generation hyperscale cloud infrastructure and real-time distributed platforms for 200M+ global enterprise users."), action buttons "Edit Brand Assets" and "Share Campus Link", metric pills: Engineering Hubs (Bangalore, Seattle, Zurich), Glassdoor Rating (4.8 / 5.0), Primary Campus Roles (SDE-1 Cloud & Core Backend), Campus Alumni Count (48 Alumni Employed), and Core Engineering Culture tags (`Extreme Ownership`, `Extreme Rigor & Scalability`, `Zero-Ego Code Reviews`, `Rapid Production Impact`). Below is the Active Campus Roles & Eligibility Rubrics section with "+ Add Target Role" button and role cards:
  - Role 1: Software Development Engineer - 1 (SDE-1 - Cloud Platform Engineering), compensation CTC 24 - 28 LPA (Super Dream Tier), Base 18.5 LPA, Signing Bonus 3.0 LPA, Stock RSUs 20 Lakhs over 4 years, 10 Openings, Min CGPA 8.0/10.0 (zero active backlogs), Eligible Depts: CSE, ISE, ECE, Core Competency Mandate: OS, Distributed Systems, Multi-threading & Concurrency, link: "32 Candidates pre-qualified in GRIP Talent Bench".
  - Role 2: Software Development Engineer - 1 (SDE-1 - Data Backend & Data Infrastructure), 22 - 25 LPA, 5 Openings, Min CGPA 7.8/10.0.
Below is the TechCorp 4-Stage Campus Selection Funnel (Online Proctored OA 90m, Tech Interview 1 DSA 60m, Tech Interview 2 LLD 60m, Bar-Raiser 45m). Right sidebar features: Hiring Bar Weights (Total 100%: Distributed Systems 30%, DSA 25%, Database ACID 20%, LLD 15%, STAR Behavioral 10%) with Fast-Track Policy callout, Automated ATS Triggers (Auto-shortlist >85% readiness, Require Faculty Endorsement, Bidirectional Workday sync, Notify Alumni Mentors on shortlist), and Designated Campus Liaisons (Vikram Singhania, Prof. Neha Sharma).

## 2. Intended User Role
- `recruiter` (and placement administrators).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/companyRoutes.js`
  - `backend/routes/userRoutes.js`
  - `backend/routes/departmentRoutes.js`
- **Controllers**:
  - `backend/controllers/companyController.js` (`addCompany`)
  - `backend/controllers/userController.js` (`getProfile`)
  - `backend/controllers/departmentController.js` (`getSkillGaps`)
- **Models**: `Company.js`, `RecruiterProfile.js`, `User.js`

## 4. Exact API Endpoints Mapped
- `POST /api/companies` — Creates or updates company profile, compensation brackets, target skills, and benchmark thresholds (handled by `companyController.addCompany`).
- `GET /api/users/profile` — Retrieves recruiter profile and linked company details.
- `GET /api/department/skill-gaps` — Inspects departmental alignment against configured company hiring weights.

## 5. Required HTTP Operations
- `GET`: Loads existing company profile, active job roles, and campus liaisons.
- `POST`: Saves and publishes updated company profile, roles, and hiring bar weights.

## 6. Reusable Components
- `RecruiterSidebar`: Standard recruiter navigation sidebar.
- `PortalTopBar`: Top header bar with save status.
- `RoleCard`: Card displaying job role, CTC breakdown, openings count, and eligibility criteria.
- `ProgressBar`: Hiring bar weights progress bars.
- `ToggleSwitch`: Checkbox/toggle for automated ATS triggers.
- `PrimaryButton`: "Save & Publish Changes" action button.

## 7. Page-Specific Components
- `CompanyBrandHero`: Banner card with logo, stats, and engineering culture chips.
- `CompensationBreakdownWidget`: Mini card with Base, Bonus, RSUs, and Openings counters.
- `SelectionFunnelList`: 4-stage assessment process cards with duration tags.
- `CampusLiaisonsCard`: Cards displaying campus alumni and faculty contact leads.

## 8. Loading States
- Shimmer placeholders for company hero and job roles while fetching data.
- "Save & Publish Changes" button shows loading spinner during POST request.

## 9. Error States
- Form validation error banner if required fields (role title, CTC, CGPA cutoff) are empty.
- Server error alert if company profile update fails.

## 10. Empty States
- "No active campus roles configured" with "+ Add Target Role" button.

## 11. Form Validation Requirements
- Role Title: Required string.
- Base Salary and Total CTC: Required numeric values.
- Minimum CGPA Cutoff: Number between 0.0 and 10.0.
- Hiring Bar Weights: Sum of all weights must equal 100%.

## 12. RBAC Restrictions
- Protected by `protect` and `authorize('recruiter', 'admin')`.

## 13. Routing Path
- `/recruiter/company-profile`

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: 2-column layout (Left roles & funnel flex-1, Right weights & ATS triggers rail 380px).
- **Tablet (768px - 1279px)**: Stacked 1-column layout; right rail moves below roles.
- **Mobile (< 768px)**: 1-column layout; compensation stats wrap into 2x2 grid.
