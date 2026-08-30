import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div>
          <p className="site-footer__brand">MediSync</p>
          <p className="site-footer__tag">Care, connected — securely.</p>
        </div>
        <nav aria-label="Footer" className="site-footer__links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#for-providers">For providers</a>
          <a href="/dashboard">Patient sign in</a>
        </nav>
        <p className="site-footer__legal">
          © 2026 MediSync. Built for demonstration purposes as part of an internship project.
        </p>
      </div>
    </footer>
  );
}
