import { Link, NavLink } from "react-router-dom";
import Button from "./Button.jsx";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="MediSync home">
          <span className="navbar__mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="26" height="26">
              <path d="M4 17 H11 L14 9 L18 24 L21 17 H28" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          MediSync
        </Link>

        <nav aria-label="Primary" className="navbar__links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#for-providers">For providers</a>
        </nav>

        <div className="navbar__actions">
          <NavLink to="/login" className="navbar__signin">Sign in</NavLink>
          <Button as={Link} to="/register" size="sm">Get started</Button>
        </div>
      </div>
    </header>
  );
}
