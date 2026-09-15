process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1h";

const { resetDb } = require("../src/config/db");

// Each test file gets a fresh in-memory SQLite database.
beforeEach(() => {
  resetDb();
});
