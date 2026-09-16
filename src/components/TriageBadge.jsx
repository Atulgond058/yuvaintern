const LABELS = {
  emergency: "Emergency",
  urgent: "Urgent",
  routine: "Routine",
  info: "Info",
};

export default function TriageBadge({ level = "routine", label }) {
  return (
    <span className="badge" data-level={level}>
      {label || LABELS[level] || level}
    </span>
  );
}
