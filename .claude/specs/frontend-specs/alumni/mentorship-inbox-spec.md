# Screen Specification: Alumni Mentorship Inbox & Advising Queue

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Alumni/mentorship-inbox/mentorship_inbox_screen.png`
- **Visual Description**: Dual-pane master-detail triage inbox for student mock interview bookings, technical system design inquiries, and referral petitions. Top header displays "Mentorship Inbox & Student Advising Queue", subtitle ("Triage 1:1 mock interview bookings, technical system design inquiries, and TechCorp referral petitions."), status indicator ("Accepting Mentees [2 Slots]"), "Set Office Hours" button, and summary badges: Pending Action (4), Confirmed Sessions (3), Referral Petitions (2), Avg Turnaround (2.4h). Filter tabs include: All Inquiries (8), Unread (4), 1:1 Mock Bookings (3), Referral Petitions (2), Async Q&A (3), Archived / Completed (24). Left master queue pane displays active items (sorted by urgency & priority):
  - Card 1: Rohan Mehta (Today 6:30 PM, 1:1 Mock Interview, "TechCorp SDE-1 Mock: Distributed Caching & Partitioning", Confirmed & Ready to Launch).
  - Card 2: Ananya Iyer (Referral Petition, "Internal Referral Request for TechCorp SDE-1 Campus Drive").
  - Card 3: Sahil Sharma (Async Technical Q&A, "Kubernetes hands-on expectations for entry-level SDE").
  - Card 4: Vikramaditya Rao (Career Mentorship, "Transitioning from Competitive Programming to Production").
Right detail pane shows candidate dossier for Rohan Mehta (88.4% Tier-1 Ready, CGPA 9.24/10, Target: TechCorp SDE-1 Cloud Team, Faculty Endorsement 4.95/5.0 by Prof. Neha Sharma, "Launch T1 Video Room" primary CTA button, "View Candidate Full Dossier", "View Past Interview Rubric", "Mock History [3 Sessions]"), Session Confirmed alert box (Today 6:30 PM - 7:15 PM, 45 Mins, In-Platform Video & Collaborative Code Sandbox, Slot Verified), Student Preparation Notes & Discussion Agenda with attached files (`payment_cache_topology.pdf`, `k6_stress_benchmark.csv`), and Alumni Response & Pre-Session Instructions composer with quick presets (`+ Session confirmed! Join room 5 mins early`, `+ Reviewed your k6 benchmark — impressive numbers`), markdown editor, "Pre-Screen Passed: Candidate meets TechCorp hiring bar" checkbox, and action buttons ("Reschedule Slot", "Forward to Co-Mentor", "Send Message & Join Video Room" [Ctrl+Enter]).

## 2. Intended User Role
- `alumni` (and accredited industry mentors).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/guidanceRoutes.js`
  - `backend/routes/appointmentRoutes.js`
  - `backend/routes/userRoutes.js`
  - `backend/routes/placementRoutes.js`
- **Controllers**:
  - `backend/controllers/guidanceController.js` (`getGuidanceRequests`, `getGuidanceRequestById`, `replyGuidanceRequest`)
  - `backend/controllers/interviewController.js` (`getAppointments`)
  - `backend/controllers/userController.js` (`getUserById`)
  - `backend/controllers/placementController.js` (`getPlacementReadiness`)
- **Models**: `GuidanceRequest.js`, `GuidanceReply.js`, `MockInterview.js`, `User.js`, `StudentProfile.js`

## 4. Exact API Endpoints Mapped
- `GET /api/guidance/requests` — Retrieves student guidance inquiries and referral petitions directed to alumni.
- `GET /api/appointments` — Retrieves scheduled 1-on-1 mock interviews and sync slots.
- `POST /api/guidance/:id/reply` — Submits alumni response, pre-session advice, or referral endorsement.
- `GET /api/users/:id` — Retrieves student candidate's verified profile, CGPA, and faculty endorsements.
- `GET /api/placement/readiness/:studentId` — Retrieves student readiness score to verify company hiring bar threshold.

## 5. Required HTTP Operations
- `GET`: Loads incoming inquiries, confirmed interview appointments, and student candidate dossiers.
- `POST`: Submits pre-session instructions, guidance replies, or referral recommendations.

## 6. Reusable Components
- `AlumniSidebar`: Persistent alumni navigation with unread badge count.
- `PortalTopBar`: Top bar with search input and office hours settings.
- `FilterTabs`: Category filter tabs.
- `Badge`: Status and priority chips (Confirmed, Referral Petition, Async Q&A).
- `PrimaryButton`: "Launch T1 Video Room" and "Send Message & Join Video Room".
- `MarkdownEditor`: Formatting controls for pre-session instructions.

## 7. Page-Specific Components
- `AlumniInquiryCard`: Master queue item displaying student name, category, urgency, and preview snippet.
- `CandidateSummaryHeader`: Right-pane dossier header with readiness gauge, CGPA, and profile links.
- `ConfirmedSessionAlert`: High-contrast confirmation card with video sandbox details.
- `PreScreenEndorsementCheckbox`: Checkbox certifying student meets company hiring bar.

## 8. Loading States
- Shimmer skeletons in left queue and right detail pane while loading.
- Video room launcher shows spinner and connection text.

## 9. Error States
- Banner error if inbox fetching fails.
- Validation warning if message response is empty.

## 10. Empty States
- "No pending inquiries in queue" with celebratory checkmark when all items are addressed.

## 11. Form Validation Requirements
- Response message requires non-empty string.
- Candidate ID and request ID must be valid ObjectIds.

## 12. RBAC Restrictions
- Protected by `protect` and `authorize('alumni', 'admin')`.

## 13. Routing Path
- `/alumni/mentorship-inbox`

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: 2-pane split view (Left queue 380px, Right detail pane flex-1).
- **Tablet (768px - 1279px)**: Split view with collapsible list or tab toggling.
- **Mobile (< 768px)**: Master-detail view (detail view occupies full screen with back button).
