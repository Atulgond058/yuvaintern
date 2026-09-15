const { getDb } = require("../../config/db");
const AppError = require("../../utils/AppError");

function getPatientProfileByUserId(userId) {
  const db = getDb();
  const profile = db.prepare("SELECT * FROM patient_profiles WHERE user_id = ?").get(userId);
  if (!profile) throw new AppError("Patient profile not found for this account", 404);
  return profile;
}

function getDoctorProfileByUserId(userId) {
  const db = getDb();
  return db.prepare("SELECT * FROM doctor_profiles WHERE user_id = ?").get(userId);
}

function formatAppointment(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    slotId: row.slot_id,
    slotStart: row.slot_start,
    slotEnd: row.slot_end,
    reason: row.reason,
    status: row.status,
    urgency: row.urgency,
    createdAt: row.created_at,
  };
}

/**
 * Creates an appointment for the authenticated patient.
 * Conflict prevention: rejects if the requested doctor already has a
 * non-cancelled appointment whose time range overlaps the requested one.
 * Wrapped in a DB transaction so the overlap check and insert are atomic
 * for a single-process deployment (see README for the Redis-based
 * distributed-lock upgrade path noted in the Week 1 architecture report).
 */
function createAppointment(userId, input) {
  const patient = getPatientProfileByUserId(userId);
  const db = getDb();

  const doctor = db.prepare("SELECT * FROM doctor_profiles WHERE id = ?").get(input.doctorId);
  if (!doctor) throw new AppError("Doctor not found", 404);

  if (new Date(input.slotEnd) <= new Date(input.slotStart)) {
    throw new AppError("slotEnd must be after slotStart", 422);
  }

  const createTx = db.transaction(() => {
    const conflict = db
      .prepare(
        `SELECT id FROM appointments
         WHERE doctor_id = ? AND status != 'cancelled'
           AND slot_start < ? AND slot_end > ?`
      )
      .get(input.doctorId, input.slotEnd, input.slotStart);

    if (conflict) {
      throw new AppError(
        "This doctor already has an appointment that overlaps the requested time window",
        409
      );
    }

    if (input.slotId) {
      const slot = db.prepare("SELECT * FROM availability_slots WHERE id = ?").get(input.slotId);
      if (!slot || slot.is_booked) {
        throw new AppError("The selected availability slot is no longer available", 409);
      }
      db.prepare("UPDATE availability_slots SET is_booked = 1 WHERE id = ?").run(input.slotId);
    }

    const result = db
      .prepare(
        `INSERT INTO appointments
          (patient_id, doctor_id, slot_id, slot_start, slot_end, reason, urgency)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        patient.id,
        input.doctorId,
        input.slotId || null,
        input.slotStart,
        input.slotEnd,
        input.reason,
        input.urgency
      );

    return result.lastInsertRowid;
  });

  const id = createTx();
  return formatAppointment(db.prepare("SELECT * FROM appointments WHERE id = ?").get(id));
}

/** Lists appointments visible to the requesting user, scoped by role. */
function listAppointments(user) {
  const db = getDb();

  if (user.role === "admin") {
    return db.prepare("SELECT * FROM appointments ORDER BY slot_start DESC").all().map(formatAppointment);
  }

  if (user.role === "patient") {
    const patient = getPatientProfileByUserId(user.id);
    return db
      .prepare("SELECT * FROM appointments WHERE patient_id = ? ORDER BY slot_start DESC")
      .all(patient.id)
      .map(formatAppointment);
  }

  if (user.role === "doctor") {
    const doctor = getDoctorProfileByUserId(user.id);
    if (!doctor) return [];
    return db
      .prepare("SELECT * FROM appointments WHERE doctor_id = ? ORDER BY slot_start DESC")
      .all(doctor.id)
      .map(formatAppointment);
  }

  return [];
}

function getAppointmentById(id) {
  const db = getDb();
  const row = db.prepare("SELECT * FROM appointments WHERE id = ?").get(id);
  if (!row) throw new AppError("Appointment not found", 404);
  return row;
}

/** Authorization check: can this user view/modify this appointment row? */
function assertCanAccess(user, appointmentRow) {
  if (user.role === "admin") return;

  if (user.role === "patient") {
    const patient = getPatientProfileByUserId(user.id);
    if (appointmentRow.patient_id !== patient.id) {
      throw new AppError("You do not have access to this appointment", 403);
    }
    return;
  }

  if (user.role === "doctor") {
    const doctor = getDoctorProfileByUserId(user.id);
    if (!doctor || appointmentRow.doctor_id !== doctor.id) {
      throw new AppError("You do not have access to this appointment", 403);
    }
    return;
  }

  throw new AppError("You do not have access to this appointment", 403);
}

function getOneForUser(user, id) {
  const row = getAppointmentById(id);
  assertCanAccess(user, row);
  return formatAppointment(row);
}

function updateAppointment(user, id, updates) {
  const db = getDb();
  const row = getAppointmentById(id);
  assertCanAccess(user, row);

  if (updates.slotStart || updates.slotEnd) {
    const newStart = updates.slotStart || row.slot_start;
    const newEnd = updates.slotEnd || row.slot_end;
    if (new Date(newEnd) <= new Date(newStart)) {
      throw new AppError("slotEnd must be after slotStart", 422);
    }
    const conflict = db
      .prepare(
        `SELECT id FROM appointments
         WHERE doctor_id = ? AND id != ? AND status != 'cancelled'
           AND slot_start < ? AND slot_end > ?`
      )
      .get(row.doctor_id, id, newEnd, newStart);
    if (conflict) {
      throw new AppError("The new time overlaps another confirmed appointment", 409);
    }
  }

  const fields = [];
  const values = [];
  for (const [key, col] of [
    ["status", "status"],
    ["slotStart", "slot_start"],
    ["slotEnd", "slot_end"],
  ]) {
    if (updates[key] !== undefined) {
      fields.push(`${col} = ?`);
      values.push(updates[key]);
    }
  }
  values.push(id);

  db.prepare(`UPDATE appointments SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return formatAppointment(getAppointmentById(id));
}

function cancelAppointment(user, id) {
  const db = getDb();
  const row = getAppointmentById(id);
  assertCanAccess(user, row);

  const cancelTx = db.transaction(() => {
    db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(id);
    if (row.slot_id) {
      db.prepare("UPDATE availability_slots SET is_booked = 0 WHERE id = ?").run(row.slot_id);
    }
  });
  cancelTx();

  return formatAppointment(getAppointmentById(id));
}

module.exports = {
  createAppointment,
  listAppointments,
  getOneForUser,
  updateAppointment,
  cancelAppointment,
  getPatientProfileByUserId,
  getDoctorProfileByUserId,
};
