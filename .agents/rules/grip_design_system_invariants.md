# GRIP Design System & Multi-Role Visual Invariants

This rule governs all UI generation, styling, and component authoring for the GRIP Career Readiness Platform.

## Master Design Source
The GRIP Landing Page (`.claude/images/landing_Screen.png`) is the immutable master visual reference.

## Mandatory Shell Invariants
- **Sidebar**: Exactly 260px width, `#FFFFFF` background, `1px solid #E2E8F0` border. Active item highlighted with `#EFF6FF` container, `#1D4ED8` text, and left vertical indicator bar (3-4px solid `#1D4ED8`).
- **Top Bar**: 64px height, sticky, breadcrumbs on left, search in center with `Ctrl+K` shortcut, status pill and primary CTA on right.
- **Canvas**: `#F8FAFC` base background, `#FFFFFF` cards, `1px solid #E2E8F0` borders, `rounded-xl` corner radii (12px to 16px).
- **Typography**: **Plus Jakarta Sans** for headlines, mastheads, and metric values; **Inter** for body copy, tables, and form inputs. Tabular numerals (`tabular-nums`) for all scores, metrics, and dates.
- **Buttons**: Primary buttons are solid Royal Blue (`#1D4ED8`, hover `#1E40AF`), 40px height, 8px border radius (`rounded-lg`). Secondary buttons are `#FFFFFF` with `1px solid #E2E8F0` border.
- **Input Controls**: 40px height, `1px solid #E2E8F0` border resting, 2px `#1D4ED8` ring on focus, `rounded-lg`.

## Role Accent Color Architecture
- **Student**: Royal Blue (`#EFF6FF` container, `#1D4ED8` text)
- **Faculty & HOD**: Institutional Purple (`#F5F3FF` container, `#7C3AED` text)
- **Alumni**: Distinguished Emerald (`#ECFDF5` container, `#059669` text)
- **Recruiter**: Enterprise Blue / Indigo (`#EFF6FF` container, `#1D4ED8` text)

## Persona & Data Continuity
Maintain persona coherence across all screens and role journeys:
- **Candidate**: Rohan Mehta (Final Year CSE-A, USN: `1DS22CS402`, 9.24 CGPA, 88.4% Readiness)
- **Faculty Lead**: Prof. Neha Sharma (Assoc. Prof & Placement Lead, Dept. of CSE)
- **Department Head**: Dr. Arvind Swaminathan (Professor & HOD, Dept. of CSE)
- **Alumni Mentor**: Vikram Singhania (Senior SWE @ TechCorp, CSE '21)
- **Campus Recruiter**: Marcus Vance (Campus TA Lead @ TechCorp Global)

## Stitch MCP Asset Protocol
When generating or inspecting screens via Stitch MCP:
1. Bind to design system asset `assets/2993851a91984b00badb15ff041ecc9a` (*Academic Nexus*).
2. Download both high-res screenshot (`.png`) and full source (`.html`) into paired directory paths:
   - Images: `.claude/images/stitch/<Role>/<screen-slug>/<screen_slug>_screen.png`
   - Code: `.claude/stitch-artifacts/<Role>/<screen-slug>/<screen_slug>_screen.html`
3. Inspect every screenshot to ensure strict visual alignment prior to acceptance.
