const express = require("express");
const controller = require("./appointments.controller");
const validate = require("../../middleware/validate");
const { createAppointmentSchema, updateAppointmentSchema } = require("./appointments.schema");
const { requireAuth } = require("../../middleware/auth");

const router = express.Router();

router.use(requireAuth); // every appointment route requires authentication

// POST /api/v1/appointments
router.post("/", validate(createAppointmentSchema), controller.create);

// GET /api/v1/appointments  (role-scoped: own for patient/doctor, all for admin)
router.get("/", controller.list);

// GET /api/v1/appointments/:id
router.get("/:id", controller.getOne);

// PATCH /api/v1/appointments/:id  (reschedule / change status)
router.patch("/:id", validate(updateAppointmentSchema), controller.update);

// DELETE /api/v1/appointments/:id  (cancel — soft delete, frees the slot)
router.delete("/:id", controller.cancel);

module.exports = router;
