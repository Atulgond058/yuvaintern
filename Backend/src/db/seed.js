require("dotenv").config();
const bcrypt = require("bcryptjs");
const { getDb } = require("../config/db");

function seed() {
  const db = getDb();
  const hash = bcrypt.hashSync("Password123!", 10);

  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
  );

  const run = db.transaction(() => {
    // Doctors
    const doc1 = insertUser.run("Dr. Meera Kapoor", "meera.kapoor@medisync.test", hash, "doctor");
    db.prepare(
      "INSERT INTO doctor_profiles (user_id, specialization, license_no) VALUES (?, ?, ?)"
    ).run(doc1.lastInsertRowid, "Internal Medicine", "MD-88214");

    const doc2 = insertUser.run("Dr. Samuel Osei", "samuel.osei@medisync.test", hash, "doctor");
    db.prepare(
      "INSERT INTO doctor_profiles (user_id, specialization, license_no) VALUES (?, ?, ?)"
    ).run(doc2.lastInsertRowid, "Cardiology", "MD-77310");

    // Patient
    const pat1 = insertUser.run("Ava Whitfield", "ava.whitfield@medisync.test", hash, "patient");
    db.prepare("INSERT INTO patient_profiles (user_id, dob, gender) VALUES (?, ?, ?)").run(
      pat1.lastInsertRowid,
      "1994-03-12",
      "female"
    );

    // Admin
    insertUser.run("Admin User", "admin@medisync.test", hash, "admin");

    // Sample availability for Dr. Osei
    const doctorProfile = db
      .prepare("SELECT id FROM doctor_profiles WHERE user_id = ?")
      .get(doc2.lastInsertRowid);

    const slotInsert = db.prepare(
      "INSERT INTO availability_slots (doctor_id, start_time, end_time) VALUES (?, ?, ?)"
    );
    const base = new Date();
    for (let i = 1; i <= 3; i++) {
      const start = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
      start.setHours(10, 0, 0, 0);
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      slotInsert.run(doctorProfile.id, start.toISOString(), end.toISOString());
    }
  });

  run();
  console.log("Seed complete. Demo accounts (all use password: Password123!):");
  console.log("  doctor  meera.kapoor@medisync.test");
  console.log("  doctor  samuel.osei@medisync.test");
  console.log("  patient ava.whitfield@medisync.test");
  console.log("  admin   admin@medisync.test");
}

seed();
