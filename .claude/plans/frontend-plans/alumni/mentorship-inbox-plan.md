# Implementation Plan: Alumni Mentorship Inbox & Advising Queue

## 1. Goal
Construct `AlumniMentorshipInboxPage.jsx` based on `.claude/specs/frontend-specs/alumni/mentorship-inbox-spec.md` and screenshot `.claude/images/stitch/Alumni/mentorship-inbox/mentorship_inbox_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Axios client: `src/services/apiClient.js`
- Layout components: `AlumniSidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Alumni/AlumniMentorshipInboxPage.jsx`.
2. Define states:
   - `inquiries`: Array of guidance inquiries, referral petitions, and booked mock sessions.
   - `selectedInquiryId`: String / ObjectId (defaults to first active inquiry).
   - `selectedInquiryDetail`: Object containing student candidate info, notes, and discussion history.
   - `replyText`: String (`''`).
   - `preScreenPassed`: Boolean (`true`).
   - `activeFilter`: String (`'all'`).
   - `isSubmitting`: Boolean (`false`).
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`:
   - Concurrently fetch:
     - `GET /api/guidance/requests`
     - `GET /api/appointments`
   - Combine into unified `inquiries` list.
   - If inquiries exist, auto-select first inquiry and fetch `GET /api/users/:id`.
   - Set `isLoading = false`.

### Phase 2: Master-Detail Split Pane Scaffolding
1. Wrap page with `AlumniSidebar` and `PortalTopBar`.
2. Construct 2-column layout:
   - Left Master Queue (w-96): Summary badges (Pending Action 4, Confirmed Sessions 3, Referral Petitions 2), filter tabs, and queue of `AlumniInquiryCard` items.
   - Right Detail Pane (flex-1): Student candidate dossier, session confirmed alert, preparation notes with attachments, and alumni response composer.

### Phase 3: Candidate Dossier & Response Composer
1. Build `CandidateSummaryHeader`:
   - Student avatar, name, readiness tag (88.4% Tier-1 Ready), CGPA, target role, and "Launch T1 Video Room" CTA button.
2. Build `SessionConfirmedAlert`:
   - Display appointment time, duration (45 Mins), sandbox runtime, and verified status pill.
3. Build `StudentPreparationNotes`:
   - Display student's agenda message and attached artifacts (`payment_cache_topology.pdf`, `k6_stress_benchmark.csv`).
4. Build `AlumniResponseComposer`:
   - Quick preset tag buttons: clicking `+ Reviewed your k6 benchmark` appends text to `replyText`.
   - Markdown editor textarea.
   - "Pre-Screen Passed: Candidate meets TechCorp hiring bar (>80% threshold)" checkbox.
   - Action buttons: "Reschedule Slot", "Forward to Co-Mentor", "Send Message & Join Video Room".

### Phase 4: Sending Message & Launching Video Room
1. Implement `handleSendMessage()`:
   - Validate non-empty `replyText`.
   - Set `isSubmitting = true`.
   - Dispatch `POST /api/guidance/:id/reply` with `{ answerText: replyText, preScreenPassed: preScreenPassed }`.
   - On success, update local inquiry status and trigger video room launch if "Join Video Room" clicked.
   - Set `isSubmitting = false`.

### Phase 5: Verification & Routing Registration
1. Add `<Route path="/alumni/mentorship-inbox" element={<AlumniMentorshipInboxPage />} />` in `src/App.jsx`.
2. Test responsive collapse between queue and detail on mobile devices.
