const service = require("./records.service");
const asyncHandler = require("../../utils/asyncHandler");

const create = asyncHandler(async (req, res) => {
  const record = service.createRecord(req.user, req.body);
  res.status(201).json({ status: "success", data: { record } });
});

const listForPatient = asyncHandler(async (req, res) => {
  const records = service.listForPatient(req.user, Number(req.params.patientId));
  res.status(200).json({ status: "success", data: { records } });
});

module.exports = { create, listForPatient };
