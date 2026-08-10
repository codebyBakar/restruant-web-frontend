import { Link } from "react-router-dom";
import { MapPin, Phone, Envelope, Copyright } from "phosphor-react";
import { useSettings } from "../hooks/useSettings.js";

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer style={{ background: "var(--charcoal)", color: "var(--cream)", marginTop: 40 }}>
      <div className="roti-edge on-charcoal" style={{ transform: "rotate(180deg)", background: "var(--cream)" }} />
      <div className="footer-grid" style={{ padding: "56px 24px 30px", display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr 1.2fr", gap: 36 }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
            {settings?.siteName || "Pratha"}
          </div>
          <p style={{ color: "rgba(251,243,230,0.65)", fontSize: 14.5, lineHeight: 1.7, maxWidth: 280 }}>
            {settings?.tagline || "Authentic parathas, rolls and combos - rolled fresh, delivered hot."}
          </p>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 13.5, letterSpacing: ".04em", color: "var(--turmeric)" }}>EXPLORE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14.5 }}>
            <Link to="/menu" style={{ color: "rgba(251,243,230,0.8)" }}>Full Menu</Link>
            <Link to="/deals" style={{ color: "rgba(251,243,230,0.8)" }}>Deals & Offers</Link>
            <Link to="/track" style={{ color: "rgba(251,243,230,0.8)" }}>Track Order</Link>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 13.5, letterSpacing: ".04em", color: "var(--turmeric)" }}>COMPANY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 14.5 }}>
            <Link to="/about" style={{ color: "rgba(251,243,230,0.8)" }}>About Us</Link>
            <Link to="/contact" style={{ color: "rgba(251,243,230,0.8)" }}>Contact</Link>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 13.5, letterSpacing: ".04em", color: "var(--turmeric)" }}>VISIT US</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14, color: "rgba(251,243,230,0.8)" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <MapPin size={17} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{settings?.address || "MM Alam Road, Gulberg III, Lahore"}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Phone size={17} />
              <span>{settings?.phone || "+92 300 1234567"}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Envelope size={17} />
              <span>{settings?.email || "hello@pratha.com"}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(251,243,230,0.12)", padding: "18px 24px", textAlign: "center", fontSize: 12.5, color: "rgba(251,243,230,0.45)" }}>
        &copy; {new Date().getFullYear()} {settings?.siteName || "Pratha"}. All rights reserved.
      </div>
      <style>{`
        @media (max-width: 860px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 520px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
