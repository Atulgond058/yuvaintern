const { z } = require("zod");

const addSlotSchema = z.object({
  startTime: z.string().datetime({ message: "startTime must be an ISO 8601 datetime" }),
  endTime: z.string().datetime({ message: "endTime must be an ISO 8601 datetime" }),
});

module.exports = { addSlotSchema };
