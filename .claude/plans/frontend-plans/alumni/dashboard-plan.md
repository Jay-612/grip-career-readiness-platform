# Implementation Plan: Alumni Mentorship & Network Dashboard

## 1. Goal
Construct `AlumniDashboard.jsx` based on `.claude/specs/frontend-specs/alumni/dashboard-spec.md` and screenshot `.claude/images/stitch/Alumni/dashboard/dashboard_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Centralized Axios client: `src/services/apiClient.js`
- Layout components: `AlumniSidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Alumni/AlumniDashboard.jsx`.
2. Define states:
   - `alumniProfile`: Object (`name`, `currentCompany`, `jobRole`, `graduationYear`).
   - `metrics`: `{ studentsMentored: 24, referrals: 14, guidesCount: 6, rating: 4.96 }`.
   - `upcomingSessions`: Array of scheduled mock interviews.
   - `preMatchedCandidates`: Array of students matching alumnus's company bar.
   - `publishedGuides`: Array of guides published by this alumnus.
   - `domainQuestions`: Array of pending student questions.
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`, execute concurrent API requests:
   - `GET /api/users/profile` -> `alumniProfile`
   - `GET /api/appointments` -> `upcomingSessions`
   - `GET /api/placement/leaderboard` -> `preMatchedCandidates`
   - `GET /api/alumni/posts` -> `publishedGuides`
   - `GET /api/guidance/requests` -> `domainQuestions`
   - Set `isLoading = false`.

### Phase 2: Structural Layout & Top Hero
1. Wrap page with `AlumniSidebar` and `PortalTopBar`.
2. Render `AlumniHeroBanner`:
   - Display greeting, company verification badge ("Verified TechCorp Alumni"), super mentor badge, and "Sync Calendar" button.
3. Render 4 metric summary cards (Students Mentored, Campus Referrals, Published Guides, Mentorship Rating).

### Phase 3: Sessions, Referrals & Published Guides
1. Build `UpcomingMentorshipSessions`:
   - List scheduled mock screens with candidate info, readiness score bar, and "Launch Video Room" button.
2. Build `PreMatchedCandidates`:
   - Display candidate cards with match percentage (96%), verified achievements, and "Refer to Panel" button.
3. Build `PublishedGuidesFeed`:
   - Display cards for published guides with read counts, bookmarks, and upvote counters.
   - Include "+ Write New Guide" button linking to `/alumni/experience-publisher`.
4. Build `StudentDomainQACard`:
   - Display pending questions with "Quick Reply" button.

### Phase 4: Loading Skeletons & Error Boundaries
1. Render loading shimmer blocks while data is fetched.
2. Implement error fallback card with retry trigger.

### Phase 5: Verification & Routing Registration
1. Add `<Route path="/alumni/dashboard" element={<AlumniDashboard />} />` in `src/App.jsx`.
2. Verify role-based routing and ensure non-alumni roles are redirected.
