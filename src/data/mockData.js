// Static mock data standing in for API responses documented in the
// project's backend report (GET /api/v1/appointments, /triage/assess, etc).
// Swap the functions in src/api/client.js for real fetch calls when the
// backend is available — component code does not need to change.

export const currentUser = {
  id: "pat_1029",
  name: "Ava Whitfield",
  role: "patient",
  avatarInitials: "AW",
};

export const doctors = {
  doc_1: {
    id: "doc_1",
    name: "Dr. Meera Kapoor",
    specialization: "Internal Medicine",
    photoInitials: "MK",
    rating: 4.9,
    licenseNo: "MD-88214",
  },
  doc_2: {
    id: "doc_2",
    name: "Dr. Samuel Osei",
    specialization: "Cardiology",
    photoInitials: "SO",
    rating: 4.8,
    licenseNo: "MD-77310",
  },
  doc_3: {
    id: "doc_3",
    name: "Dr. Lena Fischer",
    specialization: "Dermatology",
    photoInitials: "LF",
    rating: 4.95,
    licenseNo: "MD-90142",
  },
};

export const appointments = [
  {
    id: "appt_501",
    doctorId: "doc_2",
    date: "2026-08-25",
    time: "10:30 AM",
    mode: "Video Consultation",
    status: "Confirmed",
    urgency: "urgent",
    reason: "Recurring chest tightness after exercise",
    notes:
      "Patient reports intermittent chest tightness lasting under a minute, triggered by exertion. No radiating pain. Triage engine flagged for same-day review.",
    prescriptions: [
      {
        id: "rx_1",
        medication: "Aspirin 81mg — once daily",
        issuedOn: "2026-08-18",
        signedBy: "Dr. Samuel Osei",
      },
    ],
    documents: [
      { id: "doc_a", name: "ECG_2026-08-10.pdf", type: "Lab result" },
      { id: "doc_b", name: "Cardiology_Referral.pdf", type: "Referral" },
    ],
  },
  {
    id: "appt_502",
    doctorId: "doc_1",
    date: "2026-08-27",
    time: "2:00 PM",
    mode: "Video Consultation",
    status: "Confirmed",
    urgency: "routine",
    reason: "Annual wellness check-in",
    notes: "Routine annual physical. No acute concerns reported at intake.",
    prescriptions: [],
    documents: [{ id: "doc_c", name: "Bloodwork_2026-07-30.pdf", type: "Lab result" }],
  },
  {
    id: "appt_503",
    doctorId: "doc_3",
    date: "2026-09-02",
    time: "11:15 AM",
    mode: "Video Consultation",
    status: "Pending confirmation",
    urgency: "routine",
    reason: "Follow-up on skin patch treatment",
    notes: "Follow-up to check response to prescribed topical treatment.",
    prescriptions: [
      {
        id: "rx_2",
        medication: "Hydrocortisone 1% cream — twice daily",
        issuedOn: "2026-08-05",
        signedBy: "Dr. Lena Fischer",
      },
    ],
    documents: [],
  },
];

export const symptomLogs = [
  {
    id: "log_1",
    date: "2026-08-24",
    summary: "Chest tightness, mild shortness of breath",
    urgency: "urgent",
    linkedAppointmentId: "appt_501",
  },
  {
    id: "log_2",
    date: "2026-08-19",
    summary: "Seasonal congestion, low-grade fever",
    urgency: "routine",
    linkedAppointmentId: null,
  },
  {
    id: "log_3",
    date: "2026-08-12",
    summary: "Localized skin irritation, mild itching",
    urgency: "routine",
    linkedAppointmentId: "appt_503",
  },
];

export function getAppointmentById(id) {
  return appointments.find((a) => a.id === id) || null;
}

export function getDoctorById(id) {
  return doctors[id] || null;
}
