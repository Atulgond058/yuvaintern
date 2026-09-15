import { useEffect } from "react";
import { useState, useEffect } from "react";
import { api } from "../api/client.js";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import StatCard from "../components/StatCard.jsx";
import AppointmentCard from "../components/AppointmentCard.jsx";
import TriageBadge from "../components/TriageBadge.jsx";
import Button from "../components/Button.jsx";
import { appointments, symptomLogs, getDoctorById, currentUser } from "../data/mockData.js";
import "./Dashboard.css";

export default function Dashboard() {
  useEffect(() => {
    api.listDoctors()
      .then((data) => console.log("✅ Backend connected! Doctors:", data.doctors))
      .catch((err) => console.error("❌ Backend connection failed:", err.message));
  }, []);
  
  const [query, setQuery] = useState("");

  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => a.reason.toLowerCase().includes(query.toLowerCase()) || query === "")
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [query]
  );

  const activeRx = appointments.reduce((sum, a) => sum + a.prescriptions.length, 0);
  const urgentCount = appointments.filter((a) => a.urgency === "urgent" || a.urgency === "emergency").length;

  return (
    <AppShell title={`Welcome back, ${currentUser.name.split(" ")[0]}`} breadcrumb="Patient dashboard">
      <section aria-label="Overview stats" className="dash-stats">
        <StatCard label="Upcoming visits" value={appointments.length} hint="Next 14 days" accent="accent" />
        <StatCard label="Needs attention" value={urgentCount} hint="Flagged by triage" accent="urgent" />
        <StatCard label="Active prescriptions" value={activeRx} hint="Currently in use" accent="routine" />
        <StatCard label="Unread messages" value={2} hint="From your care team" accent="info" />
      </section>

      <section id="appointments" aria-labelledby="appointments-heading" className="dash-section">
        <div className="dash-section__header">
          <h2 id="appointments-heading">Upcoming appointments</h2>
          <label className="dash-search">
            <span className="visually-hidden">Search appointments</span>
            <input
              type="search"
              placeholder="Search by reason…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        {upcoming.length === 0 ? (
          <div className="dash-empty">
            <p>No appointments match “{query}.”</p>
            <p className="dash-empty__hint">Try a different search, or start a new symptom check to book one.</p>
          </div>
        ) : (
          <div className="dash-list">
            {upcoming.map((a) => (
              <AppointmentCard key={a.id} appointment={a} doctor={getDoctorById(a.doctorId)} />
            ))}
          </div>
        )}
      </section>

      <section id="symptom-checker" aria-labelledby="symptom-heading" className="dash-section">
        <div className="dash-section__header">
          <h2 id="symptom-heading">Recent symptom logs</h2>
          <Button variant="secondary" size="sm">Start a new symptom check</Button>
        </div>

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
              {symptomLogs.map((log) => (
                <tr key={log.id}>
                  <td data-label="Date">{log.date}</td>
                  <td data-label="Summary">{log.summary}</td>
                  <td data-label="Triage result"><TriageBadge level={log.urgency} /></td>
                  <td data-label="Linked appointment">
                    {log.linkedAppointmentId ? (
                      <Link to={`/appointments/${log.linkedAppointmentId}`}>View appointment</Link>
                    ) : (
                      <span className="log-table__muted">Not yet scheduled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
