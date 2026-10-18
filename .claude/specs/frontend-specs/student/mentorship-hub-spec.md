# Screen Specification: Student Mentorship & Q&A Hub

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Student/mentorship-hub/mentorship_hub_screen.png`
- **Visual Description**: Collaborative advisory and technical Q&A portal. Top title area displays "Faculty Mentorship & Alumni Advisory Hub", "Institutional Verified" badge, descriptive copy, and a live presence pill ("14 Mentors Online Today"), search bar for mentors, "+ Book 1-on-1 Mentorship", and "+ Ask Question / Post Doubt" primary action buttons. Top metric tiles show: Completed Sessions (6, +2 this month), Upcoming Syncs (2 Active), Faculty Endorsements (4 Verified), and Avg Mentor Rating (4.9 / 5.0 with 5-star rating). Section 1 displays Upcoming Confirmed Mentorship Sessions (Card 1: 1-on-1 System Design Architecture Review with Prof. Neha Sharma, in-person at Dept Seminar Lab 3, "View Session Prep Sheet"; Card 2: Alumni Mock DSA & Placement Strategy Sync with Amit Verma, virtual via Google Meet, "Join Video Room" button). Section 2 displays Institutional Mentors & Alumni Directory with filter pills (All Mentors 52, Faculty Advisors, Industry Alumni, Placement Officers, Cloud/AI Systems) and mentor cards showing name, role, department, ratings, specialties, and CTAs ("Book Office Hours", "Request Mock Screen", "Request Review"). Section 3 displays Institutional Technical Q&A Board with filter tags (All Discussions, System Design, DSA, Placement Policies, Capstone Projects) and threaded discussion cards featuring student question, verified faculty/alumni responses, upvote counters, and thread link.

## 2. Intended User Role
- `student` (with corresponding inbox interfaces for `faculty` and `alumni`).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/guidanceRoutes.js`
  - `backend/routes/mentorRoutes.js`
  - `backend/routes/appointmentRoutes.js`
  - `backend/routes/alumniRoutes.js`
- **Controllers**:
  - `backend/controllers/guidanceController.js` (`createGuidanceRequest`, `getGuidanceRequests`, `getMentorRecommendations`)
  - `backend/controllers/interviewController.js` (`getAppointments`, `scheduleMockInterview`)
  - `backend/controllers/alumniController.js` (`getAllAlumni`)
- **Models**: `GuidanceRequest.js`, `GuidanceReply.js`, `MockInterview.js`, `FacultyProfile.js`, `AlumniProfile.js`, `User.js`

## 4. Exact API Endpoints Mapped
- `GET /api/guidance/requests` — Retrieves student's submitted guidance queries and peer technical discussion threads.
- `POST /api/guidance/request` — Submits a new guidance query or Q&A thread.
- `GET /api/mentors/recommendation` — Retrieves recommended faculty advisors and alumni mentors.
- `GET /api/alumni` — Retrieves list of registered alumni mentors and current employers.
- `GET /api/appointments` — Retrieves student's confirmed upcoming mentorship sessions and mock interviews.
- `POST /api/appointments` — Books a 1-on-1 mentorship session or mock interview with a mentor.

## 5. Required HTTP Operations
- `GET`: Fetches discussion threads, mentor directories, and confirmed appointments.
- `POST`: Submits questions/doubts and books new mentorship syncs.

## 6. Reusable Components
- `StudentSidebar`: Persistent role navigation.
- `PortalTopBar`: Top header bar with quick search.
- `MetricSummaryCard`: Top session summary tiles.
- `FilterTabs`: Category filter tabs.
- `MentorCard`: Profile card with photo, company, rating, and booking button.
- `DiscussionThreadCard`: Card with question title, author, verified mentor answer box, upvotes, and replies count.
- `PrimaryButton`: Styled action buttons.

## 7. Page-Specific Components
- `ConfirmedSessionCard`: Card showing time, mentor, room/virtual link, and action button.
- `AskQuestionModal`: Modal dialog for composing and submitting questions.
- `BookMentorshipModal`: Modal dialog for selecting date, time slot, and topic for 1-on-1 sync.

## 8. Loading States
- Shimmer skeletons for mentor cards and discussion cards while loading.
- Submitting question or booking session displays button spinner.

## 9. Error States
- Error alert banner if discussion feed or mentor recommendations fail to load.
- Validation warning if question submission has empty body.

## 10. Empty States
- "No upcoming confirmed sessions" with "Browse Mentors" prompt when appointments array is empty.
- "No queries found under this topic" with "+ Ask Question" CTA when filter yields zero results.

## 11. Form Validation Requirements
- Question Title / Query: Required, min 10 characters.
- Category: Required (System Design, DSA, Placement Policies, Capstone).
- Target Mentor (optional): Valid mentor ID.
- Booking Slot: Date and valid time slot required.

## 12. RBAC Restrictions
- Authenticated `student` role has permission to create requests and book appointments.

## 13. Routing Path
- `/student/mentorship`

## 14. Responsive Behavior
- **Desktop (>= 1280px)**: 2-column grid for confirmed sessions; 4-card grid for mentor directory; full Q&A cards.
- **Tablet (768px - 1279px)**: 2-column grid for mentors; stacked confirmed sessions.
- **Mobile (< 768px)**: 1-column layout; filter pills horizontally scrollable.
