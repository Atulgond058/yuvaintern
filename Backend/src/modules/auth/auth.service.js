const bcrypt = require("bcryptjs");
const { getDb } = require("../../config/db");
const { signToken } = require("../../utils/jwt");
const AppError = require("../../utils/AppError");

const SALT_ROUNDS = 10;

function register(input) {
  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(input.email);
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = bcrypt.hashSync(input.password, SALT_ROUNDS);

  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
  );

  const createUserAndProfile = db.transaction(() => {
    const result = insertUser.run(input.name, input.email, passwordHash, input.role);
    const userId = result.lastInsertRowid;

    if (input.role === "patient") {
      db.prepare(
        "INSERT INTO patient_profiles (user_id, dob, gender) VALUES (?, ?, ?)"
      ).run(userId, input.dob || null, input.gender || null);
    } else if (input.role === "doctor") {
      db.prepare(
        "INSERT INTO doctor_profiles (user_id, specialization, license_no) VALUES (?, ?, ?)"
      ).run(userId, input.specialization || "General Practice", input.licenseNo || "PENDING");
    }

    return userId;
  });

  const userId = createUserAndProfile();
  const user = db
    .prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?")
    .get(userId);

  const token = signToken({ sub: user.id, role: user.role });
  return { user, token };
}

function login(input) {
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(input.email);

  if (!user || !bcrypt.compareSync(input.password, user.password_hash)) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ sub: user.id, role: user.role });
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

module.exports = { register, login };
