const service = require("./triage.service");
const asyncHandler = require("../../utils/asyncHandler");

const assess = asyncHandler(async (req, res) => {
  const { log, reasons } = service.submitAssessment(req.user.id, req.body);
  res.status(201).json({ status: "success", data: { log, reasons } });
});

const listMine = asyncHandler(async (req, res) => {
  const logs = service.listLogsForPatient(req.user.id);
  res.status(200).json({ status: "success", data: { logs } });
});

module.exports = { assess, listMine };
