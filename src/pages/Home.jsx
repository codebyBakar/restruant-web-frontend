import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { m } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, MapPin, Clock, Phone, Envelope, FacebookLogo, InstagramLogo, TiktokLogo, Leaf, Truck, Sparkle } from "phosphor-react";
import Hero from "../components/Hero.jsx";
import Marquee from "../components/Marquee.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { SkeletonCategory, SkeletonGrid } from "../components/Skeleton.jsx";
import EmptyState from "../components/EmptyState.jsx";
import api from "../api/axios.js";
import { formatPKR } from "../utils/format.js";
import { useSettings } from "../hooks/useSettings.js";

export default function Home() {
  const { settings } = useSettings();
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dealIndex, setDealIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(2);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const update = () => setSlidesPerView(window.innerWidth < 700 ? 1 : 2);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, deals.length - slidesPerView);

  useEffect(() => {
    if (isPaused || maxIndex < 1) return;
    const timer = setInterval(() => {
      setDealIndex((prev) => (prev + 1 > maxIndex ? 0 : prev + 1));
    }, 4200);
    return () => clearInterval(timer);
  }, [isPaused, deals.length, maxIndex]);

  useEffect(() => {
    setDealIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const paginate = (dir) => {
    setDealIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return maxIndex;
      if (next > maxIndex) return 0;
      return next;
    });
  };

  const loadHome = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      api.get("/products?featured=true&limit=8&availableOnly=true"),
      api.get("/categories"),
      api.get("/deals?limit=3"),
    ])
      .then(([p, c, d]) => {
        setFeatured(p.data.data);
        setCategories(c.data.data);
        setDeals(d.data.data);
      })
      .catch(() => {
        setError(true);
        toast.error("Failed to load homepage data");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHome();
  }, []);

  const info = [
    { icon: <MapPin size={18} />, label: "Find us", value: settings?.address || "MM Alam Road, Gulberg III, Lahore" },
    { icon: <Clock size={18} />, label: "Opening hours", value: settings?.openingHours || "11:00 AM - 12:00 AM, All Days" },
    { icon: <Phone size={18} />, label: "Call us", value: settings?.phone || "+92 300 1234567" },
    { icon: <Envelope size={18} />, label: "Write to us", value: settings?.email || "hello@pratha.com" },
  ];

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

    const isMobile = window.innerWidth < 689;

  return (
    <div>
      <div className="hero-shell"><Hero /></div>

      <Marquee />

{/* Categories */}
        <section className="container" style={{ padding: "72px 24px 30px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 30 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>What are you craving</div>
              <h2 style={{ fontSize: isMobile ? 20 : "clamp(28px, 3.4vw, 40px)" }}>Browse by category</h2>
            </div>
            <Link to="/menu" style={{ fontWeight: 700, fontSize: isMobile ? 12 : 14, display: "flex", alignItems: "center", gap: 6 }}>
              View full menu <ArrowRight size={15} />
            </Link>
          </div>
          {loading ? (
            <SkeletonCategory count={6} />
          ) : error ? (
            <EmptyState type="categories" hasError onAction={loadHome} />
          ) : categories.length === 0 ? (
            <EmptyState type="categories" />
          ) : (
          <div style={{ position: 'relative' }}>
            <div className="category-slider">
              {categories.map((cat, i) => (
                <m.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="category-slide"
                >
                  <Link
                    to={`/menu?category=${cat._id}`}
                    style={{
                      display: "block",
                      borderRadius: 18,
                      overflow: "hidden",
                      position: "relative",
                      aspectRatio: "1/1",
                      background: "var(--cream-2)",
                    }}
                  >
                    {cat.image?.url && (
                      <img src={cat.image.url} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(33,23,17,0.75), transparent 55%)" }} />
                    <span style={{ position: "absolute", bottom: 14, left: 14, right: 14, color: "#fff", fontWeight: 700, fontSize: 15 }}>
                      {cat.name}
                    </span>
                  </Link>
                </m.div>
              ))}
            </div>
            <div className="category-fade" />
          </div>
        )}
      </section>

      {/* Deals strip */}
      {deals.length > 0 && (
        <section className="container" style={{ padding: "56px 24px 30px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Limited time offers</div>
              <h2 style={{ fontSize: isMobile ? 22 : "clamp(28px, 3.4vw, 40px)" }}>Today's best deals</h2>
            </div>
            <Link to="/deals" style={{ fontWeight: 700, fontSize: isMobile ? 15 : 14, display: "flex", alignItems: "center", gap: 6 }}>
              View all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="deal-carousel" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            {slidesPerView > 1 && (
              <button className="deal-arrow" onClick={() => paginate(-1)} aria-label="Previous">
                <ArrowLeft size={18} />
              </button>
            )}

            <div className="deal-viewport">
              <m.div
                className="deal-track"
                animate={{ x: deals.length > slidesPerView ? -(dealIndex * (100 / slidesPerView)) + "%" : 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                style={{ "--spv": slidesPerView }}
              >
                {deals.map((deal) => (
                  <div key={deal._id} className="deal-slide-item">
                    <DealCard deal={deal} />
                  </div>
                ))}
              </m.div>
            </div>

            {slidesPerView > 1 && (
              <button className="deal-arrow" onClick={() => paginate(1)} aria-label="Next">
                <ArrowRight size={18} />
              </button>
            )}
          </div>

          {maxIndex > 0 && (
            <div className="deal-dots">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  className={`deal-dot${i === dealIndex ? " active" : ""}`}
                  onClick={() => setDealIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                >
                  <span className="deal-dot-fill" style={{ animationPlayState: isPaused ? "paused" : "running" }} />
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Featured products */}
      <section className="container" style={{ padding: "56px 24px 30px" }}>
        <div className="spice-divider" style={{ marginBottom: 34 }}>
          <span />
          <span />
        </div>
        <h2 style={{ fontSize: "clamp(28px, 3.4vw, 40px)", textAlign: "center", marginBottom: 40 }}>
          What everyone's ordering
        </h2>
        {loading ? (
          <SkeletonGrid count={8} cols="grid-4" />
        ) : error ? (
          <EmptyState type="products" hasError onAction={loadHome} />
        ) : featured.length === 0 ? (
          <EmptyState type="products" subtitle="No featured items yet. Check back soon!" />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 22 }}>
            {featured.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <Link to="/menu" className="btn btn-dark">
            See Full Menu <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Visit us / shop info ── */}
      <section className="container" style={{ padding: "84px 24px 40px" }}>
        <div id="visit-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 46, alignItems: "stretch" }}>
          <m.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{
              background: "var(--charcoal)",
              borderRadius: 26,
              padding: "40px 34px",
              color: "var(--cream)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: 12, color: "var(--turmeric)" }}>Visit us</div>
              <h2 style={{ color: "var(--cream)", fontSize: "clamp(26px, 3vw, 34px)", marginBottom: 18 }}>
                Come hungry, leave happy
              </h2>
              <p style={{ color: "rgba(251,243,230,0.65)", fontSize: 14.5, lineHeight: 1.75, marginBottom: 26, maxWidth: 440 }}>
                Find us on {settings?.address?.split(",")[0] || "MM Alam Road"} — watch our chefs roll live at the
                open counter, or order in. Seven days a week.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {info.map((it) => (
                  <div key={it.label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(251,243,230,0.08)", color: "var(--turmeric)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {it.icon}
                    </div>
                    <div>
                      <div className="info-label" style={{ fontSize: 11, fontWeight: 700, color: "rgba(251,243,230,0.5)", textTransform: "uppercase", letterSpacing: ".05em" }}>{it.label}</div>
                      <div className="info-value" style={{ fontSize: 14.5, fontWeight: 600, marginTop: 2, color: "var(--cream)" }}>{it.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      border: "1px solid rgba(251,243,230,0.2)",
                      color: "var(--cream)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all .25s ease",
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div style={{ borderRadius: 26, overflow: "hidden", position: "relative", flex: 1, minHeight: 320 }}>
              <img
                src="/images/home-restaurant.jpg"
                alt="Inside the Pratha dining room"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(33,23,17,0.55), transparent 50%)" }} />
              <span
                style={{
                  position: "absolute",
                  bottom: 18,
                  left: 18,
                  background: "var(--turmeric)",
                  color: "var(--ink)",
                  fontWeight: 800,
                  fontSize: 12,
                  padding: "7px 15px",
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--mint)", animation: "pulse-dot 1.6s infinite" }} />
                Open 7 days a week
              </span>
            </div>
            <div id="facts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {facts.map((f) => (
                <div
                  key={f.label}
                  style={{
                    background: "var(--cream-2)",
                    borderRadius: 16,
                    padding: "16px 14px",
                    textAlign: "center",
                    border: "1px solid transparent",
                    transition: "border-color .25s ease, transform .25s ease",
                  }}
                >
                  <div style={{ color: "var(--paprika)", display: "flex", justifyContent: "center", marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)" }}>{f.value}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-soft)", marginTop: 3 }}>{f.label}</div>
                </div>
              ))}
            </div>
          </m.div>
        </div>
      </section>

      <style>{`
        .hero-shell { padding-top: 60px; }
        .form-input { width: 100%; padding: 11px 14px; border-radius: 11px; border: 1.5px solid var(--line); font-family: inherit; font-size: 14px; background: #fff; box-sizing: border-box; }

        .category-slider {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 8px;
        }
        .category-slider::-webkit-scrollbar { display: none; }
        .category-slide {
          flex: 0 0 190px;
          scroll-snap-align: start;
        }
        .category-fade {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 60px;
          background: linear-gradient(to right, transparent, var(--cream));
          pointer-events: none;
        }

        .deal-carousel {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .deal-viewport {
          flex: 1;
          overflow: hidden;
          border-radius: 22px;
          position: relative;
        }
        .deal-track {
          display: flex;
          cursor: grab;
        }
        .deal-track:active {
          cursor: grabbing;
        }
        .deal-slide-item {
          flex: 0 0 calc(100% / var(--spv));
          padding: 0 6px;
        }
        .deal-slide-item:first-child {
          padding-left: 0;
        }
        .deal-slide-item:last-child {
          padding-right: 0;
        }
        .deal-arrow {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1.5px solid var(--line);
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--ink);
          transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
          z-index: 2;
        }
        .deal-arrow:hover {
          background: var(--paprika);
          border-color: var(--paprika);
          color: #fff;
          transform: scale(1.06);
        }
        @media (max-width: 700px) {
          .deal-arrow { display: none; }
        }

        .deal-card {
          position: relative;
          display: flex;
          align-items: stretch;
          min-height: 210px;
          border-radius: 22px;
          overflow: hidden;
          text-decoration: none;
          background: var(--paprika);
        }
        .deal-card-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .deal-card-fade {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 70%, transparent 100%);
        }
        .deal-card-glow {
          position: absolute;
          top: -50%;
          right: -30%;
          width: 70%;
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,200,50,0.15), transparent 70%);
          pointer-events: none;
        }
        .deal-card-body {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 30px;
          width: 100%;
        }
        .deal-card-badge {
          display: inline-block;
          background: var(--turmeric);
          color: var(--ink);
          font-weight: 800;
          font-size: 12px;
          padding: 4px 13px;
          border-radius: 999px;
          margin-bottom: 12px;
          letter-spacing: 0.3px;
        }
        .deal-card-title {
          color: #fff;
          font-size: clamp(20px, 2.4vw, 28px);
          line-height: 1.2;
          margin: 0;
        }
        .deal-card-sub {
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          margin: 6px 0 0;
          line-height: 1.5;
          max-width: 420px;
        }
        .deal-card-btn {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 16px;
          padding: 8px 18px;
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(4px);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          border: 1px solid rgba(255,255,255,0.25);
          transition: background 0.25s, color 0.25s, border-color 0.25s;
        }
        .deal-card:hover .deal-card-btn {
          background: var(--turmeric);
          color: var(--ink);
          border-color: var(--turmeric);
        }

        .deal-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
        }
        .deal-dot {
          position: relative;
          width: 36px;
          height: 4px;
          border-radius: 2px;
          border: none;
          background: var(--line);
          cursor: pointer;
          padding: 0;
          overflow: hidden;
          transition: background 0.25s;
        }
        .deal-dot.active {
          background: rgba(194,65,12,0.2);
        }
        .deal-dot-fill {
          position: absolute;
          inset: 0;
          background: var(--paprika);
          border-radius: 2px;
          transform-origin: left;
          transform: scaleX(0);
        }
        .deal-dot.active .deal-dot-fill {
          animation: dot-progress 4.2s linear forwards;
        }
        @keyframes dot-progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @media (max-width: 700px) {
          .category-slide { flex: 0 0 44vw; }
          .category-fade { width: 40px; }
        }
        @media (max-width: 860px) {
          .hero-shell { padding-top: 0px; 
          }
        }
        @media (max-width: 700px) {
          .hero-shell { padding-top: -100px; }
        }
        @media (min-width: 861px) {
          // .hero-sticky-container { padding-top: 60px; }
        }
        @media (max-width: 860px) {
          #visit-grid { grid-template-columns: 1fr !important; gap: 30px !important; }
          #facts-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 8px !important; }
          #facts-grid > div { padding: 14px 8px !important; }
          #facts-grid > div > div:nth-child(2) { font-size: 12px !important; white-space: nowrap; }
          #facts-grid > div > div:nth-child(3) { font-size: 9.5px !important; }
        }
        @media (max-width: 480px) {
          #visit-grid > div:first-child { padding: 38px 26px !important; }
          #visit-grid p { font-size: 15.5px !important; }
          #visit-grid .info-label { font-size: 12px !important; }
          #visit-grid .info-value { font-size: 16px !important; }
        }
      `}</style>
    </div>
  );
}

function DealCard({ deal }) {
  return (
    <Link to="/deals" className="deal-card">
      {deal.image?.url && (
        <>
          <img src={deal.image.url} alt={deal.title} className="deal-card-bg" />
          <div className="deal-card-fade" />
        </>
      )}
      <div className="deal-card-glow" />
      <div className="deal-card-body">
        <div>
          {deal.price && (
            <span className="deal-card-badge">{formatPKR(deal.price)}</span>
          )}
          <h3 className="deal-card-title">{deal.title}</h3>
          {deal.subtitle && <p className="deal-card-sub">{deal.subtitle}</p>}
        </div>
        <span className="deal-card-btn">
          Shop Now <ArrowRight size={14} weight="bold" />
        </span>
      </div>
    </Link>
  );
}
