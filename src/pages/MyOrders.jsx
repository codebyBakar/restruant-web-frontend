import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { MagnifyingGlass, CaretDown, CaretUp, Clock as ClockIcon, Truck, Check, Timer, Package, CheckCircle, X, ArrowDown, Bank, Trash, WarningCircle } from "phosphor-react";
import api from "../api/axios.js";
import { formatPKR } from "../utils/format.js";
import { optimizeImage } from "../utils/cloudinary.js";
import { useCurrency } from "../hooks/useCurrency.js";
import ImageLightbox from "../components/ImageLightbox.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const ACTIVE_STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery", "ready_for_pickup"];
const DELIVERY_STEPS = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];
const PICKUP_STEPS = ["pending", "confirmed", "preparing", "ready_for_pickup", "pickup_complete"];

const STATUS_LABELS = {
  pending: "Order Received",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  ready_for_pickup: "Ready for Pickup",
  delivered: "Delivered",
  pickup_complete: "Pickup Complete",
  cancelled: "Cancelled",
};

function StatusIcon({ status, size = 16 }) {
  const map = {
    pending: ClockIcon,
    confirmed: Check,
    preparing: Timer,
    out_for_delivery: Truck,
    ready_for_pickup: Package,
    delivered: CheckCircle,
    cancelled: X,
  };
  const Icon = map[status];
  return Icon ? <Icon size={size} weight="bold" /> : null;
}

