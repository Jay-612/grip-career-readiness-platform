## `.claude/plans/frontend-init-plan.md`

**Phase 1: Environment Setup**

1. Verify the current working directory is the project root (`grip-career-readiness-platform`).
2. Navigate into the `frontend/` directory.
3. Create a file named `.env` in the root of the `frontend/` directory and populate it with the API base URL variable.

**Phase 2: API Client Implementation**
4. Navigate to `frontend/src/services/`.
5. Create a file named `apiClient.js`.
6. Implement and export the configured Axios instance with the JWT request interceptor.

**Phase 3: Core Routing Implementation**
7. Navigate to `frontend/src/`.
8. Create (or overwrite existing) `App.jsx`.
9. Implement the React Router DOM setup, defining the distinct route groups for Public, Auth, Student, Faculty, Alumni, and Recruiter paths using simple inline JSX placeholders.

**Phase 4: Application Entry Point**
10. Ensure you are still in `frontend/src/`.
11. Create (or overwrite existing) `main.jsx`.
12. Implement the standard Vite React root rendering logic, importing `App.jsx` and targeting the `root` element.

---

**Next Step:** Once you save these two files in your `.claude/` directory, let me know, and I will give you the exact Agentic Prompt to execute this plan.