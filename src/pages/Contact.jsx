import { useState } from "react";
import toast from "react-hot-toast";
import { MapPin, Phone, Envelope, Clock, PaperPlaneTilt } from "phosphor-react";
import { useSettings } from "../hooks/useSettings.js";
import api from "../api/axios.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9][0-9\s\-()]{6,19}$/;

export default function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", website: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();

    if (name.length < 2) {
      toast.error("Please enter your name (at least 2 characters)");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!PHONE_RE.test(phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (message.length < 10) {
      toast.error("Please write a message (at least 10 characters)");
      return;
    }
    if (message.length > 5000) {
      toast.error("Message is too long (max 5000 characters)");
      return;
    }

    setSending(true);
    try {
      const { data } = await api.post("/contact", {
        name,
        email,
        phone,
        subject: "",
        message,
        website: form.website,
      });
      toast.success(data.message || "Thanks for reaching out! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", message: "", website: "" });
    } catch (err) {
      const field = err.response?.data?.errors?.[0]?.field;
      if (field === "website") {
        toast.error("Please leave the website field empty and submit again.");
      } else {
        toast.error(err.response?.data?.message || "Could not send your message. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container" style={{ padding: "150px 24px 90px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50 }} id="contact-grid">
      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Get in touch</div>
        <h1 style={{ fontSize: "clamp(24px,3vw,32px)", marginBottom: 16 }}>We'd love to hear from you</h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <ContactItem icon={<MapPin size={20} />} label="Address" value={settings?.address || "MM Alam Road, Gulberg III, Lahore"} />
          <ContactItem icon={<Phone size={20} />} label="Phone" value={settings?.phone || "+92 300 1234567"} />
          <ContactItem icon={<Envelope size={20} />} label="Email" value={settings?.email || "hello@pratha.com"} />
          <ContactItem icon={<Clock size={20} />} label="Hours" value={settings?.openingHours || "11:00 AM - 12:00 AM, All Days"} />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 22, padding: 20, display: "flex", flexDirection: "column", gap: 8, height: "fit-content" }}>
        <div aria-hidden="true" style={{ display: "none" }}>
          <label htmlFor="website" tabIndex={-1}>Website</label>
          <input id="website" type="text" name="website" autoComplete="off" tabIndex={-1} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>
        <label className="form-label">Full Name</label>
        <input required placeholder="Enter your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" />
        <label className="form-label">Email Address</label>
        <input required type="email" placeholder="Enter your email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" />
        <label className="form-label">Phone Number</label>
        <input required type="number" placeholder="Enter your phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="form-input" pattern="[0-9+\-() ]*" />
        <label className="form-label">Message</label>
        <textarea required rows={3} placeholder="Write your message here..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="form-input" />
        <button type="submit" className="btn btn-primary" style={{ height: 42, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} disabled={sending}>
          <PaperPlaneTilt size={18} />
          {sending ? "Sending..." : "Send Message"}
        </button>
      </form>

      <div style={{ gridColumn: "1 / -1", marginTop: 10 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Find us</div>
        <h2 style={{ fontSize: "clamp(20px,2.4vw,26px)", marginBottom: 12 }}>Our Location</h2>
        <div style={{ borderRadius: 22, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "var(--shadow)" }}>
          <iframe
            title="Pratha location"
            src="https://maps.google.com/maps?q=9%20Blacker%20Road%2C%20Huddersfield%2C%20HD1%205HU&t=&z=16&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="300"
            style={{ border: 0, display: "block" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>

      <style>{`
        .form-label { font-size: 12px; font-weight: 600; color: var(--ink-soft); margin-bottom: 0; }
        .form-input { padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--line); font-family: inherit; font-size: 13px; background: #fff; }
        .form-input:focus { outline: none; border-color: var(--paprika); }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 800px) { #contact-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function ContactItem({ icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--cream-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--paprika)", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}
