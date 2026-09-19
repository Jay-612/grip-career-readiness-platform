# Implementation Plan: Student Profile & Skills Builder

## 1. Goal
Construct `ProfileSkillsPage.jsx` based on `.claude/specs/frontend-specs/student/profile-skills-spec.md` and screenshot `.claude/images/stitch/Student/profile-skills-builder/profile_skills_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Axios client: `src/services/apiClient.js`
- Layout components: `StudentSidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Student/ProfileSkillsPage.jsx`.
2. Define states:
   - `profile`: Full profile object (`user`, `studentProfile`, `academics`, `skills`, `certifications`).
   - `selectedCategory`: String (`'all'`).
   - `newSkillForm`: `{ title: '', category: 'Languages & Runtimes', level: 'Intermediate (1+ yrs / Projects)' }`.
   - `isSaving`: Boolean (`false`).
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`, invoke `GET /api/users/profile`.
   - Extract student ID and fetch `GET /api/placement/readiness/:studentId`.
   - Update `profile` state and set `isLoading = false`.

### Phase 2: Profile Hero & Academic Cards
1. Render `StudentProfileHero`:
   - Student avatar, name, degree, roll number, email, and social links.
   - Profile completeness meter (95%) with CTA for ATS resume sync.
2. Render `AcademicTrajectory`:
   - 4 semester SGPA boxes (Sem 1 to 4) with cumulative SGPA 8.80.
3. Render `VerifiedCoursework`:
   - Core courses list with grades and status badges.

### Phase 3: Competency Matrix & Skill Request Form
1. Render category filter pills (All Skills, Languages, Frameworks, DevOps, Core CS).
2. Render filtered list of `SkillCompetencyCard` components:
   - Skill title, tier, rating bar, faculty verification badge, and action buttons.
3. Build `DirectSkillRegistrationForm`:
   - Inputs for skill name, category dropdown, proficiency dropdown.
   - On submit, append new skill to profile payload and dispatch `PUT /api/users/profile`.
   - Show success toast and update local skill list.

### Phase 4: Professional Competencies & Certifications
1. Render professional competencies list (Technical Articulation, Problem Solving, Agile Teamwork, Leadership) with scores out of 5.0.
2. Render verified certifications list (AWS, Meta, Dean's Honor List) with add modal trigger.

### Phase 5: Verification & Routing Registration
1. Mount `<Route path="/student/profile" element={<ProfileSkillsPage />} />` in `src/App.jsx`.
2. Verify adding a skill invokes `PUT /api/users/profile` and refreshes the matrix.
