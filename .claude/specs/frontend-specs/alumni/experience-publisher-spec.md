# Screen Specification: Alumni Experience Publisher & Interview Guide Editor

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Alumni/experience-publisher/experience_publisher_screen.png`
- **Visual Description**: Full-scale interview experience authoring and rubric breakdown studio. Header displays breadcrumb "Portal > Alumni Network > Experience Publisher & Guide Editor", auto-save status ("Auto-saved 2m ago"), "Preview Student View", and "Publish to Campus Hub" primary button. Top guide header input features title: "Cracking the TechCorp SDE-1 On-Campus Drive: Complete Round-by-Round Breakdown", version tag ("Version 2.4 • Campus Season 2026"), metadata strip cards: Target Company (TechCorp Global, Verified Hiring Partner), Target Role (SDE-1 Cloud Platform, Distributed Systems & K8s), Compensation CTC (24-28 LPA, Super Dream Tier), Drive Difficulty (Medium-Hard, 4.2 / 5.0), and Core Competencies tags (System Design, Distributed Caching, Go / Java, ACID & Concurrency, STAR Method, "+ Add Tag"). Section 1: Overview & Campus Hiring Funnel with visual 4-stage funnel (Stage 1: Online Assessment, Stage 2: Tech Round 1, Stage 3: Tech Round 2 LLD & Concurrency [60 Min], Stage 4: Bar Raiser). Section 2: Round-by-Round Detailed Rubric with tab selector (Round 1 DSA, Round 2 LLD, Round 3 Bar Raiser, "+ Add Round" button), Live Coding Problem Statement ("Design an in-memory distributed rate limiter with sliding-window-log algorithm..."), code editor block (`SlidingWindowLimiter` in Java/Go), and Common Student Pitfalls & Elimination Factors warning box. Section 3: Behavioral & Bar-Raiser Alignment with primary question ("Tell me about an architectural trade-off...") and STAR framework recommendation. Right sidebar displays Guide Completeness radial gauge (94% Institutional Grade, checklist of 5 verified criteria), Referral & Mentorship Hooks toggle ("Enable Direct Referral Requests", "Attach 1:1 Mock Interview Widget"), and Audience & Quick Inserts (142 Students targeting TechCorp, buttons to insert Code Snippet, Architecture Diagram, Rubric Scorecard Block).

## 2. Intended User Role
- `alumni` (and accredited `faculty` / industry mentors).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/alumniRoutes.js`
  - `backend/routes/userRoutes.js`
  - `backend/routes/companyRoutes.js`
- **Controllers**:
  - `backend/controllers/alumniPostController.js` (`createPost`, `getPostById`, `updatePost`, `deletePost`, `getAllPosts`)
  - `backend/controllers/userController.js` (`getProfile`)
- **Models**: `ExperiencePost.js`, `AlumniProfile.js`, `Company.js`, `User.js`

## 4. Exact API Endpoints Mapped
- `POST /api/alumni/posts` — Publishes a new interview breakdown guide (handled by `alumniPostController.createPost`).
- `GET /api/alumni/posts/:id` — Retrieves an existing guide for editing.
- `PUT /api/alumni/posts/:id` — Updates guide content, rounds, and rubric snippets (handled by `alumniPostController.updatePost`).
- `DELETE /api/alumni/posts/:id` — Removes an authored experience post.
- `GET /api/alumni/posts` — Retrieves author's previously published articles.

## 5. Required HTTP Operations
- `GET`: Fetches existing guide data when in edit mode.
- `POST`: Publishes new interview guide to the student campus hub.
- `PUT`: Saves draft or updates published guide.
- `DELETE`: Deletes an authored guide.

## 6. Reusable Components
- `AlumniSidebar`: Persistent alumni navigation sidebar.
- `PortalTopBar`: Top header bar with save status.
- `CodeViewer`: Syntax-highlighted code editor and viewer.
- `TagInput`: Tag editor for technical competencies.
- `TabSelector`: Round-by-round rubric tab selector.
- `RadialProgressGauge`: Guide completeness indicator.
- `PrimaryButton`: "Publish to Campus Hub" action button.

## 7. Page-Specific Components
- `GuideMetadataStrip`: Company, role, CTC range, and difficulty indicator cards.
- `HiringFunnelStepper`: 4-stage campus selection timeline visualization.
- `PitfallWarningBox`: Callout card highlighting common elimination factors.
- `ReferralHooksPanel`: Sidebar toggles enabling candidate referral petitions.

## 8. Loading States
- Shimmer placeholders when loading existing guide in edit mode.
- "Publish to Campus Hub" button displays spinner and disables during POST.

## 9. Error States
- Form error banner if required fields (title, company, role, content) are missing.
- Toast error if publishing fails due to server error.

## 10. Empty States
- Blank template with pre-populated placeholders for new guides.

## 11. Form Validation Requirements
- Guide Title: Required, min 10 characters.
- Target Company: Required.
- Target Role: Required.
- Compensation CTC: Required.
- Rounds: At least 1 round breakdown with problem description.

## 12. RBAC Restrictions
- Protected by `protect` and `authorize('alumni')` for creation/editing.

## 13. Routing Path
- `/alumni/experience-publisher` (or `/alumni/experience-publisher/:postId`)

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: 2-column layout (Left editor flex-1, Right completeness & quick-insert rail 340px).
- **Tablet (768px - 1279px)**: Stacked 1-column layout; sidebar moves below editor.
- **Mobile (< 768px)**: 1-column layout; funnel stages wrap into 2x2 grid; code editor allows horizontal scroll.
