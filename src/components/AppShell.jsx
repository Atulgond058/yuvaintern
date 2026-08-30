import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { currentUser } from "../data/mockData.js";
import "./AppShell.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: "\u2302" },
  { to: "/dashboard#appointments", label: "Appointments", icon: "\u25A4" },
  { to: "/dashboard#symptom-checker", label: "Symptom Checker", icon: "\u2795" },
  { to: "/dashboard#records", label: "Records", icon: "\u2637" },
];

export default function AppShell({ children, title, breadcrumb }) {
  const [navOpen, setNavOpen] = useState(false);

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
              <Link
                key={item.label}
                to={item.to}
                className="app-sidebar__link"
                onClick={() => setNavOpen(false)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            )
          )}
        </nav>
        <div className="app-sidebar__footer">
          <Link to="/" className="app-sidebar__link">
            <span aria-hidden="true">&larr;</span>
            Back to homepage
          </Link>
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
            <span className="app-topbar__avatar" aria-hidden="true">{currentUser.avatarInitials}</span>
            <span className="app-topbar__name">{currentUser.name}</span>
          </div>
        </header>

        <main id="app-main" className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
