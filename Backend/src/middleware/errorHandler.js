/* eslint-disable no-unused-vars */

function notFoundHandler(req, res, next) {
  res.status(404).json({
    status: "error",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  if (!isOperational) {
    // Unexpected error — log full detail server-side, hide internals from the client.
    console.error("[UNEXPECTED ERROR]", err);
  }

  res.status(statusCode).json({
    status: "error",
    message: isOperational ? err.message : "Something went wrong. Please try again later.",
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = { notFoundHandler, errorHandler };
