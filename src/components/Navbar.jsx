import { useEffect, useState, useCallback } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, List, X } from "phosphor-react";
import { useCart } from "../context/CartContext.jsx";
import { useUI } from "../context/UIContext.jsx";
import { useSettings } from "../hooks/useSettings.js";

const allLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/deals", label: "Deals" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
 
];

export default function Navbar() {
  const { itemCount } = useCart();
  const { openCart } = useUI();
  const { settings } = useSettings();
  const siteName = settings?.siteName || "Pratha";
  const logoUrl = settings?.logo?.url || "/nav-logo.png";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = (e) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    closeDrawer();
  };

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > 80 && y > lastScrollY);
      lastScrollY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: hidden ? "transparent" : "var(--charcoal)",
          borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
          transform: hidden ? "translateY(-130%)" : "translateY(0)",
          transition: "transform .35s ease, border .35s ease",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <button
            className="mobile-menu-btn"
            style={{ display: "none", background: "var(--cream)", border: "none", color: "var(--charcoal)", cursor: "pointer", padding: "9px 14px", borderRadius: 999, marginTop: 5 }}
            onClick={drawerOpen ? closeDrawer : openDrawer}
            aria-label="Toggle menu"
          >
            {drawerOpen ? <X size={22} /> : <List size={22} />}
          </button>

          <Link to="/" onClick={handleLogoClick} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img className="img-logo" src={logoUrl} alt={siteName} style={{ height: 90, width: 'auto', marginTop: 5, marginLeft: -20 }} />
          </Link>

          <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 32, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            {allLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                style={({ isActive }) => ({
                  fontSize: 14,
                  fontWeight: 600,
                  color: isActive ? "var(--paprika)" : "var(--cream)",
                  letterSpacing: "0.3px",
                })}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <button
            className="nav-cart-btn"
            onClick={openCart}
            aria-label={`Open cart, ${itemCount} items`}
            style={{
              position: "relative",
              borderRadius: 999,
              padding: "9px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1.5px solid rgba(251,243,230,0.2)",
              background: "var(--cream)",
              color: "var(--charcoal)",
              cursor: "pointer",
              fontSize: 13.5,
              fontWeight: 700,
              fontFamily: "inherit",
              transition: "background .25s ease, color .25s ease, border-color .25s ease, transform .25s ease, box-shadow .25s ease",
            }}
          >
            <ShoppingBag size={17} />
            <span className="cart-label">Cart</span>
            {itemCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "var(--paprika)",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className={`drawer-overlay${drawerOpen ? " open" : ""}`} onClick={closeDrawer} role="button" aria-label="Close menu" tabIndex={-1} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); closeDrawer(); } }} />
      <aside className={`drawer${drawerOpen ? " open" : ""}`}>
        <button className="drawer__close-btn" onClick={closeDrawer} aria-label="Close menu">
          <X size={28} />
        </button>
        <nav className="drawer__nav">
          {allLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `drawer__link${isActive ? " active" : ""}`}
              onClick={closeDrawer}
            >
              {l.label}
            </NavLink>
          ))}
          <button className="btn btn-primary drawer__track-btn" onClick={() => { navigate("/track"); closeDrawer(); }}>
            Track Order
          </button>
        </nav>
      </aside>

      <style>{`
      .nav-cart-btn:hover {
          background: var(--charcoal) !important;
          color: var(--cream) !important;
          border-color: var(--cream) !important;
          transform: scale(1.04);
          box-shadow: 0 4px 16px rgba(251,243,230,0.2);
        }
        .drawer-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0,0,0,0.4);
          display: none;
          opacity: 0;
          transition: opacity .35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .drawer-overlay.open {
          display: block;
          opacity: 1;
        }
        .drawer {
          position: fixed;
          inset: 0;
          z-index: 201;
          width: 100%;
          height: 100%;
          background: var(--cream);
          transform: translateY(100%);
          transition: transform .35s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 100px 20px 40px;
          overflow: hidden;
        }
        .drawer.open {
          transform: translateY(0);
        }
        .drawer__close-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 300;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--ink);
          cursor: pointer;
          transition: background .3s cubic-bezier(0.4, 0, 0.2, 1), transform .3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .drawer__close-btn:hover {
          background: rgba(47,33,23,0.06);
          transform: rotate(90deg) scale(1.1);
        }
        .drawer__nav {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 28px;
          text-align: center;
          width: 100%;
          max-width: 400px;
          margin-top: 25px;
        }
        .drawer__link {
          font-size: 36px;
          font-weight: 800;
          color: var(--ink);
          text-decoration: none;
          transition: color .3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          padding: 4px 0;
          line-height: 1.1;
        }
        .drawer__link:hover {
          color: var(--paprika);
        }
        .drawer__link.active {
          color: var(--paprika);
        }
        .drawer__track-btn {
          margin-top: 20px;
          width: 100%;
        }
        @media (min-width: 861px) {
          .drawer-overlay, .drawer { display: none !important; }
        }
        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          header .container { height: 96px !important; padding-top: 0px !important; padding-bottom: 8px !important; }
          .cart-label { display: none; }
          .img-logo { height: 72px !important; margin: 10px 0 0 28px !important; }
          .mobile-menu-btn { margin-top: 10px !important; }
          header .nav-cart-btn { margin-top: 10px !important; }
        }
      `}</style>
    </>
  );
}
