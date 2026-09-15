const { z } = require("zod");

const createPrescriptionSchema = z.object({
  appointmentId: z.number().int().positive(),
  medication: z.string().min(2),
  dosage: z.string().min(2),
});

module.exports = { createPrescriptionSchema };
