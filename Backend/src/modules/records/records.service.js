const { getDb } = require("../../config/db");
const AppError = require("../../utils/AppError");
const { getPatientProfileByUserId } = require("../appointments/appointments.service");

function formatRecord(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    docType: row.doc_type,
    fileName: row.file_name,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}

/**
 * Stores document metadata (this API accepts metadata only; actual file
 * bytes would be uploaded to encrypted object storage per the Week 1
 * architecture report, with this endpoint recording the resulting URL).
 */
function createRecord(user, input) {
  const db = getDb();

  if (user.role === "patient") {
    const patient = getPatientProfileByUserId(user.id);
    if (patient.id !== input.patientId) {
      throw new AppError("You can only upload records to your own file", 403);
    }
  }

  const result = db
    .prepare(
      `INSERT INTO medical_records (patient_id, doc_type, file_name, uploaded_by)
       VALUES (?, ?, ?, ?)`
    )
    .run(input.patientId, input.docType, input.fileName, user.id);

  return formatRecord(db.prepare("SELECT * FROM medical_records WHERE id = ?").get(result.lastInsertRowid));
}

function listForPatient(user, patientId) {
  if (user.role === "patient") {
    const patient = getPatientProfileByUserId(user.id);
    if (patient.id !== patientId) {
      throw new AppError("You can only view your own records", 403);
    }
  }

  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM medical_records WHERE patient_id = ? ORDER BY created_at DESC")
    .all(patientId);
  return rows.map(formatRecord);
}

module.exports = { createRecord, listForPatient };
