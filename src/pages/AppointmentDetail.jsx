import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import Button from "../components/Button.jsx";
import TriageBadge from "../components/TriageBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";
import { getInitials, formatDate, formatTime } from "../utils/format.js";
import "./AppointmentDetail.css";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "notes", label: "Consultation Notes" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "documents", label: "Documents" },
];

export default function AppointmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      setError("");
      try {
        const appt = await api.getAppointment(id);
        if (cancelled) return;
        setAppointment(appt);

        const doc = await api.getDoctor(appt.doctorId);
        if (!cancelled) setDoctor({ ...doc, photoInitials: getInitials(doc.name) });

        // Prescriptions/records are scoped to the patient; only fetch if we can (self, or doctor/admin).
        if (user?.role !== "doctor" || true) {
          try {
            const [rx, docs] = await Promise.all([
              api.listPatientPrescriptions(appt.patientId),
              api.listPatientRecords(appt.patientId),
            ]);
            if (!cancelled) {
              setPrescriptions(rx);
              setRecords(docs);
            }
          } catch {
            // Non-fatal: caller may not have permission; tabs will just show empty.
          }
        }
      } catch (err) {
        if (cancelled) return;
        if (err.status === 404) setNotFound(true);
        else setError(err.message || "Could not load this appointment.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  async function handleCancel() {
    setCancelling(true);
    try {
      const updated = await api.cancelAppointment(id);
      setAppointment(updated);
    } catch (err) {
      setError(err.message || "Could not cancel this appointment.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <AppShell title="Loading…" breadcrumb="Dashboard / Appointments">
        <p className="dash-loading">Loading appointment…</p>
      </AppShell>
    );
  }

  if (notFound || !appointment) {
    return (
      <AppShell title="Appointment not found" breadcrumb="Dashboard / Appointments">
        <div className="not-found">
          <p>We couldn't find an appointment with id <code>{id}</code>.</p>
          <Button as={Link} to="/dashboard" variant="secondary">Back to dashboard</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Appointment details" breadcrumb={<Link to="/dashboard" className="breadcrumb-link">&larr; Dashboard</Link>}>
      {error && <div className="form-error" role="alert">{error}</div>}

      <div className="detail-grid">
        <div className="detail-main">
          <div className="detail-header">
            <div className="detail-header__doctor">
              <span className="detail-header__avatar" aria-hidden="true">{doctor?.photoInitials}</span>
              <div>
                <h2>{doctor?.name}</h2>
                <p>{doctor?.specialization} &middot; License {doctor?.licenseNo}</p>
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
              <p style={{ textTransform: "capitalize" }}>{appointment.status}</p>
            </div>
          )}

          {activeTab === "notes" && (
            <div role="tabpanel" id="panel-notes" aria-labelledby="tab-notes" className="tab-panel">
              <h3>Consultation notes</h3>
              <p className="tab-panel__empty">
                Notes are recorded by your provider during the consultation and will appear here once the visit is complete.
              </p>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div role="tabpanel" id="panel-prescriptions" aria-labelledby="tab-prescriptions" className="tab-panel">
              <h3>Prescriptions</h3>
              {prescriptions.length === 0 ? (
                <p className="tab-panel__empty">No prescriptions have been issued yet.</p>
              ) : (
                <ul className="rx-list">
                  {prescriptions.map((rx) => (
                    <li key={rx.id} className="rx-list__item">
                      <div>
                        <p className="rx-list__med">{rx.medication} — {rx.dosage}</p>
                        <p className="rx-list__meta">Issued {formatDate(rx.issuedOn)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div role="tabpanel" id="panel-documents" aria-labelledby="tab-documents" className="tab-panel">
              <h3>Medical documents</h3>
              {records.length === 0 ? (
                <p className="tab-panel__empty">No documents on file.</p>
              ) : (
                <ul className="doc-list">
                  {records.map((doc) => (
                    <li key={doc.id} className="doc-list__item">
                      <span className="doc-list__icon" aria-hidden="true">&#128196;</span>
                      <div>
                        <p className="doc-list__name">{doc.fileName}</p>
                        <p className="doc-list__type">{doc.docType}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <aside className="detail-side">
          <div className="detail-side__card">
            <h3>Appointment</h3>
            <dl className="detail-side__list">
              <div><dt>Date</dt><dd>{formatDate(appointment.slotStart)}</dd></div>
              <div><dt>Time</dt><dd>{formatTime(appointment.slotStart)}</dd></div>
              <div><dt>Mode</dt><dd>Video Consultation</dd></div>
              <div><dt>Status</dt><dd style={{ textTransform: "capitalize" }}>{appointment.status}</dd></div>
            </dl>
            <Button full disabled={appointment.status === "cancelled"}>Join video call</Button>
            {appointment.status !== "cancelled" && (
              <Button full variant="danger" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? "Cancelling…" : "Cancel appointment"}
              </Button>
            )}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
