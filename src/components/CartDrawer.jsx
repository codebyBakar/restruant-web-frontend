import { AnimatePresence, m } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash } from "phosphor-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useUI } from "../context/UIContext.jsx";
import { formatPKR } from "../utils/format.js";
import { useCurrency } from "../hooks/useCurrency.js";
import { useSettings } from "../hooks/useSettings.js";
import { useStoreStatus } from "../hooks/useStoreStatus.js";
import { storeClosedMessage } from "../utils/storeStatus.js";

export default function CartDrawer() {
  useCurrency();
  const { settings } = useSettings();
  const { isOpen } = useStoreStatus();
  const { cartOpen, closeCart } = useUI();
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const navigate = useNavigate();

  const minOrder = Number(settings?.minOrderAmount ?? 0);
  const canCheckout = (minOrder <= 0 || subtotal >= minOrder) && isOpen;

  const goCheckout = () => {
    if (!canCheckout) return;
    closeCart();
    navigate("/checkout");
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            role="button"
            aria-label="Close cart"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                closeCart();
              }
            }}
            style={{ position: "fixed", inset: 0, background: "rgba(33,23,17,0.55)", zIndex: 200 }}
          />
          <m.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(420px, 100vw)",
              background: "var(--cream)",
              zIndex: 201,
              display: "flex",
              flexDirection: "column",
              boxShadow: "-16px 0 40px rgba(0,0,0,.2)",
            }}
          >
            <div style={{ padding: "22px 22px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShoppingBag size={20} />
                <h3 style={{ fontSize: 19 }}>Your Cart {itemCount > 0 && `(${itemCount})`}</h3>
              </div>
              <button onClick={closeCart} aria-label="Close cart" style={{ background: "none", border: "none" }}>
                <X size={22} />
              </button>
            </div>

            {items.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 24, textAlign: "center" }}>
                <ShoppingBag size={40} color="var(--ink-soft)" />
                <p style={{ color: "var(--ink-soft)", fontSize: 14.5 }}>Your cart is empty. Add something delicious!</p>
                <button className="btn btn-primary btn-sm" onClick={() => { closeCart(); navigate("/menu"); }}>
                  Browse Menu
                </button>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                  {items.map((item) => (
                    <div key={item.lineKey} style={{ display: "flex", gap: 12 }}>
                      <div style={{ width: 68, height: 68, borderRadius: 12, overflow: "hidden", background: "var(--cream-2)", flexShrink: 0 }}>
                        {item.image && <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: 14.5 }}>{item.name}</div>
                          <button onClick={() => removeItem(item.lineKey)} aria-label="Remove item" style={{ background: "none", border: "none", color: "var(--ink-soft)" }}>
                            <Trash size={16} />
                          </button>
                        </div>
                        {item.variantLabel && <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{item.variantLabel}</div>}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 999, background: "#fff" }}>
                            <button onClick={() => updateQuantity(item.lineKey, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`} style={{ width: 28, height: 28, border: "none", background: "transparent" }}>
                              <Minus size={12} />
                            </button>
                            <span style={{ minWidth: 20, textAlign: "center", fontSize: 13, fontWeight: 700 }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.lineKey, item.quantity + 1)} aria-label={`Increase quantity of ${item.name}`} style={{ width: 28, height: 28, border: "none", background: "transparent" }}>
                              <Plus size={12} />
                            </button>
                          </div>
                          <span style={{ fontWeight: 800, fontSize: 14 }}>{formatPKR(item.unitPrice * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: "18px 22px 26px", borderTop: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ color: "var(--ink-soft)", fontSize: 14 }}>Subtotal</span>
                    <span style={{ fontWeight: 800, fontSize: 17 }}>{formatPKR(subtotal)}</span>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: "100%", height: 50, opacity: canCheckout ? 1 : 0.5, cursor: canCheckout ? "pointer" : "not-allowed" }}
                    onClick={goCheckout}
                    disabled={!canCheckout}
                  >
                    Checkout
                  </button>
                  {!isOpen && (
                    <p style={{ fontSize: 12.5, color: "var(--paprika)", textAlign: "center", marginTop: 10, fontWeight: 700, lineHeight: 1.5 }}>
                      {storeClosedMessage(settings)}
                    </p>
                  )}
                  {isOpen && !canCheckout && (
                    <p style={{ fontSize: 12.5, color: "var(--paprika)", textAlign: "center", marginTop: 10, fontWeight: 700, lineHeight: 1.5 }}>
                      Minimum order is {formatPKR(minOrder)} — add {formatPKR(minOrder - subtotal)} more to checkout.
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: "var(--ink-soft)", textAlign: "center", marginTop: 10 }}>
                    Delivery fee & tax calculated at checkout
                  </p>
                </div>
              </>
            )}
          </m.aside>
        </>
      )}
    </AnimatePresence>
  );
}
