const express = require("express");
const controller = require("./prescriptions.controller");
const validate = require("../../middleware/validate");
const { createPrescriptionSchema } = require("./prescriptions.schema");
const { requireAuth } = require("../../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// POST /api/v1/prescriptions  (doctor only)
router.post("/", validate(createPrescriptionSchema), controller.create);

// GET /api/v1/prescriptions/:id
router.get("/:id", controller.getOne);

module.exports = router;
