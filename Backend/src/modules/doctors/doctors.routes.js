const express = require("express");
const controller = require("./doctors.controller");
const validate = require("../../middleware/validate");
const { addSlotSchema } = require("./doctors.schema");
const { requireAuth, requireRole } = require("../../middleware/auth");

const router = express.Router();

// GET /api/v1/doctors
router.get("/", controller.list);

// GET /api/v1/doctors/:id
router.get("/:id", controller.getOne);

// GET /api/v1/doctors/:id/availability?from=ISO_DATE
router.get("/:id/availability", controller.getAvailability);

// POST /api/v1/doctors/:id/availability  (doctor only, own profile)
router.post(
  "/:id/availability",
  requireAuth,
  requireRole("doctor"),
  validate(addSlotSchema),
  controller.addAvailability
);

module.exports = router;
