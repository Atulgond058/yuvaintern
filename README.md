# MediSync — Front-End Application (Backend-Integrated)

A responsive, accessible front-end for MediSync, built with **React 18**, **React Router 6**,
and **Vite** — now fully connected to the real MediSync back-end API (Week 3) instead of mock
data. Authentication, appointments, symptom triage, prescriptions, and records are all live.

---
## LIVE LINK:   https://medisynchealth.netlify.app/

## 1. What Changed From the Mock-Data Version

The Week 2 version used a static `mockData.js` file behind a stable data-access seam. This pass
replaces that seam with real HTTP calls to the backend, with **no change to the visual design
system or component styling** — only data-fetching and auth were added.

New/changed pieces:

- **`src/api/client.js`** — a small `fetch()` wrapper for every backend endpoint, handling the
  JSON envelope, auth headers, and error messages.
- **`src/context/AuthContext.jsx`** — holds the logged-in user, backed by a JWT in
  `localStorage`; exposes `login`, `register`, `logout`.
- **`src/components/ProtectedRoute.jsx`** — redirects to `/login` if there's no authenticated
  user, preserving the originally requested page.
- **`src/pages/Login.jsx`** and **`src/pages/Register.jsx`** (new) — real authentication forms,
  with role-conditional fields (patient vs. doctor) matching the backend's registration schema.
- **`src/pages/BookAppointment.jsx`** (new) — select a doctor, see their real published
  availability, pick a slot, and book — calling the same conflict-checked endpoint documented
  in the Week 3 API reference.
- **`src/pages/SymptomChecker.jsx`** (new) — submits real symptoms to the rule-based triage
  engine and displays the actual urgency classification and reasons it returns.
- **`Dashboard.jsx`** and **`AppointmentDetail.jsx`** — rewritten to fetch real appointments,
  doctors, symptom logs, prescriptions, and records, with loading and empty states.
- **`AppShell.jsx`** — now shows the real logged-in user and includes a working Log out action.

## 2. Environment Configuration

The app reads the backend's URL from a single environment variable:

```
VITE_API_BASE_URL=https://your-backend.onrender.com
```

- **Local development:** create a `.env` file (see `.env.example`) pointing at your local
  backend (typically `http://localhost:4000`).
- **Netlify:** set `VITE_API_BASE_URL` under Site configuration → Environment variables, then
  trigger a new deploy (environment variable changes do not apply to already-built output).

The backend must have `CORS_ORIGIN` set to this app's exact deployed URL (no trailing slash),
or every request will be blocked by the browser's CORS check.

## 3. Authentication Flow

- Registering or logging in stores a JWT in `localStorage` under `medisync_token`.
- On every page load, `AuthContext` checks for a stored token and calls `GET /api/v1/auth/me`
  to resolve the current user before rendering any protected route.
- `ProtectedRoute` wraps `/dashboard`, `/appointments/:id`, `/book-appointment`, and
  `/symptom-checker` — visiting any of them while logged out redirects to `/login` and returns
  the user to their original destination after signing in.
- Logging out clears the token and returns to a logged-out state immediately (no reload needed).

## 4. Verified End-to-End (Local Testing)

Before this was packaged, the full flow was tested against a running copy of the Week 3
backend using an automated browser:

1. Register a new patient → redirected straight into the dashboard as a real, logged-in user.
2. Submit a symptom check ("chest pain, shortness of breath") → correctly classified
   **Emergency** by the live rule engine, with the actual reason returned by the API.
3. Register a doctor, publish a real availability slot via the API.
4. As the patient, book that exact slot through the Book Appointment page → appointment created
   via the real conflict-checked endpoint.
5. Open the resulting appointment detail page → real doctor name, specialization, license,
   date/time, and reason all rendered from the API response.
6. Cancel the appointment → status flips to "Cancelled" and the Join Call button disables,
   confirming the cancel endpoint and UI state are wired correctly.

Every request in this flow returned the expected 200/201 status from the backend.

## 5. Running the Application Locally

**Requirements:** Node.js 18+, npm, and a running copy of the MediSync backend (Week 3).

```bash
# 1. Install dependencies
cd medisync-frontend
npm install

# 2. Point the app at your backend
cp .env.example .env
# edit .env: VITE_API_BASE_URL=http://localhost:4000

# 3. Start the dev server
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`). Make sure the backend's
`CORS_ORIGIN` matches this URL.

To build for production:
```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally for a final check
```

## 6. Project Structure

```
medisync-frontend/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
└── src/
    ├── main.jsx                    React root + router + AuthProvider
    ├── App.jsx                     Route definitions (public + protected)
    ├── api/
    │   └── client.js               Fetch wrapper for every backend endpoint
    ├── context/
    │   └── AuthContext.jsx         Logged-in user state, login/register/logout
    ├── utils/
    │   └── format.js                getInitials, formatDate, formatTime
    ├── styles/
    │   └── tokens.css              Design tokens + global/base + shared form styles
    ├── components/
    │   ├── ProtectedRoute.jsx      Auth guard for private routes
    │   ├── Button.jsx / .css
    │   ├── TriageBadge.jsx
    │   ├── PulseDivider.jsx
    │   ├── Navbar.jsx / .css
    │   ├── Footer.jsx / .css
    │   ├── AppShell.jsx / .css     Now shows the real user + logout
    │   ├── StatCard.jsx / .css
    │   └── AppointmentCard.jsx / .css
    └── pages/
        ├── LandingPage.jsx / .css
        ├── Login.jsx / Register.jsx / Auth.css   (new)
        ├── Dashboard.jsx / .css                   (now backend-driven)
        ├── BookAppointment.jsx / .css              (new)
        ├── SymptomChecker.jsx / .css                (new)
        ├── AppointmentDetail.jsx / .css            (now backend-driven)
        └── NotFound.jsx
```

## 7. Known Simplifications

- Appointment "mode" is always displayed as "Video Consultation" — the backend doesn't yet
  track consultation mode as a separate field.
- The Consultation Notes tab shows a placeholder message, since the backend does not yet
  expose a GET endpoint for consultation notes (documented as a Week 3 known limitation).
- Prescriptions/Documents tabs show all of the patient's prescriptions/records rather than
  ones strictly scoped to that single appointment, since the backend's response shape does not
  yet link a prescription back to its originating appointment ID.
- "Join video call" is a UI affordance only — no WebRTC signaling is wired up yet, consistent
  with the Week 1 architecture's phased plan.
