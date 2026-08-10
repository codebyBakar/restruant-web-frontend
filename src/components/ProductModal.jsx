import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { X, Minus, Plus, Fire } from "phosphor-react";
import toast from "react-hot-toast";
import { useUI } from "../context/UIContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatPKR } from "../utils/format.js";
import { useCurrency } from "../hooks/useCurrency.js";
import { tagTone } from "../utils/color.js";

export default function ProductModal() {
  useCurrency();
  const { activeProduct, closeProduct } = useUI();
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    if (activeProduct) {
      const base = activeProduct.discountPrice || activeProduct.basePrice;
      const hasMain = Number(base) > 0;
      setSelectedVariant(hasMain ? null : activeProduct.variants?.[0] || null);
      setQuantity(1);
      setInstructions("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeProduct]);

  if (!activeProduct) return null;

  const basePrice = activeProduct.discountPrice || activeProduct.basePrice;
  const hasMain = Number(basePrice) > 0;
  const unitPrice = selectedVariant ? selectedVariant.price : basePrice;
  const total = unitPrice * quantity;

  const handleAdd = () => {
    addItem(activeProduct, selectedVariant, quantity, instructions);
    toast.success(`${activeProduct.name} added to cart`);
    closeProduct();
  };

  return (
    <AnimatePresence>
      {activeProduct && (
        <>
          <m.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProduct}
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
              msOverflowStyle: "none",
            }}
            onWheel={(e) => {
              const el = e.currentTarget;
              const atTop = el.scrollTop === 0;
              const atBottom = el.scrollHeight - el.scrollTop === el.clientHeight;
              if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
                e.stopPropagation();
              }
            }}
          >
            <div style={{ position: "sticky", top: 0, zIndex: 10, height: 0, display: "flex", justifyContent: "flex-end", padding: "0 0 0 0" }}>
              <button
                onClick={closeProduct}
                aria-label="Close"
                style={{
                  width: 36,
                  height: 36,
                  marginTop: 16,
                  marginRight: 16,
                  borderRadius: "50%",
                  background: "rgba(33,23,17,0.55)",
                  color: "#fff",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ aspectRatio: "16/10", background: "var(--cream-2)", overflow: "hidden" }}>
                {activeProduct.images?.[0]?.url ? (
                  <img src={activeProduct.images[0].url} alt={activeProduct.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </div>

            <div style={{ padding: "22px 24px 32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {activeProduct.tags?.map((t) => {
                  const tone = tagTone(t.colorHex);
                  return (
                    <span
                      key={t._id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 13px",
                        borderRadius: 999,
                        background: tone.bg,
                        color: tone.text,
                        border: "1px solid rgba(0,0,0,.06)",
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: ".02em",
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: tone.text,
                          flexShrink: 0,
                        }}
                      />
                      {t.name}
                    </span>
                  );
                })}
                {activeProduct.spiceLevel && activeProduct.spiceLevel !== "none" && (
                  <span className="badge spicy">
                    <Fire size={12} /> {activeProduct.spiceLevel}
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: 26, marginBottom: 8 }}>{activeProduct.name}</h2>
              <p style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.65, marginBottom: 18 }}>
                {activeProduct.description}
              </p>

              {activeProduct.ingredients?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", color: "var(--ink)", marginBottom: 8, textTransform: "uppercase" }}>
                    Ingredients
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {activeProduct.ingredients.map((ing) => (
                      <span
                        key={ing}
                        style={{
                          fontSize: 12.5,
                          padding: "6px 12px",
                          borderRadius: 999,
                          background: "var(--cream-2)",
                          border: "1px solid var(--line)",
                          color: "var(--ink-soft)",
                        }}
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeProduct.variants?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", color: "var(--ink)", marginBottom: 8, textTransform: "uppercase" }}>
                    Choose size
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {hasMain && (
                      <button
                        onClick={() => setSelectedVariant(null)}
                        style={{
                          padding: "10px 16px",
                          borderRadius: 12,
                          border: `1.5px solid ${!selectedVariant ? "var(--paprika)" : "var(--line)"}`,
                          background: !selectedVariant ? "rgba(194,65,12,0.08)" : "#fff",
                          fontSize: 13.5,
                          fontWeight: 700,
                          textAlign: "left",
                          minWidth: 100,
                        }}
                      >
                        <div>Regular</div>
                        <div style={{ color: "var(--paprika)", fontWeight: 800, marginTop: 2 }}>{formatPKR(basePrice)}</div>
                      </button>
                    )}
                    {activeProduct.variants.map((v) => (
                      <button
                        key={v.label}
                        onClick={() => setSelectedVariant(v)}
                        style={{
                          padding: "10px 16px",
                          borderRadius: 12,
                          border: `1.5px solid ${selectedVariant?.label === v.label ? "var(--paprika)" : "var(--line)"}`,
                          background: selectedVariant?.label === v.label ? "rgba(194,65,12,0.08)" : "#fff",
                          fontSize: 13.5,
                          fontWeight: 700,
                          textAlign: "left",
                          minWidth: 100,
                        }}
                      >
                        <div>{v.label}</div>
                        <div style={{ color: "var(--paprika)", fontWeight: 800, marginTop: 2 }}>{formatPKR(v.price)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", color: "var(--ink)", marginBottom: 8, textTransform: "uppercase" }}>
                  Special instructions (optional)
                </div>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. less spicy, no onions..."
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1.5px solid var(--line)",
                    fontFamily: "inherit",
                    fontSize: 13.5,
                    resize: "vertical",
                    background: "#fff",
                  }}
                />
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
                  disabled={!activeProduct.isAvailable}
                  style={{ flex: 1, height: 48 }}
                >
                  {activeProduct.isAvailable ? `Add to Cart · ${formatPKR(total)}` : "Sold Out"}
                </button>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
