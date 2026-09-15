const AppError = require("../utils/AppError");
const { verifyToken } = require("../utils/jwt");
const { getDb } = require("../config/db");

/** Requires a valid Bearer token; attaches the authenticated user to req.user. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new AppError("Missing or malformed Authorization header", 401));
  }

  try {
    const payload = verifyToken(token);
    const db = getDb();
    const user = db
      .prepare("SELECT id, name, email, role FROM users WHERE id = ?")
      .get(payload.sub);

    if (!user) return next(new AppError("User no longer exists", 401));

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
}

/** Restricts a route to one or more roles. Use after requireAuth. */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError("Not authenticated", 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
