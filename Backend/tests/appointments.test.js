const request = require("supertest");
const app = require("../src/app");

async function registerDoctor(overrides = {}) {
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({
      name: "Dr. Samuel Osei",
      email: "doctor@example.com",
      password: "Password123!",
      role: "doctor",
      specialization: "Cardiology",
      licenseNo: "MD-1",
      ...overrides,
    });
  return res.body.data;
}

async function registerPatient(overrides = {}) {
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({
      name: "Ava Whitfield",
      email: "patient@example.com",
      password: "Password123!",
      role: "patient",
      ...overrides,
    });
  return res.body.data;
}

describe("Appointments API", () => {
  test("a patient can book an appointment with a doctor", async () => {
    const doctor = await registerDoctor();
    const patient = await registerPatient();

    const res = await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patient.token}`)
      .send({
        doctorId: 1,
        slotStart: "2030-01-10T10:00:00.000Z",
        slotEnd: "2030-01-10T10:30:00.000Z",
        reason: "Annual check-up",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.appointment.status).toBe("confirmed");
    expect(res.body.data.appointment.doctorId).toBe(1);
  });

  test("rejects an overlapping appointment for the same doctor with 409", async () => {
    const doctor = await registerDoctor();
    const patient = await registerPatient();

    await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patient.token}`)
      .send({
        doctorId: 1,
        slotStart: "2030-01-10T10:00:00.000Z",
        slotEnd: "2030-01-10T10:30:00.000Z",
        reason: "First booking",
      });

    const conflict = await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patient.token}`)
      .send({
        doctorId: 1,
        slotStart: "2030-01-10T10:15:00.000Z",
        slotEnd: "2030-01-10T10:45:00.000Z",
        reason: "Overlapping booking",
      });

    expect(conflict.status).toBe(409);
  });

  test("allows a back-to-back (non-overlapping) appointment for the same doctor", async () => {
    const doctor = await registerDoctor();
    const patient = await registerPatient();

    await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patient.token}`)
      .send({
        doctorId: 1,
        slotStart: "2030-01-10T10:00:00.000Z",
        slotEnd: "2030-01-10T10:30:00.000Z",
        reason: "First booking",
      });

    const backToBack = await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patient.token}`)
      .send({
        doctorId: 1,
        slotStart: "2030-01-10T10:30:00.000Z",
        slotEnd: "2030-01-10T11:00:00.000Z",
        reason: "Immediately after",
      });

    expect(backToBack.status).toBe(201);
  });

  test("a doctor only sees their own appointments; a patient only sees their own", async () => {
    const doctor1 = await registerDoctor({ email: "doc1@example.com", licenseNo: "MD-1" });
    const doctor2 = await registerDoctor({ email: "doc2@example.com", licenseNo: "MD-2" });
    const patient = await registerPatient();

    await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patient.token}`)
      .send({ doctorId: 1, slotStart: "2030-02-01T09:00:00.000Z", slotEnd: "2030-02-01T09:30:00.000Z", reason: "With doctor 1" });

    await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patient.token}`)
      .send({ doctorId: 2, slotStart: "2030-02-01T09:00:00.000Z", slotEnd: "2030-02-01T09:30:00.000Z", reason: "With doctor 2" });

    const doc1List = await request(app)
      .get("/api/v1/appointments")
      .set("Authorization", `Bearer ${doctor1.token}`);

    expect(doc1List.body.data.appointments).toHaveLength(1);
    expect(doc1List.body.data.appointments[0].doctorId).toBe(1);
  });

  test("a doctor cannot access another doctor's appointment by id (403)", async () => {
    const doctor1 = await registerDoctor({ email: "doc1@example.com", licenseNo: "MD-1" });
    const doctor2 = await registerDoctor({ email: "doc2@example.com", licenseNo: "MD-2" });
    const patient = await registerPatient();

    const created = await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patient.token}`)
      .send({ doctorId: 1, slotStart: "2030-03-01T09:00:00.000Z", slotEnd: "2030-03-01T09:30:00.000Z", reason: "Test" });

    const appointmentId = created.body.data.appointment.id;

    const res = await request(app)
      .get(`/api/v1/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${doctor2.token}`);

    expect(res.status).toBe(403);
  });

  test("cancelling an appointment sets its status to cancelled", async () => {
    const doctor = await registerDoctor();
    const patient = await registerPatient();

    const created = await request(app)
      .post("/api/v1/appointments")
      .set("Authorization", `Bearer ${patient.token}`)
      .send({ doctorId: 1, slotStart: "2030-04-01T09:00:00.000Z", slotEnd: "2030-04-01T09:30:00.000Z", reason: "Test" });

    const appointmentId = created.body.data.appointment.id;

    const cancelled = await request(app)
      .delete(`/api/v1/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${patient.token}`);

    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.appointment.status).toBe("cancelled");
  });

  test("unauthenticated requests are rejected with 401", async () => {
    const res = await request(app).get("/api/v1/appointments");
    expect(res.status).toBe(401);
  });
});
