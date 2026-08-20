import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { m } from "framer-motion";
import {
  ArrowRight,
  Bicycle,
  Clock,
  Drop,
  Envelope,
  FacebookLogo,
  Flame,
  HandsClapping,
  InstagramLogo,
  Leaf,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkle,
  TiktokLogo,
  Truck,
  X,
} from "phosphor-react";
import { useSettings } from "../hooks/useSettings.js";
import { formatPKR } from "../utils/format.js";
import { optimizeImage } from "../utils/cloudinary.js";

const EST_YEAR = 1987;

const GALLERY_FALLBACK = [
  "/images/gallery-1.jpg",
  "/images/gallery-2.jpg",
  "/images/gallery-3.jpg",
  "/images/gallery-4.jpg",
  "/images/gallery-5.jpg",
  "/images/gallery-6.jpg",
  "/images/gallery-7.jpg",
  "/images/gallery-8.jpg",
];

export default function About() {
  const { settings } = useSettings();
  const [lightbox, setLightbox] = useState(null);

  const years = new Date().getFullYear() - EST_YEAR;

  const galleryImages = useMemo(() => {
    const fromSettings = (settings?.gallery || []).flatMap((g) => (g.url ? [g.url] : []));
    const merged = [...fromSettings, ...GALLERY_FALLBACK];
    return [...new Set(merged)].slice(0, 8);
  }, [settings]);

  const stats = [
    { to: years, suffix: "+", label: "Years of rolling", sub: "Hand-rolled since " + EST_YEAR },
    { to: 1500, suffix: "+", label: "Parathas rolled daily", sub: "Kneaded fresh every morning" },
    { to: 230000, suffix: "+", label: "Happy diners served", sub: "From our counter to your home" },
    { to: 100, suffix: "%", label: "Fresh, never frozen", sub: "Dough, fillings & chutneys" },
  ];

  const values = [
    { icon: <Leaf size={24} />, title: "Fresh dough daily", desc: "We knead our atta every single morning. No day-old dough and no shortcuts â€” ever." },
    { icon: <Drop size={24} />, title: "Real desi ghee", desc: "Layered with pure desi ghee for the golden, flaky crisp you can taste in every bite." },
    { icon: <HandsClapping size={24} />, title: "Hand-rolled, never frozen", desc: "Every paratha is rolled by hand to order and griddled the moment it is ready." },
    { icon: <ShieldCheck size={24} />, title: "From-scratch fillings", desc: "From aloo to paneer, we mash, mix and spice everything in-house the honest way." },
  ];

  const steps = [
    { num: "01", icon: <Clock size={22} />, title: "Knead at dawn", desc: "Fresh atta, water and a pinch of salt â€” kneaded before the city even wakes up." },
    { num: "02", icon: <Sparkle size={22} />, title: "Hand-roll & stuff", desc: "Each ball is filled, folded and rolled by hand into soft, delicate layers." },
    { num: "03", icon: <Flame size={22} />, title: "Griddle-fresh", desc: "Cooked on a hot tawa with desi ghee until crisp, blistered and golden." },
    { num: "04", icon: <Bicycle size={22} />, title: "Served hot", desc: "Finished with butter or raita and rushed to your table or doorstep." },
  ];

  const info = [
    { icon: <MapPin size={18} />, label: "Find us", value: settings?.address || "" },
    { icon: <Clock size={18} />, label: "Opening hours", value: settings?.openingHours || "11:00 AM - 12:00 AM, All Days" },
    { icon: <Phone size={18} />, label: "Call us", value: settings?.phone || "+92 300 1234567" },
    { icon: <Envelope size={18} />, label: "Write to us", value: settings?.email || "hello@pratha.com" },
  ].filter((it) => it.value);

  const socials = [
    { icon: <FacebookLogo size={18} />, href: settings?.socialLinks?.facebook || "#", label: "Facebook" },
    { icon: <InstagramLogo size={18} />, href: settings?.socialLinks?.instagram || "#", label: "Instagram" },
    { icon: <TiktokLogo size={18} />, href: settings?.socialLinks?.tiktok || "#", label: "TikTok" },
  ];

  const facts = [
    { label: "Minimum order", value: formatPKR(settings?.minOrderAmount || 300), icon: <Leaf size={16} /> },
    { label: "Delivery fee", value: formatPKR(settings?.deliveryFee || 100), icon: <Truck size={16} /> },
    { label: "Free delivery", value: `over ${formatPKR(settings?.freeDeliveryThreshold || 1500)}`, icon: <Sparkle size={16} /> },
  ];

  return (
    <div>
      {/* â”€â”€ Hero / Story â”€â”€ */}
      <section className="container" style={{ padding: "150px 24px 40px" }}>
        <div id="about-hero" style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 56, alignItems: "center" }}>
          <m.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Our Story</div>
            <h1 style={{ fontSize: "clamp(32px, 4.4vw, 52px)", marginBottom: 22 }}>
              Rolling tradition into <span style={{ color: "var(--paprika)" }}>every bite</span>
            </h1>
            <p style={{ color: "var(--ink-soft)", fontSize: 15.5, lineHeight: 1.85, marginBottom: 16 }}>
              {settings?.siteName || "Pratha"} started with one simple goal â€” bring the honest, hand-rolled
              paratha back to the spotlight. No shortcuts, no frozen dough. Just fresh atta, real ghee and
              fillings made from scratch every single morning since {EST_YEAR}.
            </p>
            <p style={{ color: "var(--ink-soft)", fontSize: 15.5, lineHeight: 1.85 }}>
              From our open kitchen counter to your doorstep, every roll is folded, stuffed and griddled the
              way it's meant to be â€” crisp on the outside, generous on the inside.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
              {["Fresh dough daily", "Real desi ghee", "Hand-rolled & griddled"].map((chip) => (
                <span
                  key={chip}
                  style={{
                    padding: "8px 15px",
                    borderRadius: 999,
                    background: "rgba(227,160,8,0.14)",
                    color: "#8a5f02",
                    fontSize: 12.5,
                    fontWeight: 700,
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
              <Link to="/menu" className="btn btn-primary">
                Explore the Menu <ArrowRight size={16} />
              </Link>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ position: "relative" }}
          >
            <div style={{ borderRadius: 26, overflow: "hidden", aspectRatio: "4/4.6" }}>
              <img
                src="/about-pratha.png"
                alt="Chef preparing fresh paratha"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(33,23,17,0.35), transparent 45%)" }} />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -22,
                left: -22,
                width: "46%",
                borderRadius: 20,
                overflow: "hidden",
                border: "6px solid var(--cream)",
                boxShadow: "var(--shadow)",
                aspectRatio: "1/1",
              }}
            >
              <img
                src="/images/about-restaurant.jpg"
                alt="Inside the Pratha dining room"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ position: "absolute", top: 24, right: 24 }}>
              <EstBadge />
            </div>
          </m.div>
        </div>
      </section>


      {/* â”€â”€ Running numbers â”€â”€ */}
      <section style={{ background: "var(--charcoal)", marginTop: 56 }}>
        <div className="roti-edge on-charcoal" style={{ transform: "rotate(180deg)", background: "var(--cream)" }} />
        <div className="container" style={{ padding: "64px 24px 72px" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
            <div className="eyebrow" style={{ marginBottom: 12, color: "var(--turmeric)" }}>Pratha in numbers</div>
            <h2 style={{ color: "var(--cream)", fontSize: "clamp(26px, 3.2vw, 38px)" }}>A kitchen that never stops rolling</h2>
          </div>
          <div id="about-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {stats.map((s, i) => (
              <m.div
                key={s.label}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  textAlign: "center",
                  padding: "34px 16px 28px",
                  borderRadius: 20,
                  background: "rgba(251,243,230,0.05)",
                  border: "1px solid rgba(251,243,230,0.1)",
                }}
              >
                <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(34px, 4vw, 46px)", fontWeight: 700, color: "var(--turmeric)", lineHeight: 1 }}>
                  <CountUp to={s.to} suffix={s.suffix} />
                </div>
                <div style={{ color: "var(--cream)", fontWeight: 700, fontSize: 14.5, marginTop: 12 }}>{s.label}</div>
                <div style={{ color: "rgba(251,243,230,0.5)", fontSize: 12.5, marginTop: 5 }}>{s.sub}</div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

     

      {/* â”€â”€ Process â”€â”€ */}
      <section style={{ background: "var(--cream-2)" }}>
        <div className="roti-edge flip" style={{ background: "var(--cream-2)" }} />
        <div className="container" style={{ padding: "84px 24px 88px" }}>
          <SectionHead eyebrow="From our kitchen" title="From flour to your table" />
          <div id="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {steps.map((step, i) => (
              <m.div
                key={step.num}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{ position: "relative", background: "#fff", border: "1px solid var(--line)", borderRadius: 20, padding: "30px 24px" }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 22,
                    right: 24,
                    fontFamily: "var(--font-display)",
                    fontSize: 34,
                    fontWeight: 700,
                    color: "var(--charcoal)",
                    lineHeight: 1,
                  }}
                >
                  {step.num}
                </div>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--charcoal)", color: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  {step.icon}
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ color: "var(--ink-soft)", fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight
                    size={18}
                    style={{ position: "absolute", top: "50%", right: -16, color: "var(--paprika)", display: "none" }}
                  />
                )}
              </m.div>
            ))}
          </div>
        </div>
      </section>

      

      {/* â”€â”€ Gallery â”€â”€ */}
      <section className="container" style={{ padding: "70px 24px 40px" }}>
        <SectionHead eyebrow="Inside Pratha Chai" title="A peek into our world" />
        <div id="gallery-grid">
          {galleryImages.map((src, i) => (
            <m.button
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setLightbox(optimizeImage(src))}
              aria-label={`Open gallery image ${i + 1}`}
              style={{
                border: "none",
                padding: 0,
                cursor: "pointer",
                borderRadius: 16,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img src={optimizeImage(src)} alt={`Pratha gallery ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s ease" }} />
            </m.button>
          ))}
        </div>
      </section>

      {/* â”€â”€ CTA â”€â”€ */}
      <section style={{ background: "none", marginTop: 20, overflow: "hidden", position: "relative" }}>
        <div className="container" style={{ padding: "15px 24px", textAlign: "center", position: "relative" }}>
          <div className="eyebrow" style={{ color: "var(--paprika)", marginBottom: 14 }}>Est. {EST_YEAR}</div>
          <h2 style={{ color: "var(--charcoal)", fontSize: "clamp(30px, 4.2vw, 48px)", maxWidth: 700, margin: "0 auto 14px" }}>
            Your table is waiting for its first warm bite
          </h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 15.5, maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.7 }}>
            Fresh, hand-rolled and served with love â€” just the way it's been done for generations.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap"  }}>
            <Link to="/menu" className="btn btn-dark">
              See the Menu <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn btn-outline-light" style={{ borderColor: "var(--charcoal)", color: "var(--charcoal)" }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "rgba(0,0,0,0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 24,
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Close image"
            style={{
              position: "absolute", top: 20, right: 20,
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(255,255,255,0.18)", border: "none",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={24} />
          </button>
          <img
            src={lightbox}
            alt="Pratha gallery lightbox"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 14, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}
          />
        </div>
      )}

      <style>{`
        #about-hero { position: relative; }
        @keyframes badge-spin {
          to { transform: rotate(360deg); }
        }
        .badge-ring {
          transform-origin: 60px 60px;
          transform-box: view-box;
          animation: badge-spin 18s linear infinite;
        }
        #gallery-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 170px;
          gap: 14px;
        }
        #gallery-grid > *:nth-child(1) { grid-column: 1 / 3; grid-row: 1 / 3; }
        #gallery-grid > *:nth-child(2) { grid-column: 3; grid-row: 1; }
        #gallery-grid > *:nth-child(3) { grid-column: 4; grid-row: 1; }
        #gallery-grid > *:nth-child(4) { grid-column: 3; grid-row: 2; }
        #gallery-grid > *:nth-child(5) { grid-column: 1 / 3; grid-row: 3; }
        #gallery-grid > *:nth-child(6) { grid-column: 3; grid-row: 3; }
        #gallery-grid > *:nth-child(7) { grid-column: 4; grid-row: 3; }
        #gallery-grid > *:nth-child(8) { grid-column: 4; grid-row: 2; }
        #gallery-grid > *:hover img { transform: scale(1.06); }

        @media (max-width: 960px) {
          #about-hero { grid-template-columns: 1fr !important; gap: 44px !important; }
          #about-stats { grid-template-columns: repeat(2, 1fr) !important; }
          #values-grid { grid-template-columns: repeat(2, 1fr) !important; }
          #steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
          #visit-grid { grid-template-columns: 1fr !important; }
          #gallery-grid { grid-auto-rows: 150px; }
        }
        @media (max-width: 600px) {
          #about-stats { grid-template-columns: 1fr !important; }
          #values-grid { grid-template-columns: 1fr !important; }
          #steps-grid { grid-template-columns: 1fr !important; }
          #facts-grid { grid-template-columns: repeat(2, 1fr) !important; }
          #gallery-grid { grid-template-columns: repeat(2, 1fr) !important; grid-auto-rows: 130px; }
          #gallery-grid > *:nth-child(1) { grid-column: 1 / 3; grid-row: 1 / 3; }
          #gallery-grid > *:nth-child(2) { grid-column: 1; grid-row: 3; }
          #gallery-grid > *:nth-child(3) { grid-column: 2; grid-row: 3; }
          #gallery-grid > *:nth-child(4) { grid-column: 1; grid-row: 4; }
          #gallery-grid > *:nth-child(5) { grid-column: 1 / 3; grid-row: 5; }
          #gallery-grid > *:nth-child(6) { grid-column: 1; grid-row: 6; }
          #gallery-grid > *:nth-child(7) { grid-column: 2; grid-row: 6; }
          #gallery-grid > *:nth-child(8) { grid-column: 2; grid-row: 4; }
        }
      `}</style>
    </div>
  );
}

function useInView(threshold = 0.35) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function CountUp({ to, suffix = "", prefix = "", duration = 1900 }) {
  const [ref, inView] = useInView();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {Math.round(value).toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

function SectionHead({ eyebrow, title }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 44px" }}>
      <div className="eyebrow" style={{ marginBottom: 12 }}>{eyebrow}</div>
      <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)" }}>{title}</h2>
    </div>
  );
}

function EstBadge() {
  return (
    <div style={{ position: "relative", width: 128, height: 128 }}>
      <svg viewBox="0 0 120 120" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          <path id="about-badge-path" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <circle cx="60" cy="60" r="59" fill="var(--paprika)" />
        <g className="badge-ring">
          <text fill="#fff7ec" fontSize="10" fontWeight="700" letterSpacing="2.6">
            <textPath href="#about-badge-path">
              âœ¦ FRESH PARATHAS âœ¦ ROLLED DAILY âœ¦ SINCE 1987
            </textPath>
          </text>
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff7ec",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>EST.</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, lineHeight: 1.05 }}>{EST_YEAR}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,247,236,0.8)", marginTop: 4, letterSpacing: "0.04em" }}>
          {new Date().getFullYear() - EST_YEAR} YRS
        </span>
      </div>
    </div>
  );
}
