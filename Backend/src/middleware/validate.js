const { ZodError } = require("zod");
const AppError = require("../utils/AppError");

/**
 * validate(schema) — validates req.body against a zod schema.
 * On success, replaces req.body with the parsed (and type-coerced) data.
 * On failure, forwards a 422 AppError with a field-level breakdown.
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return next(new AppError("Validation failed", 422, details));
      }
      next(err);
    }
  };
}

module.exports = validate;
