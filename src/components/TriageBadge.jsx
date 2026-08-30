const LABELS = {
  emergency: "Emergency",
  urgent: "Urgent",
  routine: "Routine",
  info: "Info",
};

/**
 * TriageBadge — renders the shared urgency vocabulary (emergency / urgent /
 * routine) consistently across the dashboard, symptom log, and detail view.
 */
export default function TriageBadge({ level = "routine", label }) {
  return (
    <span className="badge" data-level={level}>
      {label || LABELS[level] || level}
    </span>
  );
}
