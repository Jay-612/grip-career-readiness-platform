# Faculty Guidance Inbox Cleanup & 403 Resolution Report

## Root Cause of 403

The audit previously flagged a `403 Forbidden` error on `GET /api/guidance/requests/<id>` (specifically targeting request ID `6abf2785a161cd1690727ae6`).

Our deep-dive investigation identified two contributing factors that converged into the issue:

1. **Frontend Pre-Validation Absence & Unchecked Auto-Fetch:**
   - In [`GuidanceInboxPage.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/pages/Faculty/GuidanceInboxPage.jsx), the component initialized state with `const [selectedRequestId, setSelectedRequestId] = useState(routeRequestId || null)` and immediately fired `fetchSelectedDetail(selectedRequestId)` on initial render inside a `useEffect` hook.
   - It dispatched this `GET /api/guidance/requests/:id` network request **in parallel** with the list fetch, before loading the list of requests that the faculty user was actually permitted to access.
   - Furthermore, when no route parameter was supplied, it automatically defaulted to `list[0].id` without verifying whether `list[0]` was targeted to faculty or alumni.

2. **Backend Query Discrepancy & Schema Default Mismatch:**
   - In [`backend/model/GuidanceRequest.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/model/GuidanceRequest.js), `targetType` was configured with `default: 'alumni'`.
   - In [`backend/controllers/guidanceController.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/controllers/guidanceController.js), the query in `getGuidanceRequests` for faculty included `{ targetType: { $exists: false } }` and `{ targetType: null }`. Legacy inquiries (such as `6abf2785a161cd1690727ae6`, an inquiry submitted to alumni mentor Vikram Aditya) lacked an explicit `targetType` field in the database.
   - MongoDB matched `{ targetType: { $exists: false } }` and returned this alumni inquiry in the faculty's list. When Mongoose instantiated the document, it applied the schema default `targetType: 'alumni'`.
   - When the frontend subsequently called `GET /api/guidance/requests/6abf2785a161cd1690727ae6`, the controller's RBAC validation in `getGuidanceRequestById`:
     ```javascript
     if (userRole === 'faculty') {
       const isTargetedFaculty = request.targetFacultyId && ... === currentUserId;
       const isLegacyOrAll = !request.targetType || request.targetType === 'all';
       if (!isTargetedFaculty && !isLegacyOrAll) {
         return res.status(403).json({ message: 'Access denied. This inquiry was routed exclusively to alumni mentors.' });
       }
     }
     ```
     correctly evaluated `request.targetType === 'alumni'`, and rejected the faculty request with `403 Forbidden`.

---

## Files Changed

1. **[`frontend/src/pages/Faculty/GuidanceInboxPage.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/pages/Faculty/GuidanceInboxPage.jsx)**:
   - Restructured into a clean, operational Guidance & Remedial Inbox.
   - Eliminated eager unvalidated fetching: `fetchRequests()` loads authorized requests first.
   - If a `routeRequestId` is present in the URL, the page validates that it exists within the accessible list before making any detail request.
   - Integrated `Approve Completion`, `Request Rework`, and `Add Comment` flows with optimistic updates and tab auto-refreshing.
   - Clean split-view for desktop (>=1024px) and full-screen drawer for mobile (<1024px).

2. **[`frontend/src/components/faculty/guidance/GuidanceHeader.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/faculty/guidance/GuidanceHeader.jsx)**:
   - Clean header with title "Guidance Inbox", subtitle "Review student remedial submissions and verify task completion.", and compact triage counter pills (`Pending`, `In Review`, `Completed`).

3. **[`frontend/src/components/faculty/guidance/GuidanceFilters.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/faculty/guidance/GuidanceFilters.jsx)**:
   - Compact status tabs (`Pending`, `In Review`, `Completed`, `All`) and search input filtering by student name, email, or task keywords.

4. **[`frontend/src/components/faculty/guidance/GuidanceRequestList.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/faculty/guidance/GuidanceRequestList.jsx)**:
   - Clean list with business-driven sorting (Pending first, oldest waiting first, then recent).
   - Single clean empty state: "No guidance requests need review."

5. **[`frontend/src/components/faculty/guidance/GuidanceRequestItem.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/faculty/guidance/GuidanceRequestItem.jsx)**:
   - Shows student avatar, name, email, plan/task title, submission date, status badge, proof indicator (`GitHub Repo`, `Code Snippet`, etc.), and `[Review]` action button.

6. **[`frontend/src/components/faculty/guidance/GuidanceDetailsDrawer.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/faculty/guidance/GuidanceDetailsDrawer.jsx)**:
   - Dedicated review drawer/panel showing student dossier, placement readiness, assigned remedial task, submission description, evidence links/code snippets, previous faculty comment history, and review actions.

7. **[`frontend/src/components/faculty/guidance/SubmissionEvidence.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/faculty/guidance/SubmissionEvidence.jsx)**:
   - Extracted clickable external repository/file links and syntax-highlighted code blocks for clean evidence inspection.

