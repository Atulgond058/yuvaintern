const authService = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const { user, token } = authService.register(req.body);
  res.status(201).json({ status: "success", data: { user, token } });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = authService.login(req.body);
  res.status(200).json({ status: "success", data: { user, token } });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({ status: "success", data: { user: req.user } });
});

module.exports = { register, login, me };
