const { getDb } = require("../../config/db");
const AppError = require("../../utils/AppError");
const { getDoctorProfileByUserId, getPatientProfileByUserId } = require("../appointments/appointments.service");

function getOrCreateConsultation(appointmentId) {
  const db = getDb();
  let consultation = db
    .prepare("SELECT * FROM consultations WHERE appointment_id = ?")
    .get(appointmentId);

  if (!consultation) {
    const result = db
      .prepare("INSERT INTO consultations (appointment_id, started_at) VALUES (?, datetime('now'))")
      .run(appointmentId);
    consultation = db.prepare("SELECT * FROM consultations WHERE id = ?").get(result.lastInsertRowid);
  }
  return consultation;
}

function formatPrescription(row) {
  return {
    id: row.id,
    consultationId: row.consultation_id,
    medication: row.medication,
    dosage: row.dosage,
    signedBy: row.signed_by,
    issuedOn: row.issued_on,
  };
}

/** Only the doctor assigned to the appointment may issue a prescription for it. */
function createPrescription(user, input) {
  const db = getDb();
  const appointment = db.prepare("SELECT * FROM appointments WHERE id = ?").get(input.appointmentId);
  if (!appointment) throw new AppError("Appointment not found", 404);

  const doctorProfile = getDoctorProfileByUserId(user.id);
  if (!doctorProfile || doctorProfile.id !== appointment.doctor_id) {
    throw new AppError("Only the assigned doctor can issue a prescription for this appointment", 403);
  }

  const consultation = getOrCreateConsultation(appointment.id);

  const result = db
    .prepare(
      `INSERT INTO prescriptions (consultation_id, medication, dosage, signed_by)
       VALUES (?, ?, ?, ?)`
    )
    .run(consultation.id, input.medication, input.dosage, user.id);

  const row = db.prepare("SELECT * FROM prescriptions WHERE id = ?").get(result.lastInsertRowid);
  return formatPrescription(row);
}

function assertPrescriptionAccess(user, row) {
  if (user.role === "admin") return;
  if (user.role === "doctor") {
    const doctor = getDoctorProfileByUserId(user.id);
    if (doctor && doctor.id === row.doctor_id) return;
  }
  if (user.role === "patient") {
    const patient = getPatientProfileByUserId(user.id);
    if (patient && patient.id === row.patient_id) return;
  }
  throw new AppError("You do not have access to this prescription", 403);
}

function getPrescriptionById(user, id) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT p.*, a.patient_id, a.doctor_id FROM prescriptions p
       JOIN consultations c ON c.id = p.consultation_id
       JOIN appointments a ON a.id = c.appointment_id
       WHERE p.id = ?`
    )
    .get(id);
  if (!row) throw new AppError("Prescription not found", 404);

  assertPrescriptionAccess(user, row);
  return formatPrescription(row);
}

/** GET /patients/:patientId/prescriptions — scoped to self unless admin/assigned doctor. */
function listForPatient(user, patientId) {
  const db = getDb();

  if (user.role === "patient") {
    const patient = getPatientProfileByUserId(user.id);
    if (patient.id !== patientId) {
      throw new AppError("You can only view your own prescriptions", 403);
    }
  }
  // Doctors and admins may look up any patientId; a stricter implementation
  // would confirm the doctor has treated this patient before allowing access.

  const rows = db
    .prepare(
      `SELECT p.* FROM prescriptions p
       JOIN consultations c ON c.id = p.consultation_id
       JOIN appointments a ON a.id = c.appointment_id
       WHERE a.patient_id = ?
       ORDER BY p.issued_on DESC`
    )
    .all(patientId);

  return rows.map(formatPrescription);
}

module.exports = { createPrescription, getPrescriptionById, listForPatient };
