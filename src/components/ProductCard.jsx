import { Plus } from "phosphor-react";
import { m } from "framer-motion";
import { formatPKR } from "../utils/format.js";
import { optimizeImage } from "../utils/cloudinary.js";
import { useCurrency } from "../hooks/useCurrency.js";
import { useCart } from "../context/CartContext.jsx";
import { useUI } from "../context/UIContext.jsx";
import toast from "react-hot-toast";

export default function ProductCard({ product, index = 0 }) {
  useCurrency();
  const { addItem } = useCart();
  const { openProduct } = useUI();

  const hasVariants = product.variants && product.variants.length > 0;
  const mainPrice = product.discountPrice || product.basePrice;
  const variantPrice =
    hasVariants && product.variants.every((v) => v.price !== undefined && v.price !== null && v.price !== "")
      ? Math.min(...product.variants.map((v) => Number(v.price)))
      : null;
  const price = Number(mainPrice) > 0 ? mainPrice : variantPrice ?? mainPrice;

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (hasVariants) {
      openProduct(product);
      return;
    }
    addItem(product, null, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <m.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      onClick={() => openProduct(product)}
      style={{
        background: "#fff",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        cursor: "pointer",
        border: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "box-shadow .2s ease, transform .2s ease",
      }}
      whileHover={{ y: -4 }}
    >
      <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "var(--cream-2)" }}>
        {product.images?.[0]?.url ? (
          <img
            src={optimizeImage(product.images[0].url, { width: 600 })}
            alt={product.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-soft)" }}>
            No image
          </div>
        )}
        {!product.isAvailable && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(33,23,17,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: ".04em" }}>
              {product.unavailableBadge === "coming_soon" ? "COMING SOON" : "UNAVAILABLE"}
            </span>
          </div>
        )}
        {product.tags?.[0] && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 999,
              background: "var(--charcoal)",
              color: "var(--cream)",
              border: "1px solid rgba(255,255,255,.12)",
              fontSize: 11.5,
              fontWeight: 800,
              letterSpacing: ".02em",
              boxShadow: "0 2px 8px rgba(0,0,0,.2)",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: product.tags[0].colorHex || "#e3a008",
                flexShrink: 0,
              }}
            />
            {product.tags[0].name}
          </span>
        )}
        <button
          onClick={handleQuickAdd}
          disabled={!product.isAvailable}
          aria-label={`Add ${product.name} to cart`}
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "var(--paprika)",
            color: "#fff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 16px rgba(194,65,12,.4)",
          }}
        >
          <Plus size={19} />
        </button>
      </div>

      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 13, height: 13, border: `1.5px solid ${product.isVeg ? "var(--mint)" : "var(--paprika)"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: product.isVeg ? "var(--mint)" : "var(--paprika)" }} />
          </span>
          <h4 style={{ fontSize: 16.5, fontWeight: 600 }}>{product.name}</h4>
        </div>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.description}
        </p>
        <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 16.5, color: "var(--ink)" }}>{formatPKR(price)}</span>
          {Number(product.discountPrice) > 0 && Number(product.basePrice) > Number(product.discountPrice) && (
            <span style={{ fontSize: 13, color: "var(--ink-soft)", textDecoration: "line-through" }}>
              {formatPKR(product.basePrice)}
            </span>
          )}
          {hasVariants && <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>onwards</span>}
        </div>
      </div>
    </m.article>
  );
}
