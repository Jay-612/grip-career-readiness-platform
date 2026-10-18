# Implementation Plan: Faculty Guidance Inbox & Advising Queue

## 1. Goal
Construct `GuidanceInboxPage.jsx` conforming to `.claude/specs/frontend-specs/faculty/guidance-inbox-spec.md` and screenshot `.claude/images/stitch/Faculty/guidance-inbox/guidance_inbox_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Axios client: `src/services/apiClient.js`
- Layout components: `FacultySidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Faculty/GuidanceInboxPage.jsx`.
2. Define states:
   - `requestsList`: Array of student guidance requests.
   - `selectedRequestId`: String / ObjectId (default to first request).
   - `selectedRequestDetail`: Object containing full query, student details, code snippet, and replies.
   - `replyText`: String (`''`).
   - `isEndorsed`: Boolean (`true`).
   - `ticketOutcome`: String (`'resolved'`).
   - `filter`: String (`'all'`).
   - `isSubmitting`: Boolean (`false`).
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`, invoke `GET /api/guidance/requests` to load requests queue.
   - If requests exist, auto-select first request and call `GET /api/guidance/requests/:id`.
   - Set `isLoading = false`.

### Phase 2: Master-Detail Layout Scaffolding
1. Wrap page with `FacultySidebar` and `PortalTopBar`.
2. Create 2-pane split view:
   - Left Pane (w-96): Header badges, urgency filter pills, list of `GuidanceRequestCard` items.
   - Right Pane (flex-1): Student dossier summary, full question with syntax code block, and reply composer.

### Phase 3: Interactive Composer & Presets
1. Build `StudentDossierHeader`:
   - Display candidate photo, name, CGPA, target companies, and "Launch Instant Video Meeting" button.
2. Build `QueryContentViewer`:
   - Display topic, timestamp, query description, and `CodeViewer` block (`payment_service.go`).
3. Build `FacultyResponseComposer`:
   - Quick architectural preset buttons: clicking `+ Suggest Single-Flight Pattern` appends text into `replyText`.
   - Markdown editor textarea with formatting tools.
   - Checkbox: "Endorse Solution Architecture as Production-Ready".
   - Ticket outcome radio group (`Mark as Resolved`, `Request Code Re-submission`, `Schedule 1-on-1 Sync`).
   - Action buttons: "Save Draft", "Send Guidance & Endorse Ticket".

### Phase 4: Submitting Replies & Optimistic Update
1. Implement `handleSendReply()`:
   - Validate non-empty `replyText`.
   - Set `isSubmitting = true`.
   - Dispatch `POST /api/guidance/:id/reply` with `{ answerText: replyText, outcome: ticketOutcome, endorsed: isEndorsed }`.
   - On success:
     - Update local request status in `requestsList`.
     - Reset `replyText` and show confirmation toast.
   - Set `isSubmitting = false`.

### Phase 5: Verification & Routing Registration
1. Add `<Route path="/faculty/guidance-inbox" element={<GuidanceInboxPage />} />` in `src/App.jsx`.
2. Test responsive layout toggle between master list and detail pane on mobile screens.
