# Implementation Plan: Student Mentorship & Q&A Hub

## 1. Goal
Construct `MentorshipHubPage.jsx` based on `.claude/specs/frontend-specs/student/mentorship-hub-spec.md` and screenshot `.claude/images/stitch/Student/mentorship-hub/mentorship_hub_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Axios client: `src/services/apiClient.js`
- Layout components: `StudentSidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Student/MentorshipHubPage.jsx`.
2. Define states:
   - `confirmedSessions`: Array of upcoming mentorship appointments.
   - `mentorsList`: Array of faculty and alumni mentors.
   - `qaThreads`: Array of guidance request and discussion threads.
   - `mentorFilter`: String (`'all'`).
   - `qaFilter`: String (`'all'`).
   - `isQuestionModalOpen`: Boolean (`false`).
   - `isBookingModalOpen`: Boolean (`false`).
   - `selectedMentorForBooking`: Object (`null`).
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`, execute concurrent requests:
   - `GET /api/appointments` -> `confirmedSessions`
   - `GET /api/mentors/recommendation` -> `mentorsList`
   - `GET /api/guidance/requests` -> `qaThreads`
   - Set `isLoading = false`.

### Phase 2: Top Metrics & Upcoming Confirmed Sessions
1. Render 4 metric summary tiles (Completed Sessions, Upcoming Syncs, Faculty Endorsements, Avg Rating 4.9/5.0).
2. Render `UpcomingConfirmedSessions`:
   - Session cards showing mentor details, session agenda, in-person room or virtual link, and "Join Video Room" or "View Session Prep Sheet".

### Phase 3: Mentor Directory & Filtering
1. Render filter pills: All Mentors (52), Faculty Advisors, Industry Alumni, Placement Officers, Cloud/AI Systems.
2. Render 4-column responsive grid of `MentorCard` components:
   - Mentor name, rating, department/company badge, expertise tags, and booking CTA.
   - Clicking "Book Office Hours" sets `selectedMentorForBooking` and opens `BookMentorshipModal`.

### Phase 4: Institutional Technical Q&A Board
1. Render topic filter pills (All Discussions, System Design, DSA, Placement Policies, Capstone Projects).
2. Render threaded `DiscussionCard` items:
   - Question title, author, timestamp, verified faculty/alumni answer quote box, and thread replies count.
3. Build `AskQuestionModal`:
   - Inputs: Question title, category, detailed query text, optional code block.
   - Submit dispatches `POST /api/guidance/request`, prepends new item to `qaThreads`, and closes modal.

### Phase 5: Verification & Routing Registration
1. Add `<Route path="/student/mentorship" element={<MentorshipHubPage />} />` in `src/App.jsx`.
2. Verify submitting question and booking session dispatch to `/api/guidance/request` and `/api/appointments`.
