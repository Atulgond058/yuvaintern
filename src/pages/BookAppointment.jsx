import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import Button from "../components/Button.jsx";
import { api } from "../api/client.js";
import { formatDate, formatTime } from "../utils/format.js";
import "./BookAppointment.css";

export default function BookAppointment() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [reason, setReason] = useState("");
  const [urgency, setUrgency] = useState("routine");
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .listDoctors()
      .then(setDoctors)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingDoctors(false));
  }, []);

  useEffect(() => {
    if (!selectedDoctorId) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    setSelectedSlotId("");
    api
      .getDoctorAvailability(selectedDoctorId)
      .then(setSlots)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctorId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!selectedDoctorId) return setError("Please select a doctor.");
    if (!selectedSlotId) return setError("Please select an available time slot.");
    if (reason.trim().length < 3) return setError("Please describe the reason for your visit.");

    const slot = slots.find((s) => String(s.id) === String(selectedSlotId));

    setSubmitting(true);
    try {
      const appointment = await api.createAppointment({
        doctorId: Number(selectedDoctorId),
        slotId: slot.id,
        slotStart: slot.startTime,
        slotEnd: slot.endTime,
        reason,
        urgency,
      });
      navigate(`/appointments/${appointment.id}`);
    } catch (err) {
      setError(err.message || "Could not book this appointment. Please try another slot.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Book an appointment" breadcrumb={<Link to="/dashboard" className="breadcrumb-link">&larr; Dashboard</Link>}>
      <div className="book-appt">
        {error && <div className="form-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="doctor">Doctor</label>
            {loadingDoctors ? (
              <p className="form-hint">Loading doctors…</p>
            ) : (
              <select id="doctor" value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)} required>
                <option value="">Select a doctor…</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.specialization}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedDoctorId && (
            <div className="form-field">
              <label>Available time slots</label>
              {loadingSlots ? (
                <p className="form-hint">Loading availability…</p>
              ) : slots.length === 0 ? (
                <p className="form-hint">This doctor has no open slots right now. Try another doctor.</p>
              ) : (
                <div className="book-appt__slots">
                  {slots.map((slot) => (
                    <button
                      type="button"
                      key={slot.id}
                      className={`book-appt__slot ${String(selectedSlotId) === String(slot.id) ? "book-appt__slot--active" : ""}`}
                      onClick={() => setSelectedSlotId(slot.id)}
                    >
                      <span>{formatDate(slot.startTime)}</span>
                      <span>{formatTime(slot.startTime)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="reason">Reason for visit</label>
            <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
          </div>

          <div className="form-field">
            <label htmlFor="urgency">Urgency</label>
            <select id="urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
            <p className="form-hint">
              If you're experiencing a medical emergency, please contact local emergency services directly.
            </p>
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Booking…" : "Confirm appointment"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
