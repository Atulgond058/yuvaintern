import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getInitials } from "../utils/format.js";
import "./AppShell.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "\u2302" },
  { to: "/dashboard#appointments", label: "Appointments", icon: "\u25A4" },
  { to: "/symptom-checker", label: "Symptom Checker", icon: "\u2795" },
  { to: "/book-appointment", label: "Book Appointment", icon: "\u2795" },
];

export default function AppShell({ children, title, breadcrumb }) {
  const [navOpen, setNavOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <a href="#app-main" className="skip-link">Skip to main content</a>

      <aside className={`app-sidebar ${navOpen ? "app-sidebar--open" : ""}`}>
        <Link to="/" className="app-sidebar__brand">
          <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
            <path d="M4 17 H11 L14 9 L18 24 L21 17 H28" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          MediSync
        </Link>
        <nav aria-label="Dashboard" className="app-sidebar__nav">
          {NAV_ITEMS.map((item) =>
            item.to === "/dashboard" ? (
              <NavLink
                key={item.label}
                to={item.to}
                end
                className={({ isActive }) => `app-sidebar__link ${isActive ? "app-sidebar__link--active" : ""}`}
                onClick={() => setNavOpen(false)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => `app-sidebar__link ${isActive ? "app-sidebar__link--active" : ""}`}
                onClick={() => setNavOpen(false)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          )}
        </nav>
        <div className="app-sidebar__footer">
          <Link to="/" className="app-sidebar__link">
            <span aria-hidden="true">&larr;</span>
            Back to homepage
          </Link>
          <button className="app-sidebar__link app-sidebar__logout" onClick={logout} type="button">
            <span aria-hidden="true">&#9211;</span>
            Log out
          </button>
        </div>
      </aside>

      <div className="app-content">
        <header className="app-topbar">
          <button
            className="app-topbar__menu"
            aria-expanded={navOpen}
            aria-label="Toggle navigation menu"
            onClick={() => setNavOpen((v) => !v)}
          >
            &#9776;
          </button>

          <div>
            {breadcrumb && <p className="app-topbar__breadcrumb">{breadcrumb}</p>}
            <h1 className="app-topbar__title">{title}</h1>
          </div>

          <div className="app-topbar__user">
            <span className="app-topbar__avatar" aria-hidden="true">{getInitials(user?.name || "")}</span>
            <span className="app-topbar__name">{user?.name}</span>
          </div>
        </header>

        <main id="app-main" className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
