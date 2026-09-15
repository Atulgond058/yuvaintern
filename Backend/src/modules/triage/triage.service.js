const { getDb } = require("../../config/db");
const AppError = require("../../utils/AppError");
const engine = require("./triage.engine");

function getPatientProfileByUserId(userId) {
  const db = getDb();
  const profile = db.prepare("SELECT * FROM patient_profiles WHERE user_id = ?").get(userId);
  if (!profile) throw new AppError("Patient profile not found for this account", 404);
  return profile;
}

function submitAssessment(userId, input) {
  const patient = getPatientProfileByUserId(userId);
  const { urgency, reasons } = engine.assess(input);

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO symptom_logs (patient_id, symptoms, duration_days, severity, triage_result)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(patient.id, JSON.stringify(input.symptoms), input.durationDays, input.severity, urgency);

  const log = db.prepare("SELECT * FROM symptom_logs WHERE id = ?").get(result.lastInsertRowid);
  return { log: formatLog(log), reasons };
}

function listLogsForPatient(userId) {
  const patient = getPatientProfileByUserId(userId);
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM symptom_logs WHERE patient_id = ? ORDER BY created_at DESC")
    .all(patient.id);
  return rows.map(formatLog);
}

function formatLog(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    symptoms: JSON.parse(row.symptoms),
    durationDays: row.duration_days,
    severity: row.severity,
    triageResult: row.triage_result,
    appointmentId: row.appointment_id,
    createdAt: row.created_at,
  };
}

module.exports = { submitAssessment, listLogsForPatient, getPatientProfileByUserId };
