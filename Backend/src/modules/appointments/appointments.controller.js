const service = require("./appointments.service");
const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");

const create = asyncHandler(async (req, res) => {
  if (req.user.role !== "patient") {
    throw new AppError("Only patients can book an appointment", 403);
  }
  const appointment = service.createAppointment(req.user.id, req.body);
  res.status(201).json({ status: "success", data: { appointment } });
});

const list = asyncHandler(async (req, res) => {
  const appointments = service.listAppointments(req.user);
  res.status(200).json({ status: "success", data: { appointments } });
});

const getOne = asyncHandler(async (req, res) => {
  const appointment = service.getOneForUser(req.user, Number(req.params.id));
  res.status(200).json({ status: "success", data: { appointment } });
});

const update = asyncHandler(async (req, res) => {
  const appointment = service.updateAppointment(req.user, Number(req.params.id), req.body);
  res.status(200).json({ status: "success", data: { appointment } });
});

const cancel = asyncHandler(async (req, res) => {
  const appointment = service.cancelAppointment(req.user, Number(req.params.id));
  res.status(200).json({ status: "success", data: { appointment } });
});

module.exports = { create, list, getOne, update, cancel };
