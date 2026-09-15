const express = require("express");
const controller = require("./triage.controller");
const validate = require("../../middleware/validate");
const { assessSchema } = require("./triage.schema");
const { requireAuth, requireRole } = require("../../middleware/auth");

const router = express.Router();

// POST /api/v1/triage/assess  (patient only)
router.post("/assess", requireAuth, requireRole("patient"), validate(assessSchema), controller.assess);

// GET /api/v1/triage/logs  (the authenticated patient's own logs)
router.get("/logs", requireAuth, requireRole("patient"), controller.listMine);

module.exports = router;
