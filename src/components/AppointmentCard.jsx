import { Link } from "react-router-dom";
import TriageBadge from "./TriageBadge.jsx";
import "./AppointmentCard.css";

export default function AppointmentCard({ appointment, doctor }) {
  return (
    <Link to={`/appointments/${appointment.id}`} className="appt-card">
      <div className="appt-card__avatar" aria-hidden="true">{doctor.photoInitials}</div>
      <div className="appt-card__body">
        <div className="appt-card__row">
          <p className="appt-card__doctor">{doctor.name}</p>
          <TriageBadge level={appointment.urgency} />
        </div>
        <p className="appt-card__reason">{appointment.reason}</p>
        <p className="appt-card__meta">
          {appointment.date} &middot; {appointment.time} &middot; {appointment.mode}
        </p>
      </div>
      <span className="appt-card__chevron" aria-hidden="true">&rarr;</span>
    </Link>
  );
}
