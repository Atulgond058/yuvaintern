const { z } = require("zod");

const createAppointmentSchema = z.object({
  doctorId: z.number().int().positive(),
  slotId: z.number().int().positive().optional(),
  slotStart: z.string().datetime({ message: "slotStart must be an ISO 8601 datetime" }),
  slotEnd: z.string().datetime({ message: "slotEnd must be an ISO 8601 datetime" }),
  reason: z.string().min(3, "Reason must be at least 3 characters"),
  urgency: z.enum(["routine", "urgent", "emergency"]).default("routine"),
});

const updateAppointmentSchema = z.object({
  status: z.enum(["confirmed", "pending", "cancelled", "completed"]).optional(),
  slotStart: z.string().datetime().optional(),
  slotEnd: z.string().datetime().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field (status, slotStart, slotEnd) must be provided",
});

module.exports = { createAppointmentSchema, updateAppointmentSchema };
