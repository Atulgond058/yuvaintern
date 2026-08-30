# MediSync — Front-End Application

A responsive, accessible front-end for MediSync's patient experience, built with **React 18**,
**React Router 6**, and **Vite**. Three interconnected views — a marketing landing page, a
patient dashboard, and an appointment detail page — share one design system and a mock data
layer that mirrors the REST API described in the Week 1 architecture report, so swapping in
real endpoints later requires no component changes.

---

# Live Link -- https://medisynchealth.netlify.app/

## 1. Development Process

The build followed the sequence below, matching the task's key steps:

1. **Environment setup** — scaffolded a minimal Vite + React project by hand (`package.json`,
   `vite.config.js`, `index.html`) rather than a CLI wizard, to keep the dependency tree small
   (`react`, `react-dom`, `react-router-dom` only, plus Vite's React plugin as a dev dependency).
2. **Design planning (wireframe pass, in the design token layer)** — before any component code,
   a token system was written in `src/styles/tokens.css`: a color palette, a three-typeface
   pairing, a spacing/radius scale, and one signature visual motif (see Section 2). Layout
   concepts for all three pages were reasoned through as a hero-split, a sidebar-shell, and a
   two-column detail-plus-sidebar layout before implementation.
3. **Component implementation** — built bottom-up: small shared primitives first (`Button`,
   `TriageBadge`, `PulseDivider`), then page-level composites (`Navbar`, `Footer`, `AppShell`,
   `StatCard`, `AppointmentCard`), then the three routed pages.
4. **Interactivity** — client-side routing (`react-router-dom`), local component state for
   search filtering and tabbed content, and CSS-only motion (animated SVG heartbeat trace,
   hover/focus states) with `prefers-reduced-motion` respected throughout.
5. **Usability testing** — manually exercised each user flow with a headless browser
   (Playwright) at both a 1440px desktop viewport and a 390px mobile viewport: landing page →
   "Go to my dashboard" → appointment card → tabbed detail view → back to dashboard. Verified
   keyboard focus rings, tab-panel switching, search filtering, and the mobile nav drawer.
6. **Review & fixes** — caught and corrected two issues during screenshot review: the sidebar
   was marking all nav links "active" simultaneously (fixed by exact-matching only the
   Dashboard route) and a stray margin was leaving a gap above the footer (removed).

## 2. Design System & Rationale

Rather than a generic dashboard template, the interface is built around one idea: **a calm,
clinical-teal system that reuses the same red/amber/green triage vocabulary everywhere urgency
needs to be legible at a glance** — the badge on a dashboard card, the sidebar-flagged stat, and
the section in the appointment detail view all use the identical `TriageBadge` component and
color tokens.

- **Color** — cool paper background (`#F5F8FA`), deep slate-navy ink (`#14293B`), a single
  clinical-teal accent (`#1F6F6B`) for interactive elements, and the existing triage palette
  (emergency `#B0332E`, urgent `#C98A2C`, routine `#3E8A5C`) carried over from the Week 1
  architecture report for consistency across deliverables.
- **Type** — three roles, not two: **Fraunces** (a characterful serif) for headlines and page
  titles, **Inter** for body copy and UI labels, and **IBM Plex Mono** for data-flavored text
  (timestamps, stat labels, badges) — a nod to clinical readouts.
- **Signature element** — a hand-drawn EKG "pulse line" (`PulseDivider` component) used sparingly
  as a section divider and, animated, as the centerpiece of the hero's "live vitals" card. It
  appears in exactly two places so it stays a signature rather than a decoration.
- **Layout** — the marketing landing page uses an asymmetric hero split (copy left, product
  mockup right); the authenticated views (dashboard, detail) use a fixed dark sidebar + light
  content shell, a distinct visual register that signals "you're now inside the product."

## 3. Architecture & Design Patterns

- **Component-based architecture**: every UI element is a small, single-purpose component
  (`Button`, `TriageBadge`, `StatCard`, `AppointmentCard`, `PulseDivider`) composed into pages.
- **Container/presentational split**: page components (`Dashboard.jsx`, `AppointmentDetail.jsx`)
  own state and data-fetching concerns; shared components are stateless and receive data via props.
- **Shared layout shell pattern**: `AppShell.jsx` implements the sidebar/topbar chrome once and
  is reused by both authenticated views, so navigation, the user badge, and the mobile menu
  toggle live in a single place.
- **Data-access seam**: all mock content lives in `src/data/mockData.js` behind two lookup
  functions (`getAppointmentById`, `getDoctorById`). Replacing these with real `fetch` calls to
  the endpoints in the Week 1 report (e.g. `GET /api/v1/patients/{id}/records`) does not require
  touching any component.
- **Accessibility as a structural concern, not an afterthought**: semantic landmarks (`<header>`,
  `<main>`, `<aside>`, `<nav>`), a skip-to-content link on every page, visible focus rings defined
  globally, proper `role="tablist"`/`role="tabpanel"` wiring with `aria-selected` on the detail
  page's tabs, a labelled data table with `<caption>` and `scope="col"` headers, and
  `prefers-reduced-motion` handling.

## 4. Libraries Used

| Library | Purpose |
|---|---|
| `react` / `react-dom` | UI rendering |
| `react-router-dom` | Client-side routing between the three views |
| `vite` + `@vitejs/plugin-react` | Dev server and production bundling |

No CSS framework was used — all styling is hand-written CSS with custom properties (design
tokens), to keep the visual language fully intentional rather than templated.

## 5. Views & Navigation

| Route | View | Purpose |
|---|---|---|
| `/` | Landing Page | Marketing/entry point; explains the product and routes into the app |
| `/dashboard` | Patient Dashboard | Stat overview, searchable upcoming appointments, recent symptom logs |
| `/appointments/:id` | Appointment Detail | Tabbed view (Overview / Notes / Prescriptions / Documents) for a single appointment |
| `*` | Not Found | Friendly 404 with a way back home |

Navigation is fully interconnected: the landing page's CTAs and the hero's "View appointment"
link route into the dashboard and a specific appointment; dashboard appointment cards and
symptom-log rows route into the matching detail page; the detail page's breadcrumb and sidebar
link back to the dashboard and homepage.

## 6. Running the Application Locally

**Requirements:** Node.js 18+ and npm.

```bash
# 1. Unzip and enter the project
cd medisync-frontend

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open the URL Vite prints (typically `http://localhost:5173`).

To produce an optimized production build:

```bash
npm run build      # outputs to dist/
npm run preview    # serves the production build locally for a final check
```

## 7. Project Structure

```
yuvaintern/
└── public/
     ├── _redirects
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                 # React root + router
    ├── App.jsx                  # Route definitions
    ├── data/
    │   └── mockData.js          # Stand-in for backend API responses
    ├── styles/
    │   └── tokens.css           # Design tokens + global/base styles
    ├── components/              # Shared, reusable UI pieces
    │   ├── Button.jsx / .css
    │   ├── TriageBadge.jsx
    │   ├── PulseDivider.jsx
    │   ├── Navbar.jsx / .css
    │   ├── Footer.jsx / .css
    │   ├── AppShell.jsx / .css
    │   ├── StatCard.jsx / .css
    │   └── AppointmentCard.jsx / .css
    └── pages/                   # Routed views
        ├── LandingPage.jsx / .css
        ├── Dashboard.jsx / .css
        ├── AppointmentDetail.jsx / .css
        └── NotFound.jsx
```

## 8. Testing Notes

Manual usability passes were run at 1440×900 (desktop) and 390×844 (mobile) viewports using an
automated headless browser, covering:

- Full navigation loop across all three views and back
- Search-as-you-type filtering on the dashboard appointment list
- Tab switching on the appointment detail page (Overview, Notes, Prescriptions, Documents)
- Empty states (no search results, no prescriptions, no documents)
- Mobile sidebar open/close via the hamburger toggle
- Keyboard-only navigation (visible focus outlines on every interactive element)

- Data is static (`mockData.js`); no network requests are made yet. The data-access functions
  are isolated so they can be swapped for real API calls without touching components.
- No automated test suite (e.g. Vitest/React Testing Library) is included yet — recommended as
  a next step before backend integration.
- Authentication, the symptom-intake form itself, and the live WebRTC video call UI are out of
  scope for this front-end pass and are planned for a subsequent week's task.
