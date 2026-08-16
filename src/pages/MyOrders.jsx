import { useCallback, useEffect, useReducer, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { MagnifyingGlass, CaretDown, CaretUp, Calendar, Clock as ClockIcon, Users, Truck, Check, Timer, Package, CheckCircle, X, ArrowDown, Bank, Trash } from "phosphor-react";
import api from "../api/axios.js";
import { formatPKR } from "../utils/format.js";
import { optimizeImage } from "../utils/cloudinary.js";
import { useCurrency } from "../hooks/useCurrency.js";
import ImageLightbox from "../components/ImageLightbox.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { SkeletonList } from "../components/Skeleton.jsx";

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

const RES_STATUS_BADGE = {
  pending: { label: "Pending", bg: "#f59e0b18", color: "#f59e0b" },
  confirmed: { label: "Confirmed", bg: "#2563eb18", color: "#2563eb" },
  seated: { label: "Seated", bg: "#7c3aed18", color: "#7c3aed" },
  completed: { label: "Completed", bg: "#4b7b5b18", color: "#4b7b5b" },
  cancelled: { label: "Cancelled", bg: "#c0392b18", color: "#c0392b" },
};

function getStatusTime(order, status) {
  const entry = order.statusHistory?.find((h) => h.status === status);
  if (entry?.timestamp) return new Date(entry.timestamp);
  return null;
}

function OrderCard({ order, defaultOpen }) {
  const [expanded, setExpanded] = useState(defaultOpen || false);
  const [lightbox, setLightbox] = useState(null);
  const steps = order.orderType === "pickup" ? PICKUP_STEPS : DELIVERY_STEPS;
  const currentIdx = steps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";

  return (
    
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 20, overflow: "hidden" }}>
      
      <div onClick={() => setExpanded(!expanded)} style={{ padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: isCancelled ? "var(--line)" : "var(--paprika)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
            <StatusIcon status={order.orderStatus} size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{order.orderNumber}</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "var(--paprika)" }}>{formatPKR(order.total)}</div>
            <span className="badge" style={{ fontSize: 10.5, background: isCancelled ? "var(--line)" : "var(--paprika)", color: isCancelled ? "var(--ink-soft)" : "#fff" }}>{STATUS_LABELS[order.orderStatus]}</span>
            {order.orderStatus === "ready_for_pickup" && (
              <div style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: "var(--turmeric)", background: "rgba(255,191,0,0.12)", padding: "4px 10px", borderRadius: 8, whiteSpace: "nowrap" }}>
                ⏱ Please pickup in {order.pickupPrepMinutes || 25} min
              </div>
            )}
          </div>
          {expanded ? <CaretUp size={18} /> : <CaretDown size={18} />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 22px 22px", borderTop: "1px solid var(--line)", paddingTop: 18 }}>
          {!isCancelled ? (
            <div style={{ position: "relative", paddingLeft: 28, marginBottom: 20 }}>
              <div style={{ position: "absolute", left: 12, top: 6, bottom: 6, width: 2, background: "var(--line)", borderRadius: 2 }} />
              {steps.map((step, i) => {
                const done = i <= currentIdx;
                const active = i === currentIdx;
                const status = order.statusHistory?.find((h) => h.status === step);
                return (
                  <div key={step} style={{ position: "relative", paddingBottom: 20 }}>
                    <div style={{ position: "absolute", left: -23.5, top: 3, width: 18, height: 18, borderRadius: "50%", background: done ? "var(--paprika)" : "var(--line)", border: active ? "3px solid #c0392b" : "none", zIndex: 1 }} />
                    <div>
                      <div style={{ fontWeight: active ? 700 : done ? 600 : 400, fontSize: 13.5, color: done ? "var(--ink)" : "var(--ink-soft)" }}>{STATUS_LABELS[step]}</div>
                      {status?.timestamp && <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 1 }}>{new Date(status.timestamp).toLocaleString()}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <div style={{ position: "relative", paddingLeft: 28 }}>
                <div style={{ position: "absolute", left: 12, top: 6, bottom: 6, width: 2, background: "#e74c3c", borderRadius: 2 }} />
                {steps.map((step, i) => {
                  const h = order.statusHistory?.find((h) => h.status === step);
                  if (!h) return null;
                  return (
                    <div key={step} style={{ position: "relative", paddingBottom: 16 }}>
                      <div style={{ position: "absolute", left: -22, top: 3, width: 18, height: 18, borderRadius: "50%", background: "var(--line)", zIndex: 1 }} />
                      <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{STATUS_LABELS[step]}</div>
                    </div>
                  );
                })}
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: -22, top: 3, width: 18, height: 18, borderRadius: "50%", background: "#e74c3c", zIndex: 1 }} />
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: "#e74c3c" }}>Cancelled</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14, fontSize: 13 }}>
            <div><span style={{ color: "var(--ink-soft)" }}>Type: </span><span style={{ fontWeight: 600, textTransform: "capitalize" }}>{order.orderType}</span></div>
            {order.orderType === "delivery" && order.deliveryAddress && (
              <div><span style={{ color: "var(--ink-soft)" }}>Address: </span><span style={{ fontWeight: 600 }}>{order.deliveryAddress.line1}{order.deliveryAddress.area ? `, ${order.deliveryAddress.area}` : ""}{order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ""}</span></div>
            )}
            {order.paymentMethod && <div><span style={{ color: "var(--ink-soft)" }}>Payment: </span><span style={{ fontWeight: 600, textTransform: "capitalize" }}>{order.paymentMethod}</span></div>}
          </div>

          {order.items?.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "5px 0", borderBottom: i < order.items.length - 1 ? "1px solid var(--line)" : "none" }}>
              <span>{item.quantity}x {item.name}{item.variant && <span style={{ color: "var(--ink-soft)", fontSize: 12 }}> ({item.variant})</span>}</span>
              <span style={{ fontWeight: 700 }}>{formatPKR(item.lineTotal)}</span>
            </div>
          ))}

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "var(--ink-soft)" }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>{formatPKR(order.subtotal ?? order.total)}</span>
            </div>
            {order.orderType === "delivery" && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--ink-soft)" }}>Delivery Fee</span>
                <span style={{ fontWeight: 600 }}>{order.deliveryFee === 0 ? "Free" : formatPKR(order.deliveryFee)}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--ink-soft)" }}>Tax</span>
                <span style={{ fontWeight: 600 }}>{formatPKR(order.tax)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px dashed var(--line)", fontSize: 14 }}>
              <strong>Total</strong>
              <strong style={{ color: "var(--paprika)" }}>{formatPKR(order.total)}</strong>
            </div>
          </div>

          {order.paymentMethod === "online" && order.paymentScreenshot?.url && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Bank size={15} /> Payment Screenshot
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
                  style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 10, display: "block", border: "1px solid var(--line)" }}
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

