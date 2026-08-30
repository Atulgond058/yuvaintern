import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", textAlign: "center", padding: "24px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2.4rem", margin: 0 }}>Page not found</h1>
      <p style={{ color: "var(--color-muted)", maxWidth: "40ch" }}>
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button as={Link} to="/">Back to homepage</Button>
    </div>
  );
}
