# MediSync Back-End — API Documentation

Base URL (local development): `http://localhost:4000`
All API routes are versioned under `/api/v1`.

## Conventions

- **Content type:** all requests and responses use `application/json`.
- **Authentication:** protected routes require an `Authorization: Bearer <token>` header. Tokens are issued by `POST /api/v1/auth/register` and `POST /api/v1/auth/login`.
- **Response envelope (success):**
  ```json
  { "status": "success", "data": { ... } }
  ```
- **Response envelope (error):**
  ```json
  { "status": "error", "message": "Human-readable message", "details": [ ] }
  ```
  `details` is only present for validation errors (HTTP 422) and lists each failing field.
- **Roles:** `patient`, `doctor`, `admin`. Each endpoint below states which roles may call it.
- **Dates/times:** ISO 8601 strings, e.g. `2026-09-10T10:00:00.000Z`.

---

## Health

### `GET /health`
Liveness check. No authentication required.

**Response `200`**
```json
{ "status": "ok", "service": "medisync-backend", "time": "2026-09-04T07:00:00.000Z" }
```

---

## Auth

### `POST /api/v1/auth/register`
Creates a new account and its role-specific profile, and returns a session token.

**Roles:** public

**Body**
| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | yes | min 2 characters |
| email | string | yes | must be unique |
| password | string | yes | min 8 characters |
| role | string | yes | `"patient"` or `"doctor"` |
| dob | string | no | patient only |
| gender | string | no | patient only |
| specialization | string | no | doctor only, defaults to "General Practice" |
| licenseNo | string | no | doctor only, defaults to "PENDING" |

**Response `201`**
```json
{
  "status": "success",
  "data": {
    "user": { "id": 1, "name": "Ava Whitfield", "email": "ava@example.com", "role": "patient", "created_at": "..." },
    "token": "eyJhbGciOi..."
  }
}
```

**Errors:** `409` email already registered · `422` validation failed

---

### `POST /api/v1/auth/login`
**Roles:** public

**Body:** `{ "email": string, "password": string }`

**Response `200`:** same shape as register.

**Errors:** `401` invalid email or password

---

### `GET /api/v1/auth/me`
Returns the authenticated user's profile.

**Roles:** any authenticated user

**Response `200`**
```json
{ "status": "success", "data": { "user": { "id": 1, "name": "...", "email": "...", "role": "patient" } } }
```

**Errors:** `401` missing/invalid token

---

## Doctors

### `GET /api/v1/doctors`
Lists all doctors.

**Roles:** public

**Response `200`**
```json
{ "status": "success", "data": { "doctors": [ { "id": 1, "name": "Dr. Samuel Osei", "specialization": "Cardiology", "licenseNo": "MD-77310" } ] } }
```

### `GET /api/v1/doctors/:id`
**Roles:** public
**Errors:** `404` doctor not found

### `GET /api/v1/doctors/:id/availability?from=<ISO date>`
Lists open (unbooked) availability slots for a doctor. `from` is optional and filters to slots starting on/after that date.

**Roles:** public

**Response `200`**
```json
{ "status": "success", "data": { "slots": [ { "id": 5, "startTime": "2026-09-10T10:00:00.000Z", "endTime": "2026-09-10T10:30:00.000Z", "isBooked": false } ] } }
```

### `POST /api/v1/doctors/:id/availability`
Adds an availability slot. A doctor may only manage their own availability.

**Roles:** `doctor` (must own the profile at `:id`)

**Body:** `{ "startTime": ISO datetime, "endTime": ISO datetime }`

**Response `201`:** the created slot.

**Errors:** `403` not your profile · `404` doctor not found · `409` duplicate slot start time · `422` endTime not after startTime

---

## Appointments

All appointment routes require authentication. Visibility is role-scoped: patients see only their own appointments, doctors see only appointments assigned to them, admins see all.

### `POST /api/v1/appointments`
Books an appointment. Includes **conflict prevention**: rejected if the target doctor already has a non-cancelled appointment overlapping the requested time window (checked and inserted inside a single database transaction).

**Roles:** `patient`

**Body**
| Field | Type | Required | Notes |
|---|---|---|---|
| doctorId | number | yes | |
| slotId | number | no | links to a pre-published availability slot, if used |
| slotStart | string | yes | ISO datetime |
| slotEnd | string | yes | ISO datetime, must be after slotStart |
| reason | string | yes | min 3 characters |
| urgency | string | no | `routine` \| `urgent` \| `emergency`, defaults to `routine` |

**Response `201`:** the created appointment.

**Errors:** `403` caller is not a patient · `404` doctor not found · `409` overlapping appointment or slot already booked · `422` invalid time range

### `GET /api/v1/appointments`
Lists appointments visible to the caller.

**Roles:** any authenticated user (scoped as above)

### `GET /api/v1/appointments/:id`
**Roles:** the owning patient, the assigned doctor, or admin
**Errors:** `403` not your appointment · `404` not found

### `PATCH /api/v1/appointments/:id`
Updates status and/or reschedules an appointment. Rescheduling re-runs the conflict check against the doctor's other appointments.

**Roles:** the owning patient, the assigned doctor, or admin

