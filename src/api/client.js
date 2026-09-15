// src/api/client.js
// Thin wrapper around fetch() that talks to the MediSync backend.
// Base URL comes from the VITE_API_BASE_URL env var (set in Netlify).

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("medisync_token");
}

function setToken(token) {
  localStorage.setItem("medisync_token", token);
}

function clearToken() {
  localStorage.removeItem("medisync_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = json.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return json.data;
}

export const api = {
  // --- Auth ---
  register: (payload) => request("/api/v1/auth/register", { method: "POST", body: payload, auth: false }),
  login: async (email, password) => {
    const data = await request("/api/v1/auth/login", { method: "POST", body: { email, password }, auth: false });
    setToken(data.token);
    return data.user;
  },
  me: () => request("/api/v1/auth/me"),
  logout: () => clearToken(),
  isLoggedIn: () => !!getToken(),

  // --- Doctors ---
  listDoctors: () => request("/api/v1/doctors", { auth: false }),
  getDoctorAvailability: (doctorId) => request(`/api/v1/doctors/${doctorId}/availability`, { auth: false }),

  // --- Appointments ---
  listAppointments: () => request("/api/v1/appointments"),
  getAppointment: (id) => request(`/api/v1/appointments/${id}`),
  createAppointment: (payload) => request("/api/v1/appointments", { method: "POST", body: payload }),
  cancelAppointment: (id) => request(`/api/v1/appointments/${id}`, { method: "DELETE" }),

  // --- Triage ---
  submitTriage: (payload) => request("/api/v1/triage/assess", { method: "POST", body: payload }),
  listTriageLogs: () => request("/api/v1/triage/logs"),

  // --- Prescriptions & Records ---
  listPatientPrescriptions: (patientId) => request(`/api/v1/patients/${patientId}/prescriptions`),
  listPatientRecords: (patientId) => request(`/api/v1/patients/${patientId}/records`),
};
