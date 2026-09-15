const { getDb } = require("../../config/db");
const AppError = require("../../utils/AppError");

function listDoctors() {
  const db = getDb();
  return db
    .prepare(
      `SELECT dp.id, u.name, dp.specialization, dp.license_no AS licenseNo
       FROM doctor_profiles dp JOIN users u ON u.id = dp.user_id
       ORDER BY u.name`
    )
    .all();
}

function getDoctorProfileByUserId(userId) {
  const db = getDb();
  return db.prepare("SELECT * FROM doctor_profiles WHERE user_id = ?").get(userId);
}

function getDoctorById(doctorId) {
  const db = getDb();
  const doctor = db
    .prepare(
      `SELECT dp.id, u.name, dp.specialization, dp.license_no AS licenseNo
       FROM doctor_profiles dp JOIN users u ON u.id = dp.user_id
       WHERE dp.id = ?`
    )
    .get(doctorId);
  if (!doctor) throw new AppError("Doctor not found", 404);
  return doctor;
}

function getAvailability(doctorId, { fromDate } = {}) {
  getDoctorById(doctorId); // 404s if missing
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, start_time AS startTime, end_time AS endTime, is_booked AS isBooked
       FROM availability_slots
       WHERE doctor_id = ? AND is_booked = 0
         AND (? IS NULL OR start_time >= ?)
       ORDER BY start_time`
    )
    .all(doctorId, fromDate || null, fromDate || null);
  return rows.map((r) => ({ ...r, isBooked: !!r.isBooked }));
}

function addAvailabilitySlot(doctorId, { startTime, endTime }) {
  getDoctorById(doctorId);
  if (new Date(endTime) <= new Date(startTime)) {
    throw new AppError("endTime must be after startTime", 422);
  }

  const db = getDb();
  try {
    const result = db
      .prepare(
        "INSERT INTO availability_slots (doctor_id, start_time, end_time) VALUES (?, ?, ?)"
      )
      .run(doctorId, startTime, endTime);
    return db
      .prepare(
        `SELECT id, start_time AS startTime, end_time AS endTime, is_booked AS isBooked
         FROM availability_slots WHERE id = ?`
      )
      .get(result.lastInsertRowid);
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      throw new AppError("A slot with this exact start time already exists for this doctor", 409);
    }
    throw err;
  }
}

module.exports = {
  listDoctors,
  getDoctorById,
  getDoctorProfileByUserId,
  getAvailability,
  addAvailabilitySlot,
};
