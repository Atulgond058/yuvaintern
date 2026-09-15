const request = require("supertest");
const app = require("../src/app");
const engine = require("../src/modules/triage/triage.engine");

describe("Triage engine (unit)", () => {
  test("classifies emergency keywords as emergency regardless of severity", () => {
    const result = engine.assess({ symptoms: ["chest pain"], durationDays: 0, severity: 1 });
    expect(result.urgency).toBe("emergency");
  });

  test("classifies high severity without emergency keywords as urgent", () => {
    const result = engine.assess({ symptoms: ["general fatigue"], durationDays: 1, severity: 5 });
    expect(result.urgency).toBe("urgent");
  });

  test("classifies persistent moderate symptoms as urgent", () => {
    const result = engine.assess({ symptoms: ["ongoing cough"], durationDays: 10, severity: 3 });
    expect(result.urgency).toBe("urgent");
  });

  test("classifies mild, brief symptoms as routine", () => {
    const result = engine.assess({ symptoms: ["mild headache"], durationDays: 1, severity: 1 });
    expect(result.urgency).toBe("routine");
  });
});

describe("Triage API", () => {
  async function registerPatient() {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Ava Whitfield",
      email: "patient@example.com",
      password: "Password123!",
      role: "patient",
    });
    return res.body.data;
  }

  test("POST /api/v1/triage/assess stores a symptom log and returns urgency", async () => {
    const patient = await registerPatient();

    const res = await request(app)
      .post("/api/v1/triage/assess")
      .set("Authorization", `Bearer ${patient.token}`)
      .send({ symptoms: ["chest pain"], durationDays: 0, severity: 5 });

    expect(res.status).toBe(201);
    expect(res.body.data.log.triageResult).toBe("emergency");
  });

  test("POST /api/v1/triage/assess rejects an empty symptoms array", async () => {
    const patient = await registerPatient();

    const res = await request(app)
      .post("/api/v1/triage/assess")
      .set("Authorization", `Bearer ${patient.token}`)
      .send({ symptoms: [], severity: 2 });

    expect(res.status).toBe(422);
  });

  test("GET /api/v1/triage/logs returns only the authenticated patient's logs", async () => {
    const patient = await registerPatient();

    await request(app)
      .post("/api/v1/triage/assess")
      .set("Authorization", `Bearer ${patient.token}`)
      .send({ symptoms: ["mild headache"], durationDays: 1, severity: 1 });

    const res = await request(app)
      .get("/api/v1/triage/logs")
      .set("Authorization", `Bearer ${patient.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.logs).toHaveLength(1);
  });

  test("a doctor cannot submit a triage assessment (403)", async () => {
    const doctorRes = await request(app).post("/api/v1/auth/register").send({
      name: "Dr. Osei",
      email: "doctor@example.com",
      password: "Password123!",
      role: "doctor",
      specialization: "Cardiology",
      licenseNo: "MD-1",
    });

    const res = await request(app)
      .post("/api/v1/triage/assess")
      .set("Authorization", `Bearer ${doctorRes.body.data.token}`)
      .send({ symptoms: ["chest pain"], severity: 5 });

    expect(res.status).toBe(403);
  });
});
