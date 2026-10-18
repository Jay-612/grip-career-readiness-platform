---
name: grip-dashboard-implementation
description: Workflow and layout standards for converting Stitch HTML prototypes and reference designs into production React dashboards on the GRIP Campus platform.
---

# GRIP Campus Dashboard Implementation Guide

Use this skill when implementing, refactoring, or reviewing role-specific dashboards (Student, Faculty, Alumni, Recruiter) based on Stitch screen prototypes or HTML reference files.

---

## 1. Design System Tokens & Canvas Utilities

All dashboard views rely on the established GRIP tokens configured in `tailwind.config.js` and `index.css`:

### Color Palette (`grip.*`)
- Primary Blue: `grip-blue` (`#1D61E7`), `grip-blue-hover` (`#1851c4`), `grip-blue-light` (`#EFF6FF`)
- Dark & Slate: `grip-dark` (`#0F172A`), `grip-slate` (`#475569`), `grip-muted` (`#64748B`)
- Surfaces: `grip-canvas` (`#F8FAFC`), `grip-border` (`#E2E8F0`)
- Status Accents: `emerald-500` / `emerald-50` for verified/completed; `amber-500` / `amber-50` for active/sprints.

### Background Canvas & Donut Meter
Ensure `index.css` provides the following utilities:
```css
/* Dot grid background */
.canvas-dot-grid {
  background-color: #f8fafc;
  background-image: radial-gradient(#cbd5e1 1.1px, transparent 1.1px);
  background-size: 20px 20px;
}

/* SVG Radial Meter stroke animation */
.donut-circle {
  stroke-dasharray: 264;
  stroke-dashoffset: 40; /* 85% fill */
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
  transition: stroke-dashoffset 0.8s ease;
}
```

---

## 2. Standard Dashboard Page Anatomy

Every role dashboard must follow this 4-tier visual hierarchy:

```
+-------------------------------------------------------------------------+
| Tier 1: Compact Hero Banner (Accreditation tag, greeting, CTA box)      |
+-------------------------------------------------------------------------+
| Tier 2: 3 Balanced Metric Summary Cards (Readiness, Goals, Appointments)|
+------------------------------------+------------------------------------+
| Tier 3: Two-Column Grid (8 / 4)                                         |
|  [Left 8 Columns]:                 |  [Right 4 Columns]:                |
|  - Section A: Today's Focus/Sprints|  - Card 1: Scheduled Sessions      |
|  - Section B: Academic Roadmap     |  - Card 2: Placement Pulse (Donut) |
+------------------------------------+------------------------------------+
| Tier 4: Full-Width Recent Activity & Institutional Feedback Feed        |
+-------------------------------------------------------------------------+
```

### Tier 1: Compact Hero Banner
- Deep gradient: `bg-gradient-to-r from-blue-700 via-grip-blue to-indigo-700 text-white` with ambient blur spheres.
- Pill tag: Institutional Accreditation / Role identifier.
- Left column: Dynamic greeting (`Good Morning, {name}! Keep progressing.`) and target track / semester.
- Right callout card (`bg-white/10 backdrop-blur-md border border-white/20`): Key rank/score badge and primary action button (e.g. `Resume Active Sprint →`).

### Tier 2: 3-Card Balanced Metrics Row
- Avoid 4-card rows on complex dashboards; 3 cards provide optimal typography and progress clarity:
  1. *Primary Metric* (e.g., Overall Readiness Score, progress bar, benchmark comparison, rubrics status).
  2. *Active Goals/Tasks* (active count, sprint progress bar, sprint label).
  3. *Next Event/Session* (date badge, time pill, mentor topic, location, prep link).

### Tier 3: 70/30 (8-Col / 4-Col) Grid
- **Main Column (8 Cols)**:
  - *Today's Focus & Sprints*: Actionable tasks with category badges (`URGENT/CAPSTONE`, `CODING SPRINT`, `COMPLETED`), due dates, mini progress bars, and distinct action buttons (`Continue Draft`, `Practice Set`, `Verified ✓`).
  - *Roadmap Stepper*: Milestone line connecting completed (✓), active (pulsing number), and upcoming semester nodes.
- **Context Rail (4 Cols)**:
  - *Scheduled Sessions*: Upcoming meetings with mentor details, dates, and direct action buttons (`View Prep Sheet`, `Join Room`).
  - *Placement Pulse / Telemetry*: Radial SVG donut gauge, target recruiters list, and verified competency pills.

### Tier 4: Full-Width Institutional Feed
- Sits **below** the two-column grid.
- Contains 2-column card grid with avatar badges, mentor notes, quotes, or rubric shares.

---

## 3. State & Data Integration Pattern

1. **Centralized Service Calls**:
   - Query through dedicated service files (`studentService.js`, `facultyService.js`, etc.) using `apiClient`.
   - Never use `fetch()` or raw Axios instances.
2. **Graceful Settlement**:
   ```javascript
   const [progressRes, readinessRes, appointmentsRes] = await Promise.allSettled([
     studentService.getProgressDashboard(id),
     studentService.getPlacementReadiness(id),
     studentService.getAppointments(),
   ]);
   ```
3. **Prototype Fallbacks**:
   - Always provide fallback mock data matching the approved prototype for all metrics, tasks, and sessions so that incomplete backend tables do not render blank or broken cards.

---

## 4. Verification Checklist

Before completing any dashboard task:
1. **Production Build**: Execute `npm run build` in `frontend/` — verify 0 syntax/Tailwind errors.
2. **Route Serving**: Ensure `/student/dashboard` (or target role route) returns HTTP 200 within `DashboardLayout`.
3. **RBAC Guard**: Verify unauthenticated users are redirected to `/login` and cross-role access is blocked with HTTP 403.
