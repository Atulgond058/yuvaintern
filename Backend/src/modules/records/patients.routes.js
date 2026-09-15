const express = require("express");
const asyncHandler = require("../../utils/asyncHandler");
const { requireAuth } = require("../../middleware/auth");
const recordsService = require("./records.service");
const prescriptionsService = require("../prescriptions/prescriptions.service");

const router = express.Router();
router.use(requireAuth);

// GET /api/v1/patients/:id/records
router.get(
  "/:id/records",
  asyncHandler(async (req, res) => {
    const records = recordsService.listForPatient(req.user, Number(req.params.id));
    res.status(200).json({ status: "success", data: { records } });
  })
);

// GET /api/v1/patients/:id/prescriptions
router.get(
  "/:id/prescriptions",
  asyncHandler(async (req, res) => {
    const prescriptions = prescriptionsService.listForPatient(req.user, Number(req.params.id));
    res.status(200).json({ status: "success", data: { prescriptions } });
  })
);

module.exports = router;
