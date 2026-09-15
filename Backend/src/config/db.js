const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

let db;

function getDb() {
  if (db) return db;

  const isTest = process.env.NODE_ENV === "test";
  const dbPath = isTest
    ? ":memory:"
    : path.resolve(process.cwd(), process.env.DATABASE_PATH || "./data/medisync.db");

  if (!isTest) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  db.exec(schema);

  return db;
}

/** Used by tests to get a clean in-memory database per test file. */
function resetDb() {
  db = null;
  return getDb();
}

module.exports = { getDb, resetDb };
