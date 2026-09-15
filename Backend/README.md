# MediSync — Back-End API (Week 3)

A RESTful back-end for MediSync built with **Node.js, Express, and SQLite** (via
`better-sqlite3`), implementing authentication, scheduling with conflict prevention, a
rule-based symptom triage engine, and prescription/records management — directly matching
the modules and API design laid out in the Week 1 System Architecture report.

---

## 1. Development Process

1. **Framework selection** — Node.js + Express, chosen for consistency with the Week 1/2
   deliverables and fast local iteration. SQLite (`better-sqlite3`) was chosen over a
   client-server database for this deliverable: it's a real relational database with foreign
   keys, transactions, and SQL — but needs no separate server process to install or run,
   which keeps "clone and run" friction near zero. The schema and query layer are plain SQL,
   so swapping in PostgreSQL later is a driver change, not a rewrite.
2. **Endpoint design** — endpoints were designed around the resources already defined in the
   Week 1 ER diagram and API overview (Users, Doctors, Appointments, Symptom Logs,
   Consultations, Prescriptions, Medical Records), grouped into feature modules.
3. **Database schema** — a relational schema (`src/db/schema.sql`) with foreign keys and
   `CHECK` constraints for enums (role, status, urgency), mirroring the Week 1 ER diagram.
4. **Security & validation** — JWT authentication, bcrypt password hashing, role-based access
   control middleware, `zod` schema validation on every write endpoint, `helmet` for HTTP
   security headers, and basic rate limiting on the whole `/api` surface.
5. **Testing** — a Jest + Supertest suite (21 tests) covering authentication, the appointment
   conflict-prevention logic, role-scoped visibility, and the triage engine's classification
   rules, run against a fresh in-memory SQLite database per test.
6. **Documentation** — a full endpoint reference (`API_DOCUMENTATION.md`) covering every
   route, method, parameter, and response shape, plus this README for setup and architecture.

## 2. Architecture & Design Patterns

- **Layered, modular structure** — each domain (`auth`, `doctors`, `appointments`, `triage`,
  `prescriptions`, `records`) is a self-contained module with its own `routes` → `controller`
  → `service` chain:
  - **Routes** wire HTTP verbs/paths to middleware and controllers.
  - **Controllers** are thin — they parse the request, call the service, and shape the
    response. No business logic lives here.
  - **Services** hold all business logic and are the only layer that talks to the database,
    so logic is testable independently of HTTP and reusable across controllers.
- **Centralized error handling** — every service throws a single `AppError(message,
  statusCode, details?)`. One error-handling middleware at the end of the middleware chain
  turns any thrown error into a consistent JSON response, and hides internal details for
  unexpected (non-operational) errors while logging them server-side.
- **Schema-first validation** — `zod` schemas per module, applied through a single
  `validate(schema)` middleware, so invalid input never reaches a service.
- **Middleware-based security** — `requireAuth` verifies the JWT and attaches `req.user`;
  `requireRole(...roles)` composes with it to restrict routes by role. Ownership checks
  (e.g. "is this your appointment?") live in the service layer, since they depend on
  relationships between records, not just the caller's role.
- **Transactional writes** — appointment creation/rescheduling wraps the overlap check and
  the insert/update in a single `better-sqlite3` transaction, so two near-simultaneous
  requests can't both pass the conflict check and double-book a doctor.

## 3. Libraries Used

| Library | Purpose |
|---|---|
| `express` | HTTP server and routing |
| `better-sqlite3` | Synchronous, transactional SQLite driver (relational database) |
| `jsonwebtoken` | Issuing and verifying auth tokens |
| `bcryptjs` | Password hashing |
| `zod` | Request body schema validation |
| `helmet` | Security-related HTTP headers |
| `cors` | Cross-origin access for the front-end app |
| `express-rate-limit` | Basic abuse/brute-force mitigation |
| `morgan` | Request logging in development |
| `dotenv` | Loads `.env` configuration |
| `jest` / `supertest` (dev) | Automated testing |

## 4. Database Schema

