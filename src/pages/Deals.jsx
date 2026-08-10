import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { Tag, Plus } from "phosphor-react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useUI } from "../context/UIContext.jsx";
import { formatPKR } from "../utils/format.js";
import { useCurrency } from "../hooks/useCurrency.js";
import { SkeletonGrid } from "../components/Skeleton.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Deals() {
  useCurrency();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const { addDeal } = useCart();
  const { openDeal } = useUI();

  useEffect(() => {
    setLoading(true);
    setError(false);
    api
      .get("/deals")
      .then(({ data }) => setDeals(data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [retryKey]);

  const handleQuickAdd = (e, deal) => {
    e.stopPropagation();
    addDeal(deal);
    toast.success(`${deal.title} added to cart`);
  };

  return (
    <div className="container deals-page" style={{ padding: "100px 24px 90px" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Save more</div>
        <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>Deals & Offers</h1>
      </div>

      {loading ? (
        <SkeletonGrid count={4} cols="grid-3" ratio="4/3" />
      ) : error ? (
        <EmptyState type="deals" hasError onAction={() => setRetryKey((k) => k + 1)} />
      ) : deals.length === 0 ? (
        <EmptyState type="deals" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
          {deals.map((deal, i) => (
            <m.div
              key={deal._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              onClick={() => openDeal(deal)}
              style={{
                borderRadius: 22, overflow: "hidden", background: "#fff",
                border: "1px solid var(--line)", cursor: "pointer",
                transition: "box-shadow .2s ease, transform .2s ease",
              }}
              whileHover={{ y: -4 }}
            >
              {deal.image?.url ? (
                <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "var(--cream-2)" }}>
                  <img src={deal.image.url} alt={deal.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ aspectRatio: "16/9", background: "var(--cream-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-soft)", fontSize: 13 }}>
                  No image
                </div>
              )}
              <div style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Tag size={14} color="var(--paprika)" weight="fill" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--paprika)", textTransform: "uppercase", letterSpacing: ".04em" }}>
                    {deal.items?.length || 0} item{(deal.items?.length || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
                <h3 style={{ fontSize: 20, marginBottom: 6 }}>{deal.title}</h3>
                {deal.subtitle && <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.5, marginBottom: 14 }}>{deal.subtitle}</p>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 800, fontSize: 20, color: "var(--paprika)" }}>{formatPKR(deal.price)}</span>
                  <button
                    onClick={(e) => handleQuickAdd(e, deal)}
                    style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "var(--paprika)", color: "#fff", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", boxShadow: "0 6px 16px rgba(194,65,12,.35)",
                    }}
                  >
                    <Plus size={19} weight="bold" />
                  </button>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      )}
      <style>{`@media (max-width: 860px) { .deals-page { padding-top: 150px !important; } }`}</style>
    </div>
  );
}
