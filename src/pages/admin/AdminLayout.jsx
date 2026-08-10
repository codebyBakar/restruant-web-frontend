import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  SquaresFour,
  Cube,
  Tag,
  Folder,
  ShoppingCart,
  Ticket,
  Gear,
  SignOut,
  ArrowSquareOut,
  List,
  X,
} from "phosphor-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSettings } from "../../hooks/useSettings.js";
import "../../components/admin/admin.css";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: SquaresFour, end: true },
  { to: "/admin/products", label: "Products", icon: Cube },
  { to: "/admin/categories", label: "Categories", icon: Folder },
  { to: "/admin/tags", label: "Tags", icon: Tag },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/deals", label: "Deals", icon: Ticket },
  { to: "/admin/settings", label: "Settings", icon: Gear },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/prathachaiadmin@2026");
  };

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <button className="admin-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <List size={22} />
        </button>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700 }}>{settings?.siteName || "Pratha"}</div>
        <div style={{ fontSize: 11, color: "rgba(251,243,230,0.6)", marginLeft: "auto" }}>Admin</div>
      </header>

      {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div style={{ padding: "26px 24px", borderBottom: "1px solid rgba(251,243,230,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{settings?.siteName || "Pratha"}</div>
              <div style={{ fontSize: 11.5, color: "rgba(251,243,230,0.5)", marginTop: 3 }}>Admin Panel</div>
            </div>
          </div>
          <button className="admin-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav style={{ flex: 1, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 3 }}>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 14px",
                borderRadius: 11,
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? "#fff" : "rgba(251,243,230,0.65)",
                background: isActive ? "rgba(194,65,12,0.85)" : "transparent",
              })}
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: 14, borderTop: "1px solid rgba(251,243,230,0.1)", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ padding: "10px 14px 2px", minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "Admin"}</div>
            <div style={{ fontSize: 11.5, color: "rgba(251,243,230,0.5)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || ""}</div>
          </div>
          <a href="/" target="_blank" rel="noreferrer" onClick={() => setSidebarOpen(false)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", borderRadius: 11, fontSize: 13.5, color: "rgba(251,243,230,0.65)" }}>
            <ArrowSquareOut size={17} /> View Site
          </a>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", borderRadius: 11, fontSize: 13.5, color: "rgba(251,243,230,0.65)", background: "none", border: "none", textAlign: "left" }}>
            <SignOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