See `src/db/schema.sql` for the full definition. Tables: `users`, `patient_profiles`,
`doctor_profiles`, `availability_slots`, `appointments`, `symptom_logs`, `consultations`,
`prescriptions`, `medical_records` — a direct implementation of the Week 1 ER diagram.

## 5. Running the Application Locally

**Requirements:** Node.js 18+ and npm.

```bash
# 1. Enter the project and install dependencies
cd medisync-backend
npm install

# 2. Create your local environment file
cp .env.example .env
# then edit .env and set a real JWT_SECRET

# 3. (Optional) seed demo accounts and sample availability
npm run seed

# 4. Start the server
npm start
```

The API is now available at `http://localhost:4000`. Check `GET /health` to confirm it's
running. If you ran `npm run seed`, these demo accounts are available (password for all:
`Password123!`):

| Role | Email |
|---|---|
| doctor | `meera.kapoor@medisync.test` |
| doctor | `samuel.osei@medisync.test` |
| patient | `ava.whitfield@medisync.test` |
| admin | `admin@medisync.test` |

For local development with auto-restart on file changes:
```bash
npm run dev
```

## 6. Running the Tests

```bash
npm test
```

Tests run against a fresh **in-memory** SQLite database (no file is created), so they never
touch your local `data/medisync.db` and can be run repeatedly with no cleanup step.

## 7. Project Structure

```
medisync-backend/
├── package.json
├── .env.example
├── API_DOCUMENTATION.md
├── src/
│   ├── app.js                   Express app assembly (middleware + routes)
│   ├── server.js                Entry point — starts the HTTP server
│   ├── config/
│   │   └── db.js                SQLite connection + schema bootstrap
│   ├── db/
│   │   ├── schema.sql           Table definitions (the ER diagram, in SQL)
│   │   └── seed.js              Demo data script
│   ├── middleware/
│   │   ├── auth.js              requireAuth, requireRole
│   │   ├── validate.js          zod-based body validation
│   │   └── errorHandler.js      404 + centralized error responses
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── asyncHandler.js
│   │   └── jwt.js
│   └── modules/
│       ├── auth/                register, login, /me
│       ├── doctors/             list, get, availability
│       ├── appointments/        CRUD + conflict prevention
│       ├── triage/               rule engine + symptom logs
│       ├── prescriptions/       issue + fetch
│       └── records/             medical record metadata + patient-scoped reads
└── tests/
    ├── setup.js                 Fresh in-memory DB per test
    ├── auth.test.js
    ├── appointments.test.js
    └── triage.test.js
```

## 8. Security Notes

- Passwords are hashed with bcrypt (10 salt rounds) — never stored or logged in plain text.
- JWTs are short-lived (`JWT_EXPIRES_IN`, default 8h) and verified on every protected request.
- All write endpoints validate their input against a `zod` schema before touching the database.
- Role checks happen at the route layer (`requireRole`); ownership checks happen at the
  service layer (e.g. a doctor can only manage their own availability or prescriptions for
  their own appointments).
- `helmet` sets standard protective HTTP headers; `express-rate-limit` caps requests per IP.

## 9. Known Limitations & Next Steps

- **Conflict locking is process-local.** The transactional overlap check prevents
  double-booking within a single Node process. The Week 1 architecture report specifies a
  Redis-based distributed slot lock for a multi-instance production deployment — this API is
  structured so that lock could be added inside `appointments.service.js` without changing
  the route or controller layer.
- **File uploads are metadata-only.** `POST /api/v1/records` records a `fileName` reference;
  actual binary upload to encrypted object storage (per the Week 1 architecture) is a
  follow-up integration, not implemented in this pass.
- **No refresh-token rotation yet** — tokens simply expire; a refresh-token flow is a
  reasonable next addition alongside real front-end/back-end integration.
- **SQLite → PostgreSQL migration path** — the schema and queries are plain SQL with no
  SQLite-specific syntax beyond `datetime('now')`; moving to PostgreSQL means swapping the
  driver in `src/config/db.js` and adjusting that one function call.
