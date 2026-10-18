# Implementation Plan: Recruiter Company Profile & Hiring Bar Manager

## 1. Goal
Construct `CompanyProfilePage.jsx` based on `.claude/specs/frontend-specs/recruiter/company-profile-spec.md` and screenshot `.claude/images/stitch/Recruiter/company-profile/company_profile_screen.png`.

## 2. Technical Prerequisites & Dependencies
- Base rulebook: `.claude/specs/frontend-specs/frontend-ui-generic-spec.md`
- Base plan: `.claude/plans/frontend-plans/frontend-ui-generic-plan.md`
- Centralized Axios client: `src/services/apiClient.js`
- Layout components: `RecruiterSidebar`, `PortalTopBar`

## 3. Phased Implementation Steps

### Phase 1: State Setup & Initial Data Fetching
1. Create `src/pages/Recruiter/CompanyProfilePage.jsx`.
2. Define states:
   - `companyForm`:
     ```javascript
     {
       name: 'TechCorp Global',
       tagline: 'Building next-generation hyperscale cloud infrastructure and real-time distributed platforms for 200M+ global enterprise users.',
       hubs: ['Bangalore', 'Seattle', 'Zurich'],
       rating: 4.8,
       alumniCount: 48,
       culture: ['Extreme Ownership', 'Extreme Rigor & Scalability', 'Zero-Ego Code Reviews', 'Rapid Production Impact'],
       roles: [
         {
           title: 'Software Development Engineer - 1',
           team: 'Cloud Platform Engineering',
           ctc: '24 - 28 LPA',
           tier: 'Super Dream Tier',
           base: '18.5 LPA',
           bonus: '3.0 LPA',
           stocks: '20 Lakhs over 4 years',
           openings: 10,
           minCgpa: 8.0,
           eligibleDepts: ['CSE', 'ISE', 'ECE'],
           mandateSkills: ['Operating Systems', 'Distributed Systems Architecture', 'Multi-threading & Concurrency']
         }
       ],
       weights: {
         distributedSystems: 30,
         dsa: 25,
         databaseAcid: 20,
         lld: 15,
         starBehavioral: 10
       },
       atsTriggers: {
         autoShortlist: true,
         requireFacultyEndorsement: true,
         bidirectionalSync: true,
         notifyAlumni: true
       }
     }
     ```
   - `isSaving`: Boolean (`false`).
   - `isLoading`: Boolean (`true`).
   - `error`: String (`null`).
3. In `useEffect`, invoke `GET /api/users/profile` to get linked company details, then set `isLoading = false`.

### Phase 2: Company Brand Card & Culture Tags
1. Build `CompanyBrandCard`:
   - Logo, name, Super Dream Partner badge, tagline, and action buttons ("Edit Brand Assets", "Share Campus Link").
   - Metric pills: Hubs, Rating, Roles, Campus Alumni Employed.
   - Engineering culture tag chips.

### Phase 3: Active Campus Roles & Selection Funnel
1. Build `CampusRolesList`:
   - Role cards with CTC breakdown (Base, Bonus, Stocks, Openings).
   - Eligibility cutoffs (Min CGPA, Eligible Departments, Mandate Skills).
   - Pre-qualified candidates link ("32 Candidates pre-qualified in GRIP Talent Bench").
   - "+ Add Target Role" button.
2. Build `SelectionFunnel`:
   - 4 assessment stages: Online Proctored OA (90m), Tech Interview 1 DSA (60m), Tech Interview 2 LLD (60m), Bar-Raiser (45m).

### Phase 4: Right Sidebar (Hiring Bar Weights & ATS Triggers)
1. Build `HiringBarWeightsCard`:
   - Progress bars for each competency weight (Total 100%).
   - Fast-track policy callout.
2. Build `AutomatedATSTriggersCard`:
   - Checkboxes for auto-shortlist, faculty endorsement, Workday bidirectional sync, and alumni notification.
3. Build `CampusLiaisonsCard`:
   - Contacts for alumni lead (Vikram Singhania) and faculty placement lead (Prof. Neha Sharma).

### Phase 5: Saving Profile & API Integration
1. Implement `handleSaveProfile()`:
   - Validate that sum of weights equals 100%.
   - Set `isSaving = true`.
   - Dispatch `POST /api/companies` with `companyForm` payload.
   - On success, display success toast notification.
   - Set `isSaving = false`.

### Phase 6: Verification & Routing Registration
1. Add `<Route path="/recruiter/company-profile" element={<CompanyProfilePage />} />` in `src/App.jsx`.
2. Test updating hiring weights and roles.