function PreviousOrderCard({ order, onDelete }) {
  const isDelivered = order.orderStatus === "delivered" || order.orderStatus === "pickup_complete";
  const isCancelled = order.orderStatus === "cancelled";
  const isPickupComplete = order.orderStatus === "pickup_complete";
  const statusLabel = isPickupComplete
    ? "Pickup Complete"
    : (order.orderStatus === "delivered" ? "Delivered" : "Cancelled");

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
    <div style={{
      background: "#f9f9f9",
      border: "1px solid var(--line)",
      borderRadius: 20,
      padding: "18px 22px",
      opacity: 0.8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ display: "flex", gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: isCancelled ? "#e74c3c18" : "#4b7b5b18",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {isCancelled
              ? <X size={20} color="#e74c3c" weight="bold" />
              : <CheckCircle size={20} color="#4b7b5b" weight="fill" />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{order.orderNumber}</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 1 }}>
              {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 6, lineHeight: 1.4 }}>
              {itemSummary}{moreItems}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: isCancelled ? "var(--ink-soft)" : "var(--paprika)" }}>
              {formatPKR(order.total)}
            </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginTop: 4 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
              background: isCancelled ? "#e74c3c18" : "#4b7b5b18",
              color: isCancelled ? "#e74c3c" : "#4b7b5b",
              whiteSpace: "nowrap",
            }}>
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
      </div>
      {(mainTime || (statusTime && isDelivered)) && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)", fontSize: 12, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 6 }}>
          <ClockIcon size={14} />
          {timeLabel} {mainTime || new Date(statusTime).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
}

const SEARCH_INITIAL = { email: "", selected: null, orders: [], loading: false, searched: false, showPrevious: false };

function searchReducer(state, action) {
  switch (action.type) {
    case "SELECT_TYPE":
      return { ...SEARCH_INITIAL, selected: action.value };
    case "SET_EMAIL":
      return { ...state, email: action.value };
    case "FETCH_START":
      return { ...state, loading: true, searched: true };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, orders: action.orders };
    case "FETCH_ERROR":
      return { ...state, loading: false };
    case "TOGGLE_PREVIOUS":
      return { ...state, showPrevious: !state.showPrevious };
    case "BACK":
      return SEARCH_INITIAL;
    default:
      return state;
  }
}

