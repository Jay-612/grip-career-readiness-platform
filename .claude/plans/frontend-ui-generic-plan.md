**Phase 1: Visual Analysis & Component Initialization**
1. Analyze the specific reference image provided from `.claude/images/` to break down the UI into logical containers (headers, grids, data cards, forms).
2. Identify the target screen name, its intended user role (Student, Faculty, Alumni, Recruiter), and the exact backend API endpoints it needs to communicate with.
3. Generate the file structure for the component using ES6 arrow function syntax.
4. Import `useState`, `useEffect`, and `apiClient` from `../../services/apiClient`.
5. Declare required state variables (`isLoading`, `error`, `data`/specific entities).

**Phase 2: API Integration & Logic**
6. Implement async helper functions inside or outside `useEffect` to handle GET requests for initial data.
   * Wrap API calls in `try...catch` blocks.
   * Update `data`, `error`, and `isLoading` states appropriately.
7. Implement async handler functions for user interactions (POST, PUT, DELETE) required by the widgets shown in the reference image.

**Phase 3: UI Scaffolding & Layout**
8. Build the main JSX return block.
9. Implement conditional rendering for `isLoading` and `error` states.
10. Construct the semantic HTML layout (``, `