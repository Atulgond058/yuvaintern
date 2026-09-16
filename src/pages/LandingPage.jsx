import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import PulseDivider from "../components/PulseDivider.jsx";
import TriageBadge from "../components/TriageBadge.jsx";
import "./LandingPage.css";

const FEATURES = [
  { title: "Real-time scheduling", body: "Doctor availability syncs the moment it changes, so a slot you can see is a slot you can book — no double-booking, ever." },
  { title: "Automated triage", body: "A short symptom intake sorts each case into Routine, Urgent, or Emergency before a slot is even chosen, and routes it accordingly." },
  { title: "Browser-native video", body: "Peer-to-peer video and chat run straight in the browser — nothing to install, with a relay fallback so calls still connect." },
];

const STEPS = [
  { n: "01", title: "Describe what's going on", body: "Answer a short, structured set of questions about your symptoms, duration, and severity." },
  { n: "02", title: "Get matched by urgency", body: "The triage engine classifies your case and surfaces the next appropriate appointment slot." },
  { n: "03", title: "See a provider by video", body: "Join your consultation from any browser. Notes, records, and prescriptions stay in one place." },
];

export default function LandingPage() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Navbar />

      <main id="main">
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__copy">
              <p className="eyebrow">Telehealth, done properly</p>
              <h1 className="hero__headline">Care that keeps pace with how you actually feel.</h1>
              <p className="hero__sub">
                MediSync connects symptom triage, scheduling, secure video visits, and prescriptions into one calm,
                HIPAA-aware experience — for patients and the clinicians looking after them.
              </p>
              <div className="hero__actions">
                <Button as={Link} to="/register" size="md">Get started</Button>
                <Button as="a" href="#how-it-works" variant="secondary" size="md">See how it works</Button>
              </div>
              <p className="hero__trust">Encrypted end-to-end · No install required · Built for HIPAA-aligned care</p>
            </div>

            <div className="hero__panel" role="img" aria-label="Preview of a MediSync live consultation card showing a patient's vitals and an upcoming appointment">
              <div className="vitals-card">
                <div className="vitals-card__top">
                  <span className="vitals-card__live">
                    <span className="vitals-card__dot" aria-hidden="true"></span>
                    Live signal
                  </span>
                  <TriageBadge level="urgent" />
                </div>
                <svg className="vitals-card__wave" viewBox="0 0 400 90" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M0 45 H120 L136 45 L150 12 L166 78 L182 45 L198 45 L212 30 L226 60 L240 45 H400" />
                </svg>
                <div className="vitals-card__meta">
                  <div>
                    <p className="vitals-card__label">Next appointment</p>
                    <p className="vitals-card__value">Today · 10:30 AM</p>
                  </div>
                  <div>
                    <p className="vitals-card__label">Provider</p>
                    <p className="vitals-card__value">Dr. Samuel Osei</p>
                  </div>
                </div>
                <Button as={Link} to="/login" full size="sm">Sign in to view</Button>
              </div>
            </div>
          </div>
        </section>

        <div className="container"><PulseDivider /></div>

        <section className="section" id="features" aria-labelledby="features-heading">
          <div className="container">
            <h2 id="features-heading" className="section__heading">Everything a visit needs, nothing it doesn't</h2>
            <div className="feature-grid">
              {FEATURES.map((f) => (
                <article className="feature-card" key={f.title}>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--sunken" id="how-it-works" aria-labelledby="how-heading">
          <div className="container">
            <h2 id="how-heading" className="section__heading">From symptom to seen, in three steps</h2>
            <ol className="steps">
              {STEPS.map((s) => (
                <li className="steps__item" key={s.n}>
                  <span className="steps__number" aria-hidden="true">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section" id="for-providers" aria-labelledby="providers-heading">
          <div className="container providers">
            <div>
              <h2 id="providers-heading" className="section__heading">Built for clinicians too</h2>
              <p className="providers__body">
                Manage availability, review pre-triaged cases before a visit even starts, and issue signed
                e-prescriptions without leaving the consultation window.
              </p>
              <Button as={Link} to="/register" variant="secondary">Join as a provider</Button>
            </div>
            <ul className="providers__list">
              <li>Conflict-free calendar sync across every clinic</li>
              <li>Encrypted consultation notes, searchable by patient</li>
              <li>One-click, digitally signed PDF prescriptions</li>
            </ul>
          </div>
        </section>

        <section className="cta">
          <div className="container cta__inner">
            <h2>Your next visit is a few clicks away.</h2>
            <Button as={Link} to="/register" size="md">Get started</Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
