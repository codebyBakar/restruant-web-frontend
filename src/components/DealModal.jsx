import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { X, Plus, Minus, Check } from "phosphor-react";
import toast from "react-hot-toast";
import { useUI } from "../context/UIContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatPKR } from "../utils/format.js";
import { useCurrency } from "../hooks/useCurrency.js";
import { optimizeImage } from "../utils/cloudinary.js";

export default function DealModal() {
  useCurrency();
  const { activeDeal, closeDeal } = useUI();
  const { addDeal } = useCart();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (activeDeal) {
      setQuantity(1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [activeDeal]);

  if (!activeDeal) return null;

  const total = activeDeal.price * quantity;

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addDeal(activeDeal);
    }
    toast.success(`${quantity}x ${activeDeal.title} added to cart`);
    closeDeal();
  };

  return (
    <AnimatePresence>
      {activeDeal && (
        <>
          <m.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDeal}
            style={{ position: "fixed", inset: 0, background: "rgba(33,23,17,0.6)", zIndex: 200 }}
          />
          <m.div
            className="product-sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 201,
              background: "var(--cream)",
              borderRadius: "26px 26px 0 0",
              maxHeight: "92vh",
              overflowY: "auto",
              margin: "0 auto",
              maxWidth: 560,
              boxShadow: "0 -20px 50px rgba(0,0,0,.3)",
              scrollbarWidth: "none",
            }}
          >
            <div style={{ position: "sticky", top: 0, zIndex: 10, height: 0, display: "flex", justifyContent: "flex-end", padding: "0 0 0 0" }}>
              <button
                onClick={closeDeal}
                aria-label="Close"
                style={{
                  width: 36, height: 36, marginTop: 16, marginRight: 16,
                  borderRadius: "50%", background: "rgba(33,23,17,0.55)",
                  color: "#fff", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ aspectRatio: "16/10", background: "var(--cream-2)", overflow: "hidden" }}>
              {activeDeal.image?.url ? (
                <img src={optimizeImage(activeDeal.image.url, { width: 800 })} alt={activeDeal.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : null}
            </div>

            <div style={{ padding: "22px 24px 32px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                <h2 style={{ fontSize: 26 }}>{activeDeal.title}</h2>
                {!activeDeal.isForLife && (activeDeal.endDate || activeDeal.startDate) && (
                  <span style={{ fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, marginTop: 7, background: "var(--paprika)", color: "#fff", padding: "3px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse-dot 1.4s ease-in-out infinite" }} />
                    {activeDeal.startDate && `From ${new Date(activeDeal.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                    {activeDeal.startDate && activeDeal.endDate ? " · " : ""}
                    {activeDeal.endDate && `Till ${new Date(activeDeal.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                  </span>
                )}
              </div>
              {activeDeal.subtitle && (
                <p style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.65, marginBottom: 16 }}>
                  {activeDeal.subtitle}
                </p>
              )}

              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--paprika)", marginBottom: 20 }}>
                {formatPKR(activeDeal.price)}
              </div>

              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", color: "var(--ink)", marginBottom: 10, textTransform: "uppercase" }}>
                  What's included ({activeDeal.items?.length || 0} items)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {(activeDeal.items || []).map((item) => (
                    <div key={item.product?._id || item.product?.id || item.productName} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fff", borderRadius: 12, border: "1px solid var(--line)" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--mint)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check size={13} weight="bold" color="#fff" />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{item.quantity}x {item.product?.name || item.productName}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14, position: "sticky", bottom: 0, background: "var(--cream)", paddingTop: 6 }}>
                <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--line)", borderRadius: 999, background: "#fff" }}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ width: 40, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none" }}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span style={{ minWidth: 26, textAlign: "center", fontWeight: 700 }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    style={{ width: 40, height: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none" }}
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleAdd}
                  style={{ flex: 1, height: 48 }}
                >
                  Add to Cart · {formatPKR(total)}
                </button>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
