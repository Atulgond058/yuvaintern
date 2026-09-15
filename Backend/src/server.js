const app = require("./app");
const { getDb } = require("./config/db");

const PORT = process.env.PORT || 4000;

// Ensure the database + schema are initialized before accepting requests.
getDb();

app.listen(PORT, () => {
  console.log(`MediSync backend listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
