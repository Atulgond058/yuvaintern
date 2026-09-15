const express = require("express");
const controller = require("./auth.controller");
const validate = require("../../middleware/validate");
const { registerSchema, loginSchema } = require("./auth.schema");
const { requireAuth } = require("../../middleware/auth");

const router = express.Router();

// POST /api/v1/auth/register
router.post("/register", validate(registerSchema), controller.register);

// POST /api/v1/auth/login
router.post("/login", validate(loginSchema), controller.login);

// GET /api/v1/auth/me
router.get("/me", requireAuth, controller.me);

module.exports = router;
