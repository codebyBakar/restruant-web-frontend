import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--cream)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display), serif", fontSize: 30, fontWeight: 700, color: "var(--ink)", marginBottom: 14 }}>Paratha</div>
          <div className="skeleton" style={{ width: 120, height: 4, borderRadius: 2, margin: "0 auto" }} />
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/404" replace />;

  return children;
}
