# Implementation Plan: Alumni Experience Publisher & Interview Guide Editor

## 1. Goal
Construct `ExperiencePublisherPage.jsx` based on `.claude/specs/frontend-specs/alumni/experience-publisher-spec.md` and screenshot `.claude/images/stitch/Alumni/experience-publisher/experience_publisher_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Centralized Axios client: `src/services/apiClient.js`
- React Router v6: `useParams`, `useNavigate`
- Layout components: `AlumniSidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Editor Initialization
1. Create `src/pages/Alumni/ExperiencePublisherPage.jsx`.
2. Define states:
   - `guideForm`:
     ```javascript
     {
       title: 'Cracking the TechCorp SDE-1 On-Campus Drive: Complete Round-by-Round Breakdown',
       company: 'TechCorp Global',
       role: 'SDE-1 (Cloud Platform)',
       ctc: '24 - 28 LPA',
       difficulty: 'Medium - Hard',
       tags: ['System Design', 'Distributed Caching', 'Go / Java', 'ACID & Concurrency', 'STAR Method'],
       overview: '',
       rounds: [
         { name: 'Round 1: DSA', duration: '45m', problem: '', code: '', pitfalls: '' },
         { name: 'Round 2: LLD & Concurrency', duration: '60 Min', problem: '', code: '', pitfalls: '' },
         { name: 'Round 3: Bar Raiser', duration: '45m', problem: '', code: '', pitfalls: '' }
       ],
       behavioral: { question: '', recommendation: '' },
       enableReferralRequests: true,
       attachMockWidget: true
     }
     ```
   - `activeRoundIndex`: Number (`1`).
   - `isPublishing`: Boolean (`false`).
   - `isLoading`: Boolean (`false`).
   - `error`: String (`null`).
3. In `useEffect`:
   - If `postId` parameter exists in URL, fetch `GET /api/alumni/posts/:id` and populate `guideForm`.

### Phase 2: Metadata Strip & Funnel Visualizer
1. Build `GuideMetadataStrip`:
   - Editable inputs for Title, Company Name, Role, CTC, and Difficulty rating.
   - Tag input allowing adding and removing competencies.
2. Build `HiringFunnelStepper`:
   - 4 stages: Online Assessment, Tech Round 1, Tech Round 2 LLD, Bar Raiser.

### Phase 3: Round-by-Round Rubric Editor
1. Build `RoundTabSelector`:
   - Tabs for Round 1, Round 2, Round 3, and "+ Add Round" button.
2. Build `ProblemAndCodeEditor`:
   - Live coding problem statement textarea.
   - Syntax-highlighted code block editor for sample code and rate limiters.
   - Common student pitfalls callout box.
3. Build `BehavioralAlignmentSection`:
   - Inputs for primary bar-raiser question and STAR framework advice.

### Phase 4: Right Sidebar (Completeness & Quick Inserts)
1. Build `GuideCompletenessMeter`:
   - Radial progress gauge (94%) with 5 verification checklist items.
2. Build `ReferralHooksPanel`:
   - Checkboxes to enable direct referral requests and 1:1 mock interview booking widget.
3. Build `QuickInsertBar`:
   - Buttons to insert Code Snippet, Architecture Diagram, or Scorecard block into active round.

### Phase 5: Publishing & API Integration
1. Implement `handlePublish()`:
   - Validate required fields (title, company, role, at least 1 round with description).
   - Set `isPublishing = true`.
   - If in edit mode, dispatch `PUT /api/alumni/posts/:id`.
   - If new, dispatch `POST /api/alumni/posts` with payload:
     ```json
     {
       "title": guideForm.title,
       "company": guideForm.company,
       "role": guideForm.role,
       "ctc": guideForm.ctc,
       "difficulty": guideForm.difficulty,
       "tags": guideForm.tags,
       "rounds": guideForm.rounds,
       "content": guideForm.overview
     }
     ```
   - On success, display success toast and navigate to `/alumni/dashboard`.
   - Set `isPublishing = false`.

### Phase 6: Verification & Routing Registration
1. Add `<Route path="/alumni/experience-publisher" element={<ExperiencePublisherPage />} />` and `<Route path="/alumni/experience-publisher/:postId" element={<ExperiencePublisherPage />} />` in `src/App.jsx`.
2. Verify adding tags, modifying code blocks, and publishing guide.
