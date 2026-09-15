const service = require("./doctors.service");
const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");

const list = asyncHandler(async (req, res) => {
  res.status(200).json({ status: "success", data: { doctors: service.listDoctors() } });
});

const getOne = asyncHandler(async (req, res) => {
  const doctor = service.getDoctorById(Number(req.params.id));
  res.status(200).json({ status: "success", data: { doctor } });
});

const getAvailability = asyncHandler(async (req, res) => {
  const slots = service.getAvailability(Number(req.params.id), { fromDate: req.query.from });
  res.status(200).json({ status: "success", data: { slots } });
});

const addAvailability = asyncHandler(async (req, res) => {
  // A doctor may only manage their own availability.
  const ownProfile = service.getDoctorProfileByUserId(req.user.id);
  if (!ownProfile || ownProfile.id !== Number(req.params.id)) {
    throw new AppError("You can only manage your own availability", 403);
  }
  const slot = service.addAvailabilitySlot(Number(req.params.id), req.body);
  res.status(201).json({ status: "success", data: { slot } });
});

module.exports = { list, getOne, getAvailability, addAvailability };
