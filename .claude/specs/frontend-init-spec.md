## `.claude/specs/frontend-init-spec.md`

**Project Context & Objective**

1. **Goal:** Establish the core frontend architecture, routing hub, and backend communication bridge for the GRIP MERN stack project.
2. **Environment:** React initialized with Vite, using `react-router-dom` (v6) for navigation and `axios` for HTTP requests.
3. **Architecture:** The application relies heavily on Role-Based Access Control (RBAC). The frontend routing must be partitioned by roles (Student, Faculty, Alumni, Recruiter).

**File Specifications**
4. **Environment (`frontend/.env`):**

* Must define `VITE_API_BASE_URL` pointing to `http://localhost:3000/api`.

5. **API Client (`frontend/src/services/apiClient.js`):**
* Must export an Axios instance configured with the `baseURL` from the environment variables.
* Must include a request interceptor that retrieves the JWT from `localStorage` (key: `token`) and attaches it as a `Bearer` token to the `Authorization` header.


6. **Routing Hub (`frontend/src/App.jsx`):**
* Must import `BrowserRouter`, `Routes`, and `Route` from `react-router-dom`.
* Must define the base routing structure with placeholder components (e.g., `



Student Dashboard

`) for the main RBAC paths: `/`, `/login`, `/register`, `/student/*`, `/faculty/*`, `/alumni/*`, and `/recruiter/*`. 7. **Entry Point (`frontend/src/main.jsx`):

* Must import `React`, `ReactDOM/client`, and `App.jsx`.
* Must render the `component wrapped in` into the root DOM node.

---

