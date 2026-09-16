import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell.jsx";
import Button from "../components/Button.jsx";
import TriageBadge from "../components/TriageBadge.jsx";
import { api } from "../api/client.js";
import "./SymptomChecker.css";

export default function SymptomChecker() {
  const navigate = useNavigate();
  const [symptomsText, setSymptomsText] = useState("");
  const [durationDays, setDurationDays] = useState(1);
  const [severity, setSeverity] = useState(2);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);

    const symptoms = symptomsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (symptoms.length === 0) {
      setError("Please describe at least one symptom.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await api.submitTriage({ symptoms, durationDays: Number(durationDays), severity: Number(severity) });
      setResult(data);
    } catch (err) {
      setError(err.message || "Could not submit your symptoms. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Symptom Checker" breadcrumb={<Link to="/dashboard" className="breadcrumb-link">&larr; Dashboard</Link>}>
      <div className="symptom-checker">
        <div className="symptom-checker__form-card">
          <p className="symptom-checker__intro">
            Describe what you're experiencing and we'll route you to the right level of care.
          </p>

          {error && <div className="form-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="symptoms">Symptoms</label>
              <textarea
                id="symptoms"
                placeholder="e.g. chest pain, shortness of breath"
                value={symptomsText}
                onChange={(e) => setSymptomsText(e.target.value)}
                required
              />
              <p className="form-hint">Separate multiple symptoms with commas.</p>
            </div>

            <div className="form-field">
              <label htmlFor="duration">How many days have you had these symptoms?</label>
              <input
                id="duration"
                type="number"
                min={0}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="severity">Severity: {severity} / 5</label>
              <input
                id="severity"
                type="range"
                min={1}
                max={5}
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              />
            </div>

            <Button type="submit" full disabled={submitting}>
              {submitting ? "Assessing…" : "Check my symptoms"}
            </Button>
          </form>
        </div>

        {result && (
          <div className="symptom-checker__result">
            <div className="symptom-checker__result-header">
              <h2>Assessment result</h2>
              <TriageBadge level={result.log.triageResult} />
            </div>
            <ul className="symptom-checker__reasons">
              {result.reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
            <div className="symptom-checker__actions">
              <Button onClick={() => navigate("/book-appointment")}>Book an appointment</Button>
              <Button variant="secondary" onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
