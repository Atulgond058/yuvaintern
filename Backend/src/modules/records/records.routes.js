const express = require("express");
const controller = require("./records.controller");
const validate = require("../../middleware/validate");
const { createRecordSchema } = require("./records.schema");
const { requireAuth } = require("../../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// POST /api/v1/records
router.post("/", validate(createRecordSchema), controller.create);

module.exports = router;
