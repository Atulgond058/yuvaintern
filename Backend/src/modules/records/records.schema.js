const { z } = require("zod");

const createRecordSchema = z.object({
  patientId: z.number().int().positive(),
  docType: z.string().min(2),
  fileName: z.string().min(1),
});

module.exports = { createRecordSchema };
