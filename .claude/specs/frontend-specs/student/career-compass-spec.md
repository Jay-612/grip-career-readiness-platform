# Screen Specification: Student Career Compass & Strategic Pathways

## 1. Visual Inspection & Screenshot
- **Screenshot Path**: `.claude/images/stitch/Student/career-compass/career_compass_screen.png`
- **Visual Description**: Career roadmap navigation and strategic pathway explorer. Hero banner features dark blue gradient with compass icon watermark, headline "Career Compass & Strategic Pathways", subtitle detailing AI-assisted industry benchmarks, primary target tag ("Distributed Systems & Cloud Backend Engineer" - 85% Feasibility Match), secondary target tag ("Full-Stack Product Engineering" - 82% Match), and target partner hiring companies logos (TechCorp, FinTech Apex, DataScale AI). Below are 3 Recommended Career Path cards: Primary Track (Distributed Systems & Cloud Engineer, 85% Match, CTC 18-28 LPA, Required Skills, Market Benchmarks, "Manage Roadmap (Active)" button), Alternative Trajectory (Full-Stack Product Engineer, 82% Match, CTC 14-22 LPA, "Set as Secondary Target"), and Emerging Track (DevOps & SRE, 75% Match, CTC 12-18 LPA, "Explore Track Requirements"). Middle section displays the End-to-End Placement Roadmap milestone timeline across semesters (Sem 3 Core CS, Sem 4 Web Arch, Sem 5 Distributed Caching [Current Sprint], Sem 6 Capstone, Sem 7-8 Campus Drives). Below are two split cards: "Bridge the 12% Gap to 100% TechCorp Alignment" with missing skill items (Kafka Event Streaming, gRPC, Kubernetes CI), and "Faculty & Alumni Guidance" matching specific mentors (Prof. Neha Sharma, Alumni Mentor Amit Verma). Bottom displays a Multi-track Comparison Matrix comparing CTC, Technical Focus, Industry Weighting, and Readiness.

## 2. Intended User Role
- `student` (also accessible by `faculty` advisors to review student trajectories).

## 3. Backend Architecture Inspection
- **Routes**:
  - `backend/routes/careerRoutes.js`
  - `backend/routes/userRoutes.js`
  - `backend/routes/placementRoutes.js`
  - `backend/routes/mentorRoutes.js`
- **Controllers**:
  - `backend/controllers/careerController.js` (`getRoadmapById`, `submitCareerQuiz`)
  - `backend/controllers/userController.js` (`getProfile`, `updateProfile`)
  - `backend/controllers/placementController.js` (`getCompanyMatch`)
  - `backend/controllers/guidanceController.js` (`getMentorRecommendations`)
- **Models**: `CareerRoadmap.js`, `StudentProfile.js`, `User.js`, `Company.js`

## 4. Exact API Endpoints Mapped
- `GET /api/users/profile` — Retrieves student's current `selectedCareer` and profile.
- `GET /api/career/roadmap/:careerId` — Retrieves detailed semester roadmap milestones and skill requirements for selected career.
- `POST /api/career/quiz` — Submits quiz responses to generate or update career recommendations.
- `PUT /api/users/profile` — Updates student's target career pathway (`selectedCareer`).
- `GET /api/placement/company-match/:studentId` — Retrieves company hiring benchmark alignments for this student.
- `GET /api/mentors/recommendation` — Retrieves recommended faculty and alumni mentors aligned with this career track.

## 5. Required HTTP Operations
- `GET`: Loads roadmap steps, career options, gap analysis, and mentor recommendations.
- `POST`: Submits career assessment quiz.
- `PUT`: Updates student's selected target career track.

## 6. Reusable Components
- `StudentSidebar`: Standard student navigation sidebar.
- `PortalTopBar`: Top header with search and export shortcuts.
- `CareerTrackCard`: Card with match score, salary range, skill chips, and selection CTA.
- `RoadmapTimeline`: Node-based milestone timeline showing semester-by-semester objectives.
- `MentorCard`: Mentor preview card with photo, company, and booking button.
- `ComparisonTable`: Multi-column comparison matrix table.

## 7. Page-Specific Components
- `CareerCompassHero`: Deep gradient banner highlighting primary and secondary tracks.
- `SkillGapClosureCard`: Gap analysis card highlighting missing competencies for Day-1 readiness.
- `TrackComparisonMatrix`: Detailed parameter comparison between target roles.

## 8. Loading States
- Shimmer skeleton loaders for career cards and roadmap timeline while loading data.
- Button spinners during career selection update (`PUT /api/users/profile`).

## 9. Error States
- Banner error if roadmap fetch fails (`/api/career/roadmap/:careerId`).
- Fallback message if no matching mentors are returned for the selected track.

## 10. Empty States
- "No career roadmap selected yet" prompting user to complete career quiz.

## 11. Form Validation Requirements
- Career selection requires valid track ID.
- Quiz submission requires answering all mandatory diagnostic questions.

## 12. RBAC Restrictions
- Restricted to role `student` (own pathways) and `faculty`/`admin` (advisor review).

## 13. Routing Path
- `/student/career-compass`

## 14. Responsive Behavior
- **Desktop (>= 1024px)**: 3-card career track grid; horizontal roadmap timeline; full comparison table.
- **Tablet (768px - 1023px)**: 2-column or stacked career cards; roadmap timeline becomes vertical; comparison table horizontally scrollable.
- **Mobile (< 768px)**: 1-column card stack; vertical timeline with condensed milestone badges.
