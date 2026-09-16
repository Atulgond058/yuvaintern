import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import StatCard from "../components/StatCard.jsx";
import AppointmentCard from "../components/AppointmentCard.jsx";
import TriageBadge from "../components/TriageBadge.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import { getInitials, formatDate, formatTime } from "../utils/format.js";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [doctorsById, setDoctorsById] = useState({});
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [appts, doctors] = await Promise.all([api.listAppointments(), api.listDoctors()]);
        if (cancelled) return;

        const map = {};
        doctors.forEach((d) => {
          map[d.id] = { ...d, photoInitials: getInitials(d.name) };
        });
        setDoctorsById(map);
        setAppointments(appts);

        // Symptom logs are patient-only; doctors/admins won't have any.
        if (user?.role === "patient") {
          const triageLogs = await api.listTriageLogs();
          if (!cancelled) setLogs(triageLogs);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load your dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const displayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.status !== "cancelled")
      .map((a) => ({
        ...a,
        date: formatDate(a.slotStart),
        time: formatTime(a.slotStart),
        mode: "Video Consultation",
      }))
      .filter((a) => query === "" || a.reason.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(a.slotStart) - new Date(b.slotStart));
  }, [appointments, query]);

  const urgentCount = appointments.filter((a) => a.urgency === "urgent" || a.urgency === "emergency").length;

  if (loading) {
    return (
      <AppShell title="Loading…" breadcrumb="Patient dashboard">
        <p className="dash-loading">Loading your dashboard…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Welcome back, ${user?.name?.split(" ")[0] || ""}`} breadcrumb="Patient dashboard">
      {error && <div className="form-error" role="alert">{error}</div>}

      <section aria-label="Overview stats" className="dash-stats">
        <StatCard label="Upcoming visits" value={appointments.length} hint="All time" accent="accent" />
        <StatCard label="Needs attention" value={urgentCount} hint="Flagged by triage" accent="urgent" />
        <StatCard label="Symptom checks" value={logs.length} hint="Submitted" accent="routine" />
        <StatCard label="Role" value={user?.role || "—"} hint={user?.email} accent="info" />
      </section>

      <section id="appointments" aria-labelledby="appointments-heading" className="dash-section">
        <div className="dash-section__header">
          <h2 id="appointments-heading">Upcoming appointments</h2>
          <div className="dash-section__actions">
            <label className="dash-search">
              <span className="visually-hidden">Search appointments</span>
              <input
                type="search"
                placeholder="Search by reason…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <Button size="sm" onClick={() => navigate("/book-appointment")}>Book new</Button>
          </div>
        </div>

        {displayAppointments.length === 0 ? (
          <div className="dash-empty">
            <p>No appointments {query ? `match “${query}.”` : "yet."}</p>
            <p className="dash-empty__hint">
              {query ? "Try a different search." : "Book your first appointment to get started."}
            </p>
          </div>
        ) : (
          <div className="dash-list">
            {displayAppointments.map((a) => (
              <AppointmentCard key={a.id} appointment={a} doctor={doctorsById[a.doctorId]} />
            ))}
          </div>
        )}
      </section>

      {user?.role === "patient" && (
        <section id="symptom-checker" aria-labelledby="symptom-heading" className="dash-section">
          <div className="dash-section__header">
            <h2 id="symptom-heading">Recent symptom logs</h2>
            <Button variant="secondary" size="sm" onClick={() => navigate("/symptom-checker")}>
              Start a new symptom check
            </Button>
          </div>

          {logs.length === 0 ? (
            <div className="dash-empty">
              <p>No symptom checks yet.</p>
              <p className="dash-empty__hint">Run a symptom check to get an urgency assessment before booking.</p>
            </div>
          ) : (
            <div className="table-wrap" id="records">
              <table className="log-table">
                <caption className="visually-hidden">Recent symptom logs and their triage results</caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Summary</th>
                    <th scope="col">Triage result</th>
                    <th scope="col">Linked appointment</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td data-label="Date">{formatDate(log.createdAt)}</td>
                      <td data-label="Summary">{log.symptoms.join(", ")}</td>
                      <td data-label="Triage result"><TriageBadge level={log.triageResult} /></td>
                      <td data-label="Linked appointment">
                        {log.appointmentId ? (
                          <Link to={`/appointments/${log.appointmentId}`}>View appointment</Link>
                        ) : (
                          <span className="log-table__muted">Not yet scheduled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}
