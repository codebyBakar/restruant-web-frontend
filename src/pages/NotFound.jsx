import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container" style={{ padding: "120px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 80, color: "var(--paprika)" }}>404</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 24 }}>This page must have rolled away.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  );
}
