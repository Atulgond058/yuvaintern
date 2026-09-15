const { z } = require("zod");

const assessSchema = z.object({
  symptoms: z.array(z.string().min(1)).min(1, "At least one symptom is required"),
  durationDays: z.number().int().min(0).default(0),
  severity: z.number().int().min(1).max(5),
});

module.exports = { assessSchema };
