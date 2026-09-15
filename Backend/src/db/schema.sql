-- MediSync relational schema (SQLite)
-- Mirrors the ER design from the Week 1 System Architecture report.

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS patient_profiles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  dob        TEXT,
  gender     TEXT,
  allergies  TEXT
);

CREATE TABLE IF NOT EXISTS doctor_profiles (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  license_no     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS availability_slots (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  doctor_id  INTEGER NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  start_time TEXT NOT NULL,
  end_time   TEXT NOT NULL,
  is_booked  INTEGER NOT NULL DEFAULT 0,
  UNIQUE(doctor_id, start_time)
);

CREATE TABLE IF NOT EXISTS appointments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id  INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  doctor_id   INTEGER NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  slot_id     INTEGER REFERENCES availability_slots(id) ON DELETE SET NULL,
  slot_start  TEXT NOT NULL,
  slot_end    TEXT NOT NULL,
  reason      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),
  urgency     TEXT NOT NULL DEFAULT 'routine' CHECK (urgency IN ('routine', 'urgent', 'emergency')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS symptom_logs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id   INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  symptoms     TEXT NOT NULL,      -- JSON array, stored as text
  duration_days INTEGER NOT NULL DEFAULT 0,
  severity     INTEGER NOT NULL DEFAULT 1 CHECK (severity BETWEEN 1 AND 5),
  triage_result TEXT NOT NULL,     -- routine | urgent | emergency
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS consultations (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  appointment_id INTEGER NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
  notes          TEXT,
  started_at     TEXT,
  ended_at       TEXT
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  consultation_id INTEGER NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  medication      TEXT NOT NULL,
  dosage          TEXT NOT NULL,
  signed_by       INTEGER NOT NULL REFERENCES users(id),
  issued_on       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS medical_records (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id  INTEGER NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  doc_type    TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_patient ON symptom_logs(patient_id);
