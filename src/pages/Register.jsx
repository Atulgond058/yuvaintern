import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "../components/Button.jsx";
import "./Auth.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    dob: "",
    gender: "",
    specialization: "",
    licenseNo: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.details?.map((d) => d.message).join(" ") || err.message || "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true">
            <path d="M4 17 H11 L14 9 L18 24 L21 17 H28" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          MediSync
        </Link>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Get started with MediSync in under a minute.</p>

        {error && <div className="form-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label>I am a</label>
            <div className="auth-role-toggle">
              <button
                type="button"
                className={form.role === "patient" ? "active" : ""}
                onClick={() => setForm((f) => ({ ...f, role: "patient" }))}
              >
                Patient
              </button>
              <button
                type="button"
                className={form.role === "doctor" ? "active" : ""}
                onClick={() => setForm((f) => ({ ...f, role: "doctor" }))}
              >
                Doctor
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={update("name")} />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required value={form.email} onChange={update("email")} />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={update("password")}
            />
            <p className="form-hint">At least 8 characters.</p>
          </div>

          {form.role === "patient" && (
            <>
              <div className="form-field">
                <label htmlFor="dob">Date of birth (optional)</label>
                <input id="dob" type="date" value={form.dob} onChange={update("dob")} />
              </div>
              <div className="form-field">
                <label htmlFor="gender">Gender (optional)</label>
                <input id="gender" value={form.gender} onChange={update("gender")} />
              </div>
            </>
          )}

          {form.role === "doctor" && (
            <>
              <div className="form-field">
                <label htmlFor="specialization">Specialization</label>
                <input
                  id="specialization"
                  placeholder="e.g. Cardiology"
                  value={form.specialization}
                  onChange={update("specialization")}
                />
              </div>
              <div className="form-field">
                <label htmlFor="licenseNo">License number</label>
                <input id="licenseNo" placeholder="e.g. MD-12345" value={form.licenseNo} onChange={update("licenseNo")} />
              </div>
            </>
          )}

          <Button type="submit" full disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
