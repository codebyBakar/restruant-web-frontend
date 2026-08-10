import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Truck, ShoppingBag, Bank, Money, X } from "phosphor-react";
import { useCart } from "../context/CartContext.jsx";
import { useSettings } from "../hooks/useSettings.js";
import { useStoreStatus } from "../hooks/useStoreStatus.js";
import { storeClosedMessage } from "../utils/storeStatus.js";
import api from "../api/axios.js";
import { formatPKR } from "../utils/format.js";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { settings } = useSettings();
  const { isOpen } = useStoreStatus();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  const placingRef = useRef(false);
  const uploadingRef = useRef(false);

  const [orderType, setOrderType] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [address, setAddress] = useState({ line1: "", city: "", area: "", instructions: "" });
  const [placing, setPlacing] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate("/menu");
    }
  }, [items, navigate]);

  const buildItemsPayload = () =>
    items.map((i) => {
      if (i.dealId) {
        return {
          dealId: i.dealId,
          dealName: i.name,
          dealPrice: i.unitPrice,
          quantity: i.quantity,
          dealItems: i.dealItems || [],
        };
      }
      return {
        productId: i.productId,
        variantLabel: i.variantLabel,
        quantity: i.quantity,
        specialInstructions: i.specialInstructions,
      };
    });

  const threshold = Number(settings?.freeDeliveryThreshold ?? 1500);
  const minOrder = Number(settings?.minOrderAmount ?? 0);
  const canPlace = (minOrder <= 0 || subtotal >= minOrder) && isOpen;
  const estDeliveryFee = orderType === "delivery" ? (subtotal >= threshold ? 0 : Number(settings?.deliveryFee ?? 100)) : 0;
  const estTax = Math.round((subtotal * (Number(settings?.taxPercent ?? 5))) / 100);
  const estTotal = Math.max(0, subtotal + estTax + estDeliveryFee);

  const validateForm = () => {
    if (!customer.name || !customer.email || !customer.phone) {
      toast.error("Please fill in your contact details");
      return false;
    }
    if (orderType === "delivery" && (!address.line1 || !address.city)) {
      toast.error("Please provide a delivery address");
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (placingRef.current) return;
    if (!isOpen) {
      toast.error(storeClosedMessage(settings));
      return;
    }
    if (minOrder > 0 && subtotal < minOrder) {
      toast.error(`Minimum order is ${formatPKR(minOrder)}`);
      return;
    }
    if (!validateForm()) return;

    if (paymentMethod === "online") {
      setShowOnlineModal(true);
      return;
    }

    placingRef.current = true;
    setPlacing(true);
    try {
      const { data } = await api.post("/orders", {
        customer,
        orderType,
        deliveryAddress: orderType === "delivery" ? address : undefined,
        items: buildItemsPayload(),
        paymentMethod,
      });
      clearCart();
      hasNavigated.current = true;
      navigate(`/order-success/${data.data.orderNumber}?token=${data.data.accessToken}&payment=${paymentMethod}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
    } finally {
      placingRef.current = false;
      setPlacing(false);
    }
  };

  const handleUploadScreenshot = async (e) => {
    e.preventDefault();
    if (uploadingRef.current) return;
    if (!screenshot) {
      toast.error("Please select a payment screenshot");
      return;
    }
    uploadingRef.current = true;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("screenshot", screenshot);
      fd.append("customer", JSON.stringify(customer));
      fd.append("orderType", orderType);
      if (orderType === "delivery") fd.append("deliveryAddress", JSON.stringify(address));
      fd.append("items", JSON.stringify(buildItemsPayload()));
      fd.append("paymentMethod", "online");
      const { data } = await api.post("/orders/online", fd);
      toast.success("Order placed! Awaiting payment verification.");
      clearCart();
      hasNavigated.current = true;
      navigate(`/order-success/${data.data.orderNumber}?token=${data.data.accessToken}&payment=online`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Order could not be placed");
    } finally {
      uploadingRef.current = false;
      setUploading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <>
      <div className="container checkout-page" style={{ padding: "40px 24px 90px", display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 40 }} id="checkout-grid">
        <div>
          <h1 style={{ fontSize: "clamp(26px,3.4vw,36px)", marginBottom: 26 }}>Checkout</h1>

          {!isOpen && (
            <div style={{ marginBottom: 22, padding: "14px 18px", borderRadius: 13, background: "#fdecea", border: "1px solid #f3c1bb", color: "#c0392b", fontWeight: 700, fontSize: 13.5, lineHeight: 1.6 }}>
              {storeClosedMessage(settings)} You can prepare your cart now, and place the order once we reopen.
            </div>
          )}

          {/* Order type */}
          <Section title="Order Type">
            <div style={{ display: "flex", gap: 12 }}>
              <TypeButton active={orderType === "delivery"} onClick={() => setOrderType("delivery")} icon={<Truck size={18} />} label="Delivery" />
              <TypeButton active={orderType === "pickup"} onClick={() => setOrderType("pickup")} icon={<ShoppingBag size={18} />} label="Pickup" />
            </div>
          </Section>

          {/* Contact */}
          <Section title="Contact Details">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <input className="form-input" placeholder="Full name" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
              <input className="form-input" placeholder="Phone number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
            </div>
            <input className="form-input" style={{ marginTop: 12 }} placeholder="Email address" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
          </Section>

          {orderType === "delivery" && (
            <Section title="Delivery Address">
              <input className="form-input" placeholder="House / Street address" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12 }}>
                <input className="form-input" placeholder="Area" value={address.area} onChange={(e) => setAddress({ ...address, area: e.target.value })} />
                <input className="form-input" placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              </div>
              <textarea className="form-input" style={{ marginTop: 12 }} rows={2} placeholder="Delivery instructions (optional)" value={address.instructions} onChange={(e) => setAddress({ ...address, instructions: e.target.value })} />
            </Section>
          )}

          {/* Payment method */}
          <Section title="Payment Method">
            <div style={{ display: "flex", gap: 12 }}>
              <TypeButton active={paymentMethod === "cash"} onClick={() => setPaymentMethod("cash")} icon={<Money size={18} />} label={orderType === "delivery" ? "Cash on Delivery" : "Cash on Pickup"} />
              <TypeButton active={paymentMethod === "online"} onClick={() => setPaymentMethod("online")} icon={<Bank size={18} />} label="Online (Bank Transfer)" />
            </div>
            {paymentMethod === "online" && (
              <div style={{ marginTop: 14, padding: 16, background: "#fef9ef", borderRadius: 12, border: "1px solid #f0dbaa", fontSize: 13.5, lineHeight: 1.8 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Bank Account Details</div>
                <div><strong>Bank:</strong> {settings?.bankName || "—"}</div>
                <div><strong>Account Title:</strong> {settings?.bankAccountTitle || "—"}</div>
                <div><strong>Account No.:</strong> {settings?.bankAccountNumber || "—"}</div>
                <div><strong>IBAN:</strong> {settings?.bankIBAN || "—"}</div>
                <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink-soft)" }}>
                  Your order is created only after you submit the payment screenshot.
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* Order summary */}
        <aside style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 22, padding: 26, height: "fit-content", position: "sticky", top: 100 }}>
          <h3 style={{ fontSize: 19, marginBottom: 18 }}>Order Summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18, maxHeight: 260, overflowY: "auto" }}>
            {items.map((item) => (
              <div key={item.lineKey} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                <span style={{ color: "var(--ink-soft)" }}>
                  {item.quantity}x {item.name} {item.variantLabel && `(${item.variantLabel})`}
                  {item.dealId && <span style={{ fontSize: 11, display: "block", color: "var(--paprika)" }}>Combo deal</span>}
                </span>
                <span style={{ fontWeight: 700 }}>{formatPKR(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <Row label="Subtotal" value={formatPKR(subtotal)} />
            <Row label="Delivery Fee" value={estDeliveryFee === 0 ? "Free" : formatPKR(estDeliveryFee)} />
            <Row label={`Tax (${settings?.taxPercent || 0}%)`} value={formatPKR(estTax)} />
            <div style={{ borderTop: "1px solid var(--line)", marginTop: 6, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 800, fontSize: 16 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 19, color: "var(--paprika)" }}>{formatPKR(estTotal)}</span>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", height: 50, marginTop: 20, opacity: canPlace ? 1 : 0.5, cursor: canPlace ? "pointer" : "not-allowed" }}
            onClick={placeOrder}
            disabled={placing || placingRef.current || !canPlace}
          >
            {placing ? "Please wait..." : isOpen ? "Place Order" : "Restaurant Closed"}
          </button>
          {!isOpen && (
            <p style={{ fontSize: 12.5, color: "var(--paprika)", textAlign: "center", marginTop: 10, fontWeight: 700, lineHeight: 1.5 }}>
              Orders are disabled while the restaurant is closed.
            </p>
          )}
          {isOpen && !canPlace && (
            <p style={{ fontSize: 12.5, color: "var(--paprika)", textAlign: "center", marginTop: 10, fontWeight: 700, lineHeight: 1.5 }}>
              Minimum order is {formatPKR(minOrder)} — add {formatPKR(minOrder - subtotal)} more to place your order.
            </p>
          )}
        </aside>

         <style>{`
           @media (max-width: 860px) { .checkout-page { padding-top: 150px !important; } }
           .form-input { width: 100%; padding: 11px 14px; border-radius: 11px; border: 1.5px solid var(--line); font-family: inherit; font-size: 14px; background: #fff; }
           @media (max-width: 900px) {
             #checkout-grid { grid-template-columns: 1fr !important; }
           }
         `}</style>
      </div>

      {/* Online payment modal */}
      {showOnlineModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99999,
          background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}>
          <div style={{
            background: "#fff", borderRadius: 24, padding: 36,
            maxWidth: 520, width: "100%", maxHeight: "90vh", overflow: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <Bank size={24} /> Bank Transfer
              </h2>
              <button onClick={() => setShowOnlineModal(false)} aria-label="Close" style={{ border: "none", background: "none", cursor: "pointer", padding: 4 }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ background: "#fef9ef", borderRadius: 14, padding: 20, marginBottom: 20, fontSize: 14, lineHeight: 2 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Transfer the total amount to:</div>
              <div><strong>Bank:</strong> {settings?.bankName || "—"}</div>
              <div><strong>Account Title:</strong> {settings?.bankAccountTitle || "—"}</div>
              <div><strong>Account No.:</strong> {settings?.bankAccountNumber || "—"}</div>
              <div><strong>IBAN:</strong> {settings?.bankIBAN || "—"}</div>
              <div style={{ marginTop: 10, fontWeight: 700, fontSize: 18, color: "var(--paprika)" }}>
                Total: {formatPKR(estTotal)}
              </div>
            </div>

            <form onSubmit={handleUploadScreenshot}>
              <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
                Upload Payment Screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setScreenshot(e.target.files[0])}
                style={{ display: "block", marginBottom: 16, fontSize: 13, width: "100%" }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading || !screenshot}
                style={{ width: "100%", height: 50, fontSize: 15 }}
              >
                {uploading ? "Uploading..." : "Submit & Complete Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--ink)", marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function TypeButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "13px 16px",
        borderRadius: 12,
        border: `1.5px solid ${active ? "var(--paprika)" : "var(--line)"}`,
        background: active ? "rgba(194,65,12,0.08)" : "#fff",
        color: active ? "var(--paprika)" : "var(--ink)",
        fontWeight: 700,
        fontSize: 13.5,
        cursor: "pointer",
      }}
    >
      {icon} {label}
    </button>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
      <span style={{ color: "var(--ink-soft)" }}>{label}</span>
      <span style={{ fontWeight: 700, color: highlight || "var(--ink)" }}>{value}</span>
    </div>
  );
}