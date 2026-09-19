# Screen Specification: Faculty Guidance Inbox & Advising Queue

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Faculty/guidance-inbox/guidance_inbox_screen.png`
- **Visual Description**: Split-pane master-detail guidance triage and architectural review workspace. Header displays "Guidance Inbox & Student Advising Queue", subtitle ("14 active requests requiring technical review, 11 mentorship guidance, 4 placement sign-off"), session tag, badges: Unresolved (7), Avg Wait: 1.4h, Code Reviews (4), Placement Critical (2), filter pills (All Requests 14, Unread 7, High Urgency 3, Code Reviews 4, Mentorship Bookings), "Batch Endorse" button, and "Schedule Open Q&A Session" button. Left pane displays inquiry queue (filtered by Section CSE A & B, sorted by urgency) with student cards (Card 1: Rohan Mehta, "Critical: Drive in 4 days", "Code & Architecture Review", "Redis Cache Invalidation & Race Condition...", "Needs Faculty Sign-off"; Card 2: Ananya Iyer; Card 3: Vikramaditya Rao; Card 4: Pooja Hegde). Right detail pane displays selected student dossier (Rohan Mehta, 88.4% Placement Ready, Tier-1 Approved, Final Year CSE-A, CGPA 9.24/10, Target: TechCorp, Stripe, AWS, buttons: "View Full Student Profile", "Past Interview Rubrics", "Launch Instant Video Meeting"), detailed query text ("Redis Cache Invalidation & Race Condition in Payment Microservice"), syntax-highlighted code viewer (`payment_service.go`, Live K6/2 View Window), attached diagnostic artifacts (`k6_benchmark_results.csv`, `architecture_v2.pdf`), and the Faculty Guidance & Placement Endorsement response composer with quick architectural preset tags (`+ Suggest Single-Flight Pattern`, `+ Recommend Fencing Tokens`, `+ Suggest CDC via Debezium`), markdown editor, "Endorse Solution Architecture as Production-Ready" checkbox, ticket outcome radio (`Mark as Resolved`, `Request Code Re-submission`, `Schedule 1-on-1 Sync`), and action buttons ("Save Draft", "Forward to Co-Faculty / TA", "Send Guidance & Endorse Ticket" [Ctrl+Enter]).

## 2. Intended User Role
- `faculty` (and `admin`).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/guidanceRoutes.js`
  - `backend/routes/userRoutes.js`
  - `backend/routes/placementRoutes.js`
- **Controllers**:
  - `backend/controllers/guidanceController.js` (`getGuidanceRequests`, `getGuidanceRequestById`, `replyGuidanceRequest`, `updateGuidanceReply`)
  - `backend/controllers/userController.js` (`getUserById`)
  - `backend/controllers/placementController.js` (`getPlacementReadiness`)
- **Models**: `GuidanceRequest.js`, `GuidanceReply.js`, `User.js`, `StudentProfile.js`

## 4. Exact API Endpoints Mapped
- `GET /api/guidance/requests` — Retrieves list of guidance requests directed to faculty.
- `GET /api/guidance/requests/:id` — Retrieves specific guidance query with thread replies and attachments.
- `POST /api/guidance/:id/reply` — Submits faculty advice and endorsement response.
- `PUT /api/guidance/reply/:id` — Updates an existing faculty reply.
- `GET /api/users/:id` — Retrieves student's academic profile and readiness score.

## 5. Required HTTP Operations
- `GET`: Fetches incoming guidance queries, student profile details, and discussion attachments.
- `POST`: Dispatches faculty advice and ticket outcome.
- `PUT`: Updates existing reply or saves draft.

## 6. Reusable Components
- `FacultySidebar`: Persistent role navigation.
- `PortalTopBar`: Search and office hours status indicator.
- `FilterTabs`: Urgency and category filter pills.
- `CodeViewer`: Syntax-highlighted code viewer box.
- `MarkdownEditor`: Rich editor with bold, italic, code, and list formatting controls.
- `Badge`: Status badges (Critical, Medium Urgency, Resolved).
- `PrimaryButton`: "Send Guidance & Endorse Ticket" action button.

## 7. Page-Specific Components
- `GuidanceRequestCard`: Master-list card showing student name, urgency tag, and topic snippet.
- `StudentDossierHeader`: Right-pane candidate summary with CGPA and profile links.
- `QuickArchitecturalPresets`: Tag strip allowing one-click insertion of common recommendations.
- `PlacementEndorsementBox`: Checkbox panel certifying student's architecture as production-ready.

## 8. Loading States
- Left-pane list shows skeleton items while queries load.
- Right pane displays loading overlay when switching active requests.
- Submit button shows spinner during `POST /api/guidance/:id/reply`.

## 9. Error States
- Error banner in detail pane if request fetching fails.
- Validation warning if reply text is empty upon submission attempt.

## 10. Empty States
- "No unanswered guidance requests in queue" with celebratory checkmark when all requests are resolved.

## 11. Form Validation Requirements
- Response Text: Required, min 10 characters.
- Ticket outcome state must be selected (`Mark as Resolved`, `Request Code Re-submission`, `Schedule 1-on-1 Sync`).

## 12. RBAC Restrictions
- Restricted to users with role `faculty` or `admin`.

## 13. Routing Path
- `/faculty/guidance-inbox`

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: Split-pane layout (Left list 380px, Right detail pane flex-1).
- **Tablet (768px - 1279px)**: Split pane with collapsible list or tab view between List and Detail.
- **Mobile (< 768px)**: Master-detail navigation (Viewing detail replaces list with a "< Back to Inbox" button).