**Body (at least one field):**
```json
{ "status": "completed", "slotStart": "2026-09-11T10:00:00.000Z", "slotEnd": "2026-09-11T10:30:00.000Z" }
```
`status` is one of `confirmed | pending | cancelled | completed`.

**Errors:** `403` · `404` · `409` new time overlaps another appointment · `422` no fields provided or invalid time range

### `DELETE /api/v1/appointments/:id`
Cancels an appointment (soft delete — sets `status: "cancelled"` and frees any linked availability slot).

**Roles:** the owning patient, the assigned doctor, or admin

**Response `200`:** the updated appointment with `status: "cancelled"`.

---

## Triage

### `POST /api/v1/triage/assess`
Runs the rule-based triage engine against reported symptoms and stores the result as a symptom log.

**Roles:** `patient`

**Body**
| Field | Type | Required | Notes |
|---|---|---|---|
| symptoms | string[] | yes | at least one entry |
| durationDays | number | no | integer ≥ 0, defaults to 0 |
| severity | number | yes | integer 1–5 |

**Response `201`**
```json
{
  "status": "success",
  "data": {
    "log": { "id": 1, "patientId": 1, "symptoms": ["chest pain"], "durationDays": 0, "severity": 5, "triageResult": "emergency", "appointmentId": null, "createdAt": "..." },
    "reasons": ["Reported symptoms match emergency-indicator keywords."]
  }
}
```

`triageResult` is one of `emergency | urgent | routine` — see `src/modules/triage/triage.engine.js` for the exact rule set, which mirrors the Week 1 architecture report's triage flowchart.

**Errors:** `403` caller is not a patient · `422` validation failed

### `GET /api/v1/triage/logs`
Lists the authenticated patient's own symptom logs, most recent first.

**Roles:** `patient`

---

## Prescriptions

### `POST /api/v1/prescriptions`
Issues a prescription for an appointment. Only the doctor assigned to that appointment may issue it; a consultation record is created automatically on first prescription if one doesn't already exist.

**Roles:** `doctor` (must be the assigned doctor for the given appointment)

**Body:** `{ "appointmentId": number, "medication": string, "dosage": string }`

**Response `201`:** the created prescription.

**Errors:** `403` not your patient's appointment · `404` appointment not found · `422` validation failed

### `GET /api/v1/prescriptions/:id`
**Roles:** the prescribing doctor, the patient it was issued to, or admin
**Errors:** `403` · `404`

---

## Medical Records

### `POST /api/v1/records`
Records metadata for an uploaded medical document. (This endpoint accepts metadata only — actual file bytes are expected to go to encrypted object storage per the Week 1 architecture, with the resulting reference passed here as `fileName`.)

**Roles:** any authenticated user; patients may only upload to their own file

**Body:** `{ "patientId": number, "docType": string, "fileName": string }`

**Response `201`:** the created record.

**Errors:** `403` patient uploading to someone else's file · `422` validation failed

---

## Patients (cross-cutting reads)

### `GET /api/v1/patients/:id/records`
Lists a patient's medical records.

**Roles:** the patient themself, or a doctor/admin

**Errors:** `403` patient requesting someone else's records

### `GET /api/v1/patients/:id/prescriptions`
Lists all prescriptions issued to a patient, most recent first.

**Roles:** the patient themself, or a doctor/admin

**Errors:** `403` patient requesting someone else's prescriptions

---

## Error Reference

| Status | Meaning | Typical cause |
|---|---|---|
| 400 | Bad request | Malformed request generally |
| 401 | Unauthorized | Missing/invalid/expired token, or wrong credentials |
| 403 | Forbidden | Authenticated, but not allowed to perform this action |
| 404 | Not found | Resource id does not exist |
| 409 | Conflict | Duplicate email, overlapping appointment, already-booked slot |
| 422 | Unprocessable | Request body failed schema validation |
| 500 | Internal server error | Unexpected server-side failure (logged server-side, generic message returned to the client) |

## Example: End-to-End Flow (curl)

```bash
# 1. Register a doctor
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Samuel Osei","email":"samuel@medisync.test","password":"Password123!","role":"doctor","specialization":"Cardiology","licenseNo":"MD-77310"}'

# 2. Register a patient
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ava Whitfield","email":"ava@medisync.test","password":"Password123!","role":"patient"}'

# 3. Book an appointment (use the patient's token from step 2)
curl -X POST http://localhost:4000/api/v1/appointments \
  -H "Content-Type: application/json" -H "Authorization: Bearer <PATIENT_TOKEN>" \
  -d '{"doctorId":1,"slotStart":"2026-09-10T10:00:00.000Z","slotEnd":"2026-09-10T10:30:00.000Z","reason":"Annual check-up"}'

# 4. Run a triage assessment
curl -X POST http://localhost:4000/api/v1/triage/assess \
  -H "Content-Type: application/json" -H "Authorization: Bearer <PATIENT_TOKEN>" \
  -d '{"symptoms":["chest pain"],"durationDays":0,"severity":5}'

# 5. Issue a prescription (use the doctor's token from step 1)
curl -X POST http://localhost:4000/api/v1/prescriptions \
  -H "Content-Type: application/json" -H "Authorization: Bearer <DOCTOR_TOKEN>" \
  -d '{"appointmentId":1,"medication":"Aspirin 81mg","dosage":"Once daily"}'
```
