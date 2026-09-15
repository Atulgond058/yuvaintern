require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./modules/auth/auth.routes");
const doctorsRoutes = require("./modules/doctors/doctors.routes");
const appointmentsRoutes = require("./modules/appointments/appointments.routes");
const triageRoutes = require("./modules/triage/triage.routes");
const prescriptionsRoutes = require("./modules/prescriptions/prescriptions.routes");
const recordsRoutes = require("./modules/records/records.routes");
const patientsRoutes = require("./modules/records/patients.routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

// --- Security & platform middleware ---
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json({ limit: "1mb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Basic rate limiting to slow brute-force / abuse (see Week 1 report, Section 10).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// --- Health check ---
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "medisync-backend", time: new Date().toISOString() });
});

// --- API v1 routes ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/doctors", doctorsRoutes);
app.use("/api/v1/appointments", appointmentsRoutes);
app.use("/api/v1/triage", triageRoutes);
app.use("/api/v1/prescriptions", prescriptionsRoutes);
app.use("/api/v1/records", recordsRoutes);
app.use("/api/v1/patients", patientsRoutes);

// --- 404 + centralized error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