8. **[`frontend/src/components/faculty/guidance/GuidanceReviewActions.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/faculty/guidance/GuidanceReviewActions.jsx)**:
   - Action toolbar offering `Approve Completion`, `Request Rework`, and optional `Add Comment`.

9. **[`frontend/src/components/faculty/guidance/ReworkModal.jsx`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/faculty/guidance/ReworkModal.jsx)**:
   - Compact modal requiring actionable instructions/feedback before dispatching a rework status change.

10. **[`frontend/src/components/faculty/guidance/index.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/frontend/src/components/faculty/guidance/index.js)**:
    - Modular barrel export.

11. **[`backend/controllers/guidanceController.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/controllers/guidanceController.js)**:
    - Tightened `filter.$or` in `getGuidanceRequests` for faculty to strictly include `{ targetType: 'faculty', targetFacultyId: currentUserId }` and `{ targetType: 'all' }`, ensuring unauthorized alumni or other faculty inquiries are never leaked in the list.

12. **[`backend/seed/guidance.seed.js`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/backend/seed/guidance.seed.js)**:
    - Aligned seed items with explicit `targetType` and `targetFacultyId`, and added a dedicated remedial task submission test scenario.

---

## Authorization Behavior Preserved

- **Zero Permissions Weakened:** No authorization middleware was removed or bypassed.
- **Strict Faculty RBAC Intact:** In `getGuidanceRequestById`, faculty members can **only** access requests targeted specifically to their user ID or marked `all`.
- **403 Protection Fully Maintained:** When an authorized faculty user directly attempts to fetch an inquiry targeted to another faculty member or alumni, the backend reliably returns `403 Forbidden` (`Access denied. This inquiry was routed specifically to another faculty advisor` / `routed exclusively to alumni mentors`).
- **Student Ownership Preserved:** Students remain strictly restricted to viewing only their own guidance requests.

---

## Previous UX Problems

- **Overwhelming 974-line Monolith:** The old page was an oversized form packed with repetitive triage stat cards, redundant architectural macros, and competing buttons.
- **Immediate 403 Failure:** Visiting the page with an invalid or unauthorized route parameter crashed with unhandled network 403 errors.
- **Evidence Mixed with List:** Evidence and large blocks of text competed directly with the list of incoming student inquiries.
- **No Distinct Remedial Workflow:** Approving completion or requesting rework lacked clear semantics; it only allowed generic text replies without status transitions.
- **Mobile Unresponsiveness:** The desktop 4-column/8-column grid cramped mobile viewports, resulting in awkward layout squishing and horizontal scrolling.

---

## New Inbox Structure

```
/faculty/guidance
├── GuidanceHeader (Title, subtitle, compact triage counters: Pending, In Review, Completed, Refresh)
├── GuidanceFilters (Tabs: [Pending] [In Review] [Completed] [All] + Search bar)
└── Responsive Layout:
    ├── Desktop (>= 1024px): Split-View
    │   ├── Left Column (5 cols): GuidanceRequestList (Sorted: Pending -> Oldest -> Recent)
    │   └── Right Column (7 cols): GuidanceDetailsDrawer (Student dossier, evidence, comment history, actions)
    └── Mobile (< 1024px): Inbox First
        ├── Request List
        └── On [Review] click -> Full-screen Drawer with "Back to Inbox" navigation
```

---

## Review Flow

1. Faculty opens `/faculty/guidance`. The accessible request queue loads immediately without an auto-fetched unverified ID.
2. Inquiries requiring attention are prioritized at the top of the **Pending** tab.
3. Faculty clicks `[Review]` on any request.
4. The review panel/drawer opens, presenting:
   - Student avatar, name, email, and current placement readiness percentage.
   - Assigned remedial task title and original submission date.
   - Student evidence: direct links to GitHub repositories or code snippets rendered in high-contrast blocks.
   - Chronological faculty feedback history.

---

## Approve Flow

1. While reviewing a submission, faculty clicks `Approve Completion`.
2. The platform dispatches an approval response (`✓ Task Completion Approved: Student evidence and remedial solution verified...`).
3. The item status transitions from `pending` to `replied` / completed.
4. The item is removed from the active **Pending** view and placed in the **Completed** tab.
5. The triage counters (`Pending` and `Completed`) update optimistically without requiring a full page refresh.

---

## Rework Flow

1. While reviewing a submission that requires improvement, faculty clicks `Request Rework`.
2. The `ReworkModal` opens, prompting for specific instructions (e.g., *"Please attach the GitHub repository link and update the README with test instructions."*).
3. Faculty submits the modal form.
4. The platform records the rework notification in the thread (`⚠️ Rework Requested: ...`).
5. The submission transitions to `in-review`, remaining accessible under the `In Review` and `All` tabs.

---

## Error Handling

- **Unauthorized URL Routing:** When a user navigates to `/faculty/guidance/:id` where `:id` belongs to another faculty or alumni, the component detects that the ID is not in the accessible list, suppresses the outbound request, and displays:
  > **Access Restricted**
  > You do not have access to this request or it belongs to another faculty advisor.
  > `[Return to Guidance Inbox]`
- **Stale / Deleted Requests:** If an item becomes unavailable, the drawer renders:
  > **Unable to load submission**
  > This guidance request is no longer available.
  > `[Return to Guidance Inbox]`
- **Zero Unhandled Rejections:** All API calls are guarded with `try / catch` blocks and user-friendly error banners.

---

## Desktop Verification (1440 × 900)

- Page loads with **0** initial 403 errors and **0** console errors.
- Header, compact triage counters, and filter tabs render correctly.
- Split-pane workspace renders 5-column request list and 7-column review panel.
- Approve Completion, Request Rework, and Add Comment flows executed and verified.
- Screenshot: [`.claude/audit/screenshots/desktop/desktop_guidance_inbox.png`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/.claude/audit/screenshots/desktop/desktop_guidance_inbox.png)
- Detail screenshot: [`.claude/audit/screenshots/desktop/desktop_guidance_detail.png`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/.claude/audit/screenshots/desktop/desktop_guidance_detail.png)
- Rework modal screenshot: [`.claude/audit/screenshots/desktop/desktop_guidance_rework_modal.png`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/.claude/audit/screenshots/desktop/desktop_guidance_rework_modal.png)

---

## Tablet Verification (768 × 1024)

- Responsive layout cleanly adapts without side-scrolling or overlapping elements.
- Screenshot: [`.claude/audit/screenshots/tablet/tablet_guidance_inbox.png`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/.claude/audit/screenshots/tablet/tablet_guidance_inbox.png)

---

## Mobile Verification (390 × 844)

- Inbox list renders first; does not force the desktop split-view.
- Tapping `[Review]` opens the full-screen drawer detail view.
- "Back to Inbox" button smoothly returns to the list.
- Verification confirms: `scrollWidth = 390`, `clientWidth = 390` (**0 horizontal overflow**).
- Screenshots:
  - [`.claude/audit/screenshots/mobile/mobile_guidance_inbox.png`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/.claude/audit/screenshots/mobile/mobile_guidance_inbox.png)
  - [`.claude/audit/screenshots/mobile/mobile_guidance_detail.png`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/.claude/audit/screenshots/mobile/mobile_guidance_detail.png)

---

## Security Verification

Explicit testing confirmed:
1. Navigating via browser to `/faculty/guidance/6abf2e230b4181909512c577` (targeted to Prof. Neha Sharma) displays the clean "Access Restricted" view without triggering unauthorized background fetches.
2. Direct authenticated API call `GET /api/guidance/requests/6abf2e230b4181909512c577` returns `403 Forbidden` (`Access denied. This inquiry was routed specifically to another faculty advisor.`).
3. Direct authenticated API call `GET /api/guidance/requests/6abf2785a161cd1690727ae6` (alumni inquiry) returns `403 Forbidden` (`Access denied. This inquiry was routed exclusively to alumni mentors.`).
- Screenshot: [`.claude/audit/screenshots/desktop/desktop_guidance_unauthorized.png`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/.claude/audit/screenshots/desktop/desktop_guidance_unauthorized.png)

---

## Console / API Results

| Test Scenario | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- |
| Initial Page Load (`/faculty/guidance`) | 0 403 errors, status 200 | Status 200, 0 403s | **PASSED** |
| Load Accessible Requests List | Only user's inquiries | 3 inquiries returned | **PASSED** |
| Open Pending Request Review | Render student dossier & evidence | Detail drawer rendered | **PASSED** |
| Approve Completion Flow | Transition to completed | Status updated to replied | **PASSED** |
| Request Rework Flow | Open modal & submit comment | Rework notice recorded | **PASSED** |
| Add Faculty Comment | Post note to thread | Note appended to history | **PASSED** |
| Mobile Viewport Behavior | List first -> Tap Review -> Full view | Seamless navigation | **PASSED** |
| Direct API call on other faculty's ID | 403 Forbidden | 403 Forbidden | **PASSED** |
| Direct API call on alumni ID | 403 Forbidden | 403 Forbidden | **PASSED** |

---

## Remaining Problems

None on `/faculty/guidance`. The page is clean, modular, and performant, with robust RBAC protections.

---

## Recommended Next Phase

According to the master plan in [`.claude/plans/full-ui-ux-audit.md`](file:///c:/Users/Lenovo/Desktop/grip-career-readiness-platform/.claude/plans/full-ui-ux-audit.md), the next suggested phase is:
**Phase 9: Recruiter Dashboard & Candidate Pipeline Optimization** (`/recruiter/dashboard` or `/recruiter/candidates`).
