**Project Context & Objective**
1. **Goal:** Build a robust, responsive, and visually exact React functional component for a specific UI screen within the GRIP Career Readiness Platform.
2. **Visual Source of Truth:** The component UI must accurately replicate the design, layout, color scheme, and typography of the provided reference image located in `.claude/images/`.
3. **Architecture Standard:** Strictly utilize React Hooks (`useState`, `useEffect`) and modular component structures.
4. **API Integration:** All HTTP requests must exclusively use the centralized Axios instance exported from `src/services/apiClient.js`. Never use native `fetch()` or a local `axios` import.

**State Management & Lifecycle**
5. **Required States:** Every data-fetching component must manage three core states:
   * `data` (initialized to `null`, `[]`, or appropriate default).
   * `isLoading` (initialized to `true` if fetching on mount, otherwise `false`).
   * `error` (initialized to `null`, capturing API error messages).
6. **Lifecycle:** Initial data fetching must occur inside a `useEffect` hook with a properly defined dependency array to prevent infinite rendering loops.

**UI/UX & Design System**
7. **Visual Translation:** Translate the provided reference image into highly accurate CSS (or Tailwind CSS). Match the specific spacing, widget structures, glassmorphism effects, shadows, and corner radii shown in the image.
8. **Responsiveness:** The layout must adapt the visual design gracefully across mobile, tablet, and desktop viewports using CSS Flexbox/Grid.
9. **Feedback Mechanisms (If absent from image):** 
   * Render a loading state (spinner/skeleton) matching the image's aesthetic when `isLoading` is true.
   * Render a stylized error message box if `error` is populated.

**Security & RBAC Enforcement**
10. Assume routing protection is handled by `ProtectedRoute.jsx`. Ensure the rendered UI only exposes actions (like forms or delete buttons) that the user's role is authorized to perform based on backend constraints.