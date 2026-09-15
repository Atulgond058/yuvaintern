/**
 * AppError — a known, expected error with an HTTP status code attached.
 * Thrown deliberately from services/controllers; caught by the central
 * error handler and returned as a clean JSON error response.
 */
class AppError extends Error {
  constructor(message, statusCode = 400, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