export default function MyActivity() {
  useCurrency();
  const [searchParams] = useSearchParams();
  const [state, dispatch] = useReducer(searchReducer, undefined, () => ({
    ...SEARCH_INITIAL,
    email: searchParams.get("email") || "",
  }));

  const { email, selected, orders, loading, searched, showPrevious } = state;
  const [deleteTarget, setDeleteTarget] = useState(null);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.orderStatus));
  const previousOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.orderStatus));

  const fetchData = useCallback(async (emailToSearch) => {
    dispatch({ type: "FETCH_START" });
    try {
      const { data } = await api.get(`/orders/my-orders?email=${encodeURIComponent(emailToSearch)}`);
      dispatch({ type: "FETCH_SUCCESS", orders: data.data });
      if (!data.data.length) toast("No orders found for this email.");
    } catch (err) {
      dispatch({ type: "FETCH_ERROR" });
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  }, []);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const typeParam = searchParams.get("type");
    if (!typeParam) return;
    dispatch({ type: "SELECT_TYPE", value: typeParam });
    const mail = emailParam || sessionStorage.getItem("pratha_my_orders_email");
    if (mail) {
      dispatch({ type: "SET_EMAIL", value: mail });
      fetchData(mail);
    }
  }, [searchParams, fetchData]);

  const handleSelectType = (type) => {
    dispatch({ type: "SELECT_TYPE", value: type });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData(email.trim());
  };

  const handleBack = () => {
    dispatch({ type: "BACK" });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/orders/my/${deleteTarget.orderNumber}?email=${encodeURIComponent(email)}`);
      toast.success("Order removed from your history");
      setDeleteTarget(null);
      fetchData(email);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to remove order");
    }
  };

  return (
    <div className="container" style={{ padding: "150px 24px 90px", maxWidth: 720 }}>
      <div style={{ textAlign: "center", marginBottom: 34 }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Track your orders</div>
        <h1 style={{ fontSize: "clamp(28px,3.6vw,40px)" }}>Track</h1>
      </div>

      {!selected ? (
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10 }}>
          <button onClick={() => handleSelectType("orders")} style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
            padding: "40px 20px", borderRadius: 22, cursor: "pointer",
            border: "2px solid var(--line)", background: "#fff",
            fontWeight: 700, fontSize: 17, transition: "all .25s",
            width: "100%", maxWidth: 340,
          }}>
            <Truck size={48} color="var(--paprika)" />
            <span style={{ color: "var(--ink)" }}>Orders</span>
            <span style={{ fontSize: 13, fontWeight: 400, color: "var(--ink-soft)" }}>Track your food orders</span>
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
            <button onClick={handleBack} style={{
              border: "1.5px solid var(--line)", background: "#fff", borderRadius: 12,
              padding: "8px 12px", cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>
              ← Back
            </button>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              fontWeight: 700, fontSize: 15, color: "var(--paprika)",
            }}>
              <Truck size={20} /> Orders
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
            <input required type="email" value={email} onChange={(e) => dispatch({ type: "SET_EMAIL", value: e.target.value })}
              placeholder="Enter your email address" className="form-input" style={{ flex: 1, minWidth: 220 }} />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <MagnifyingGlass size={16} /> {loading ? "Searching..." : "Search"}
            </button>
          </form>

          {loading && <SkeletonList count={4} />}

          {!loading && searched && selected === "orders" && (
            orders.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {activeOrders.length > 0 && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                      Active Orders ({activeOrders.length})
                    </div>
                    {activeOrders.map((order, i) => <OrderCard key={order._id} order={order} defaultOpen={i === 0} />)}
                  </>
                )}

                {previousOrders.length > 0 && (
                  <div style={{ marginTop: activeOrders.length > 0 ? 8 : 0 }}>
                    <button
                      onClick={() => dispatch({ type: "TOGGLE_PREVIOUS" })}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 10, padding: "16px 20px", borderRadius: 16, border: "1.5px solid var(--line)",
                        background: showPrevious ? "#f9f9f9" : "#fff", cursor: "pointer",
                        fontSize: 14, fontWeight: 700, color: "var(--ink)", transition: "all .2s",
                      }}
                    >
                      <span>Previous Orders ({previousOrders.length})</span>
                      <ArrowDown size={18} style={{ transform: showPrevious ? "rotate(180deg)" : "none", transition: "transform .25s" }} />
                    </button>
                    {showPrevious && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                        {previousOrders.map((order) => (
                          <PreviousOrderCard key={order._id} order={order} onDelete={(o) => setDeleteTarget(o)} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : <p style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 14 }}>No orders found for this email.</p>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Order"
        message={deleteTarget ? `Remove order ${deleteTarget.orderNumber} from your history? This only hides it from your side.` : ""}
        confirmLabel="Remove"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <style>{`
        .form-input { padding: 12px 16px; border-radius: 12px; border: 1.5px solid var(--line); font-family: inherit; font-size: 14px; background: #fff; outline: none; width: 100%; box-sizing: border-box; }
        .form-input:focus { border-color: var(--paprika); }
        .spinner { width: 32px; height: 32px; border: 3px solid var(--line); border-top-color: var(--paprika); border-radius: 50%; animation: spin .6s linear infinite; margin: 0 auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .badge { padding: 3px 10px; border-radius: 100px; font-size: 10.5px; font-weight: 700; white-space: nowrap; }
      `}</style>
    </div>
  );
}
