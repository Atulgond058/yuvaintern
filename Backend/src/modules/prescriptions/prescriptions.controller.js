const service = require("./prescriptions.service");
const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");

const create = asyncHandler(async (req, res) => {
  if (req.user.role !== "doctor") {
    throw new AppError("Only doctors can issue prescriptions", 403);
  }
  const prescription = service.createPrescription(req.user, req.body);
  res.status(201).json({ status: "success", data: { prescription } });
});

const getOne = asyncHandler(async (req, res) => {
  const prescription = service.getPrescriptionById(req.user, Number(req.params.id));
  res.status(200).json({ status: "success", data: { prescription } });
});

const listForPatient = asyncHandler(async (req, res) => {
  const prescriptions = service.listForPatient(req.user, Number(req.params.patientId));
  res.status(200).json({ status: "success", data: { prescriptions } });
});

module.exports = { create, getOne, listForPatient };