/* ─── Active Order Card (with tracking steps) ─── */
function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const steps = order.orderType === "pickup" ? PICKUP_STEPS : DELIVERY_STEPS;
  const currentIdx = steps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";

  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 20, overflow: "hidden" }}>
      {/* ── Card Header ── */}
      <div onClick={() => setExpanded(!expanded)} style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: isCancelled ? "var(--line)" : "var(--paprika)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
            <StatusIcon status={order.orderStatus} size={18} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{order.orderNumber}</div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 1 }}>{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "var(--paprika)" }}>{formatPKR(order.total)}</div>
            <span className="badge" style={{ fontSize: 10, background: isCancelled ? "var(--line)" : "var(--paprika)", color: isCancelled ? "var(--ink-soft)" : "#fff" }}>{STATUS_LABELS[order.orderStatus]}</span>
            {order.orderStatus === "ready_for_pickup" && (
              <div className="pickup-alert" style={{ marginTop: 5, fontSize: 10.5, fontWeight: 600, color: "var(--turmeric)", background: "rgba(255,191,0,0.12)", padding: "3px 8px", borderRadius: 8, whiteSpace: "nowrap" }}>
                ⏱ Pickup in {order.pickupPrepMinutes || 25} min
              </div>
            )}
          </div>
          {expanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
        </div>
      </div>

      {/* ── Expanded Content ── */}
      {expanded && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          {/* Tracking Steps */}
          {!isCancelled ? (
            <div style={{ position: "relative", paddingLeft: 28, marginBottom: 18 }}>
              <div style={{ position: "absolute", left: 12, top: 6, bottom: 6, width: 2, background: "var(--line)", borderRadius: 2 }} />
              {steps.map((step, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                const status = order.statusHistory?.find((h) => h.status === step);
                return (
                  <div key={step} style={{ position: "relative", paddingBottom: 18 }}>
                    <div style={{ position: "absolute", left: -23.5, top: 3, width: 18, height: 18, borderRadius: "50%", background: done ? "var(--paprika)" : "var(--line)", border: active ? "3px solid #c0392b" : "none", zIndex: 1 }} />
                    <div>
                      <div style={{ fontWeight: active ? 700 : done ? 600 : 400, fontSize: 13, color: done ? "var(--ink)" : "var(--ink-soft)" }}>{STATUS_LABELS[step]}</div>
                      {status?.timestamp && <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 1 }}>{new Date(status.timestamp).toLocaleString()}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ marginBottom: 18 }}>
              <div style={{ position: "relative", paddingLeft: 28 }}>
                <div style={{ position: "absolute", left: 12, top: 6, bottom: 6, width: 2, background: "#e74c3c", borderRadius: 2 }} />
                {steps.map((step) => {
                  const h = order.statusHistory?.find((h) => h.status === step);
                  if (!h) return null;
                  return (
                    <div key={step} style={{ position: "relative", paddingBottom: 14 }}>
                      <div style={{ position: "absolute", left: -22, top: 3, width: 18, height: 18, borderRadius: "50%", background: "var(--line)", zIndex: 1 }} />
                      <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{STATUS_LABELS[step]}</div>
                    </div>
                  );
                })}
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: -22, top: 3, width: 18, height: 18, borderRadius: "50%", background: "#e74c3c", zIndex: 1 }} />
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#e74c3c" }}>Cancelled</div>
                </div>
              </div>
            </div>
          )}

          {/* Order Info */}
          <div className="order-info-row" style={{ display: "flex", flexDirection:'column', gap: 14, flexWrap: "wrap", marginBottom: 12, fontSize: 12.5 }}>
            <div><span style={{ color: "var(--ink-soft)" }}>Type: </span><span style={{ fontWeight: 600, textTransform: "capitalize" }}>{order.orderType}</span></div>
            {order.orderType === "delivery" && order.deliveryAddress && (
              <div style={{ minWidth: 0, flex: 1 }}><span style={{ color: "var(--ink-soft)" }}>Address: </span><span style={{ fontWeight: 600 }}>{order.deliveryAddress.line1}{order.deliveryAddress.area ? `, ${order.deliveryAddress.area}` : ""}{order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ""}</span></div>
            )}
            {order.paymentMethod && <div><span style={{ color: "var(--ink-soft)" }}>Payment: </span><span style={{ fontWeight: 600, textTransform: "capitalize" }}>{order.paymentMethod}</span></div>}
          </div>

          {/* Items */}
          {order.items?.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: 12.5, padding: "5px 0", gap: 8, borderBottom: i < order.items.length - 1 ? "1px solid var(--line)" : "none" }}>
              <span style={{ minWidth: 0 }}>{item.quantity}x {item.name}{item.variantLabel && <span style={{ color: "var(--ink-soft)", fontSize: 11 }}> ({item.variantLabel})</span>}</span>
              <span style={{ fontWeight: 700, flexShrink: 0 }}>{formatPKR(item.lineTotal)}</span>
            </div>
          ))}

          {/* Totals */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
              <span style={{ color: "var(--ink-soft)" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{formatPKR(order.subtotal ?? order.total)}</span>
            </div>
            {order.orderType === "delivery" && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                <span style={{ color: "var(--ink-soft)" }}>Delivery Fee</span>
                <span style={{ fontWeight: 600 }}>{order.deliveryFee === 0 ? "Free" : formatPKR(order.deliveryFee)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                <span style={{ color: "var(--ink-soft)" }}>Tax</span>
                <span style={{ fontWeight: 600 }}>{formatPKR(order.tax)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px dashed var(--line)", fontSize: 14 }}>
              <strong>Total</strong>
              <strong style={{ color: "var(--paprika)" }}>{formatPKR(order.total)}</strong>
            </div>
          </div>

          {/* Payment Screenshot */}
          {order.paymentMethod === "online" && order.paymentScreenshot?.url && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                <Bank size={14} /> Payment Screenshot
              </div>
              <button
                type="button"
                onClick={() => setLightbox(optimizeImage(order.paymentScreenshot.url, { width: 1200 }))}
                aria-label="View payment screenshot full size"
                style={{ display: "block", padding: 0, border: "none", background: "none", cursor: "pointer", maxWidth: "100%" }}
              >
                <img
                  src={optimizeImage(order.paymentScreenshot.url, { width: 600 })}
                  alt="Payment screenshot"
                  loading="lazy"
                  style={{ maxWidth: "100%", maxHeight: 150, borderRadius: 10, display: "block", border: "1px solid var(--line)" }}
                />
              </button>
              <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 3 }}>Click to view full size</div>
            </div>
          )}
        </div>
      )}

      <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

/* ─── Previous/Completed Order Card ─── */
function PreviousOrderCard({ order, onDelete }) {
  const isDelivered = order.orderStatus === "delivered" || order.orderStatus === "pickup_complete";
  const isCancelled = order.orderStatus === "cancelled";
  const isPickupComplete = order.orderStatus === "pickup_complete";
  const statusLabel = isPickupComplete ? "Pickup Complete" : (order.orderStatus === "delivered" ? "Delivered" : "Cancelled");

  const getStatusTime = (order, status) => {
    const entry = order.statusHistory?.find((h) => h.status === status);
    if (entry?.timestamp) return new Date(entry.timestamp);
    return null;
  };

  const statusTime = isDelivered
    ? (getStatusTime(order, order.orderStatus) || order.updatedAt)
    : (getStatusTime(order, "cancelled") || order.updatedAt);

  const isDeliveryOrder = order.orderType === "delivery";
  const mainTime = isDeliveryOrder
    ? (order.deliveryTime || (getStatusTime(order, "out_for_delivery")?.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })) || "")
    : (order.pickupTime || (getStatusTime(order, "ready_for_pickup")?.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })) || "");

  const timeLabel = isPickupComplete ? "Picked at" : (isDeliveryOrder ? "Delivered at" : "Completed at");

  const itemSummary = order.items?.slice(0, 3).map((i) => `${i.quantity}x ${i.name}`).join(", ");
  const moreItems = order.items?.length > 3 ? ` +${order.items.length - 3} more` : "";

  return (
    <div className="prev-order-card" style={{ background: "#f9f9f9", border: "1px solid var(--line)", borderRadius: 20, padding: "16px 18px", opacity: 0.85 }}>
      {/* Top row: icon + details */}
      <div style={{ display: "flex", gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: isCancelled ? "#e74c3c18" : "#4b7b5b18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {isCancelled ? <X size={18} color="#e74c3c" weight="bold" /> : <CheckCircle size={18} color="#4b7b5b" weight="fill" />}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{order.orderNumber}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 1 }}>
            {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </div>
         
        </div>
      </div>
       <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 5, lineHeight: 1.4 }}>
            {itemSummary}
            {moreItems}
          </div>

      {/* Bottom row: price + status + delete */}
      <div className="prev-order-actions" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--line)", gap: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: isCancelled ? "var(--ink-soft)" : "var(--paprika)", flexShrink: 0 }}>
          {formatPKR(order.total)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100, background: isCancelled ? "#e74c3c18" : "#4b7b5b18", color: isCancelled ? "#e74c3c" : "#4b7b5b", whiteSpace: "nowrap" }}>
            {statusLabel}
          </div>
          <button
            type="button"
            onClick={() => onDelete(order)}
            title="Remove from history"
            aria-label={`Remove ${order.orderNumber} from history`}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", padding: 4, display: "inline-flex" }}
          >
            <Trash size={16} />
          </button>
        </div>
      </div>

      {/* Time row */}
      {(mainTime || (statusTime && isDelivered)) && (
        <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 6 }}>
          <ClockIcon size={13} />
          {timeLabel} {mainTime || new Date(statusTime).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function MyActivity() {
  useCurrency();
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const isActive = order && ACTIVE_STATUSES.includes(order.orderStatus);
  const isCompleted = order && (order.orderStatus === "delivered" || order.orderStatus === "pickup_complete");
  const isCancelled = order && order.orderStatus === "cancelled";

  // Auto-search if ?order=XXX in URL (from OrderSuccess page) or sessionStorage
  useEffect(() => {
    const orderParam = searchParams.get("order");
    if (orderParam) {
      setOrderNumber(orderParam);
      fetchOrder(orderParam);
      return;
    }
    // Check sessionStorage for pending order (set by OrderSuccess "Track Order" button)
    const stored = sessionStorage.getItem("pendingOrder");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.orderNumber) {
          setOrderNumber(parsed.orderNumber);
          fetchOrder(parsed.orderNumber);
          sessionStorage.removeItem("pendingOrder");
        }
      } catch {}
    }
  }, [searchParams]);

  const fetchOrder = async (num) => {
    const trimmed = (num || "").trim();
    if (!trimmed) {
      toast.error("Please enter an order number.");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const { data } = await api.get(`/orders/track/${encodeURIComponent(trimmed)}`);
      setOrder(data.data);
    } catch (err) {
      setOrder(null);
      toast.error(err?.response?.data?.message || "This order is either deleted or the order number is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/orders/my/${deleteTarget.orderNumber}`);
      toast.success("Order removed from your history");
      setDeleteTarget(null);
      setOrder(null);
      setOrderNumber("");
      setSearched(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove order");
    }
  };

  return (
    <div className="container" style={{ padding: "150px 20px 100px", maxWidth: 720 }}>
      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Track your order</div>
        <h1 style={{ fontSize: "clamp(26px, 5vw, 40px)", margin: 0 }}>Track</h1>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8, maxWidth: 520, margin: "8px auto 0", lineHeight: 1.5, padding: "0 8px" }}>
          Enter your order number to see real-time status. You can find it in your order confirmation email and order success receipt.
        </p>
      </div>

      {/* ── Order Number Input ── */}
      <form onSubmit={handleSubmit} className="track-form" style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <input
          required
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="e.g. PC-815U-JKQM"
          className="form-input"
          style={{ flex: 1, minWidth: 0 }}
        />
        <button type="submit" className="btn btn-primary track-btn" disabled={loading} style={{ flexShrink: 0 }}>
          <MagnifyingGlass size={16} /> {loading ? "Searching..." : "Track"}
        </button>
      </form>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div className="spinner" />
          <div style={{ marginTop: 12, fontSize: 13, color: "var(--ink-soft)" }}>Looking up your order...</div>
        </div>
      )}

      {/* ── Single Order Result ── */}
      {!loading && searched && order && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isActive && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                Active Order
              </div>
              <OrderCard order={order} />
            </>
          )}

          {(isCompleted || isCancelled) && (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-soft)", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                {isCancelled ? "Cancelled Order" : "Previous Order"}
              </div>
              <PreviousOrderCard order={order} onDelete={(o) => setDeleteTarget(o)} />
            </>
          )}
        </div>
      )}

      {/* ── Not found ── */}
      {!loading && searched && !order && (
        <div style={{ textAlign: "center", padding: "36px 20px", background: "#fff", borderRadius: 20, border: "1px solid var(--line)" }}>
          <WarningCircle size={40} color="var(--paprika)" weight="fill" style={{ display: "block", margin: "0 auto 12px auto" }} />
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: "var(--ink)" }}>Order Not Found</div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", maxWidth: 340, margin: "0 auto", lineHeight: 1.5 }}>
            This order is either deleted or the order number is incorrect. Please double-check and try again.
          </div>
        </div>
      )}

      {/* ── Confirm Delete Dialog ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Order"
        message={deleteTarget ? `Remove order ${deleteTarget.orderNumber} from your history? This only hides it from your side.` : ""}
        confirmLabel="Remove"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <style>{`
        .form-input { padding: 12px 16px; border-radius: 12px; border: 1.5px solid var(--line); font-family: inherit; font-size: 14px; background: #fff; outline: none; width: 100%; box-sizing: border-box; }
        .form-input:focus { border-color: var(--paprika); }
        .spinner { width: 32px; height: 32px; border: 3px solid var(--line); border-top-color: var(--paprika); border-radius: 50%; animation: spin .6s linear infinite; margin: 0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .badge { padding: 3px 10px; border-radius: 100px; font-size: 10.5px; font-weight: 700; white-space: nowrap; }

        @media (max-width: 480px) {
          .track-form { flex-direction: column; gap: 8px; }
          .track-btn { width: 100%; justify-content: center; display: flex !important; }

          .pickup-alert { font-size: 10px !important; padding: 3px 6px !important; }
        }
      `}</style>
    </div>
  );
}
