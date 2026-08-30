import "./StatCard.css";

export default function StatCard({ label, value, hint, accent = "info" }) {
  return (
    <div className="stat-card" data-accent={accent}>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {hint && <p className="stat-card__hint">{hint}</p>}
    </div>
  );
}
