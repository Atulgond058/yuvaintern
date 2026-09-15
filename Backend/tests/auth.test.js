const request = require("supertest");
const app = require("../src/app");

describe("Auth API", () => {
  const patientPayload = {
    name: "Ava Whitfield",
    email: "ava@example.com",
    password: "Password123!",
    role: "patient",
  };

  test("POST /api/v1/auth/register creates a new patient and returns a token", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(patientPayload);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.user.email).toBe(patientPayload.email);
    expect(res.body.data.user).not.toHaveProperty("password_hash");
    expect(typeof res.body.data.token).toBe("string");
  });

  test("POST /api/v1/auth/register rejects a duplicate email with 409", async () => {
    await request(app).post("/api/v1/auth/register").send(patientPayload);
    const res = await request(app).post("/api/v1/auth/register").send(patientPayload);

    expect(res.status).toBe(409);
    expect(res.body.status).toBe("error");
  });

  test("POST /api/v1/auth/register rejects invalid input with 422", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ name: "A", email: "not-an-email", password: "short", role: "patient" });

    expect(res.status).toBe(422);
    expect(res.body.details).toEqual(expect.any(Array));
  });

  test("POST /api/v1/auth/login succeeds with correct credentials", async () => {
    await request(app).post("/api/v1/auth/register").send(patientPayload);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: patientPayload.email, password: patientPayload.password });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(patientPayload.email);
  });

  test("POST /api/v1/auth/login fails with wrong password (401)", async () => {
    await request(app).post("/api/v1/auth/register").send(patientPayload);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: patientPayload.email, password: "WrongPassword!" });

    expect(res.status).toBe(401);
  });

  test("GET /api/v1/auth/me requires a valid bearer token", async () => {
    const unauthed = await request(app).get("/api/v1/auth/me");
    expect(unauthed.status).toBe(401);

    const register = await request(app).post("/api/v1/auth/register").send(patientPayload);
    const token = register.body.data.token;

    const authed = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
    expect(authed.status).toBe(200);
    expect(authed.body.data.user.email).toBe(patientPayload.email);
  });
});
