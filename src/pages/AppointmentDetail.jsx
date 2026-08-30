import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import Button from "../components/Button.jsx";
import TriageBadge from "../components/TriageBadge.jsx";
import { getAppointmentById, getDoctorById } from "../data/mockData.js";
import "./AppointmentDetail.css";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "notes", label: "Consultation Notes" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "documents", label: "Documents" },
];

export default function AppointmentDetail() {
  const { id } = useParams();
  const appointment = getAppointmentById(id);
  const [activeTab, setActiveTab] = useState("overview");

  if (!appointment) {
    return (
      <AppShell title="Appointment not found" breadcrumb="Dashboard / Appointments">
        <div className="not-found">
          <p>We couldn't find an appointment with id <code>{id}</code>.</p>
          <Button as={Link} to="/dashboard" variant="secondary">Back to dashboard</Button>
        </div>
      </AppShell>
    );
  }

  const doctor = getDoctorById(appointment.doctorId);

  return (
    <AppShell title="Appointment details" breadcrumb={
      <Link to="/dashboard" className="breadcrumb-link">&larr; Dashboard</Link>
    }>
      <div className="detail-grid">
        {/* -------- Main column -------- */}
        <div className="detail-main">
          <div className="detail-header">
            <div className="detail-header__doctor">
              <span className="detail-header__avatar" aria-hidden="true">{doctor.photoInitials}</span>
              <div>
                <h2>{doctor.name}</h2>
                <p>{doctor.specialization} &middot; License {doctor.licenseNo}</p>
              </div>
            </div>
            <TriageBadge level={appointment.urgency} />
          </div>

          <div role="tablist" aria-label="Appointment sections" className="tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                className={`tabs__button ${activeTab === tab.id ? "tabs__button--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" className="tab-panel">
              <h3>Reason for visit</h3>
              <p>{appointment.reason}</p>
              <h3>Status</h3>
              <p>{appointment.status}</p>
            </div>
          )}

          {activeTab === "notes" && (
            <div role="tabpanel" id="panel-notes" aria-labelledby="tab-notes" className="tab-panel">
              <h3>Consultation notes</h3>
              <p className="tab-panel__encrypted">🔒 Encrypted — visible to you and your care team only</p>
              <p>{appointment.notes}</p>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div role="tabpanel" id="panel-prescriptions" aria-labelledby="tab-prescriptions" className="tab-panel">
              <h3>Prescriptions</h3>
              {appointment.prescriptions.length === 0 ? (
                <p className="tab-panel__empty">No prescriptions have been issued for this appointment yet.</p>
              ) : (
                <ul className="rx-list">
                  {appointment.prescriptions.map((rx) => (
                    <li key={rx.id} className="rx-list__item">
                      <div>
                        <p className="rx-list__med">{rx.medication}</p>
                        <p className="rx-list__meta">Issued {rx.issuedOn} &middot; Signed by {rx.signedBy}</p>
                      </div>
                      <Button variant="secondary" size="sm">Download PDF</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div role="tabpanel" id="panel-documents" aria-labelledby="tab-documents" className="tab-panel">
              <h3>Medical documents</h3>
              {appointment.documents.length === 0 ? (
                <p className="tab-panel__empty">No documents attached to this appointment.</p>
              ) : (
                <ul className="doc-list">
                  {appointment.documents.map((doc) => (
                    <li key={doc.id} className="doc-list__item">
                      <span className="doc-list__icon" aria-hidden="true">&#128196;</span>
                      <div>
                        <p className="doc-list__name">{doc.name}</p>
                        <p className="doc-list__type">{doc.type}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* -------- Sidebar column -------- */}
        <aside className="detail-side">
          <div className="detail-side__card">
            <h3>Appointment</h3>
            <dl className="detail-side__list">
              <div><dt>Date</dt><dd>{appointment.date}</dd></div>
              <div><dt>Time</dt><dd>{appointment.time}</dd></div>
              <div><dt>Mode</dt><dd>{appointment.mode}</dd></div>
              <div><dt>Status</dt><dd>{appointment.status}</dd></div>
            </dl>
            <Button full>Join video call</Button>
            <Button full variant="secondary">Reschedule</Button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
