import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Clock, MapPin, Money, Bank, Package, Receipt } from "phosphor-react";
import api from "../../api/axios.js";
import { SkeletonDetail } from "../../components/Skeleton.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import ImageLightbox from "../../components/ImageLightbox.jsx";
import ReceiptModal from "../../components/admin/ReceiptModal.jsx";
import { useAdminAlert } from "../../components/admin/adminAlertContext.js";
import { formatPKR } from "../../utils/format.js";
import { useCurrency } from "../../hooks/useCurrency.js";

const STATUS_LABELS = {
  pending: "Order Received",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  ready_for_pickup: "Ready for Pickup",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AdminOrderDetail() {
  useCurrency();
  const { id } = useParams();
  const alert = useAdminAlert();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data.data)).catch(() => {
      setError(true);
      toast.error("Failed to load order");
    }).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const updateStatus = async (orderStatus) => {
    const ok = await alert.confirm({
      title: "Update Order Status",
      message: `Set this order to "${orderStatus.replace(/_/g, " ")}"?`,
      confirmLabel: "Update",
      tone: "success",
    });
    if (!ok) return;
    setUpdating(true);
    try {
      const { data } = await api.put(`/orders/${id}/status`, { orderStatus });
      setOrder(data.data);
      toast.success("Order status updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const updatePayment = async (paymentStatus) => {
    const ok = await alert.confirm({
      title: "Update Payment Status",
      message: `Mark payment as "${paymentStatus.replace(/_/g, " ")}"?`,
      confirmLabel: "Update",
      tone: "success",
    });
    if (!ok) return;
    setUpdating(true);
    try {
      const { data } = await api.put(`/orders/${id}/status`, { paymentStatus });
      setOrder(data.data);
      toast.success("Payment status updated");
    } catch {
      toast.error("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <SkeletonDetail lines={12} />;
  if (error) return <EmptyState type="orders" hasError onAction={load} />;
  if (!order) return <EmptyState type="orders" title="Order not found" subtitle="This order may have been deleted." />;

  const isCancelled = order.orderStatus === "cancelled";
  const orderType = order.orderType;

  return (
    <div>
      <Link to="/admin/orders" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 700, marginBottom: 20, color: "var(--ink-soft)" }}>
        <ArrowLeft size={15} /> Back to Orders
      </Link>

      <div className="admin-page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <h1 className="admin-title" style={{ margin: 0 }}>{order.orderNumber}</h1>
          <span className="admin-badge" style={{
            background: orderType === "delivery" ? "#2563eb18" : "#7c3aed18",
            color: orderType === "delivery" ? "#2563eb" : "#7c3aed",
            textTransform: "capitalize",
            fontSize: 12,
            padding: "4px 14px",
          }}>
            {orderType === "delivery" ? <MapPin size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> : <Package size={14} weight="bold" style={{ marginRight: 4, verticalAlign: "middle" }} />}
            {orderType}
          </span>
          <span className="admin-badge" style={{
            background: isCancelled ? "#c0392b18" : "#4b7b5b18",
            color: isCancelled ? "#c0392b" : "#4b7b5b",
            fontSize: 12,
            padding: "4px 14px",
          }}>
            {STATUS_LABELS[order.orderStatus]}
          </span>
        </div>
        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6 }}>
          <Clock size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
          Placed {new Date(order.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </div>
        <div style={{ marginTop: 14 }}>
          <button
            onClick={() => setShowReceipt(true)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              background: "var(--paprika)", color: "#fff",
              fontWeight: 700, fontSize: 13.5,
            }}
          >
            <Receipt size={16} /> Print Receipt
          </button>
        </div>
      </div>

      <div className="admin-grid-2" style={{ gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Left column: Items + Payment */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, margin: 0 }}>Items Ordered</h3>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-soft)" }}>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
            </div>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < order.items.length - 1 ? "1px solid var(--line)" : "none" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{item.quantity}x {item.name} {item.variantLabel && <span style={{ fontWeight: 400, color: "var(--ink-soft)" }}>({item.variantLabel})</span>}</div>
                  {item.specialInstructions && <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>Note: {item.specialInstructions}</div>}
                </div>
                <div style={{ fontWeight: 700, whiteSpace: "nowrap" }}>{formatPKR(item.lineTotal)}</div>
              </div>
            ))}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              <Row label="Subtotal" value={formatPKR(order.subtotal)} />
              {order.discount > 0 && <Row label={`Discount ${order.dealCode ? `(${order.dealCode})` : ""}`} value={`-${formatPKR(order.discount)}`} />}
              <Row label="Delivery Fee" value={order.orderType === "pickup" ? "Free" : formatPKR(order.deliveryFee)} />
              <Row label="Tax" value={formatPKR(order.tax)} />
              <Row label="Total" value={formatPKR(order.total)} bold />
            </div>
          </div>

          <div className="admin-card">
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Payment</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              {order.paymentMethod === "online" ? <Bank size={16} /> : <Money size={16} />}
              <span style={{ fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>{order.paymentMethod === "online" ? "Online (Bank Transfer)" : "Cash"}</span>
            </div>
            <select className="admin-input" value={order.paymentStatus} disabled={updating} onChange={(e) => updatePayment(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            {order.paymentMethod === "online" && order.paymentScreenshot?.url && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Payment Screenshot</div>
                <img
                  src={order.paymentScreenshot.url}
                  alt="Payment Screenshot"
                  onClick={() => setLightbox(order.paymentScreenshot.url)}
                  style={{ width: "100%", maxHeight: 260, objectFit: "contain", borderRadius: 10, border: "1px solid var(--line)", background: "#fafafa", cursor: "pointer" }}
                />
                <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>Click to view full size</div>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Customer + Order Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="admin-card">
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Customer Details</h3>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{order.customer.name}</div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{order.customer.email}</div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{order.customer.phone}</div>
            {orderType === "delivery" && order.deliveryAddress && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  <MapPin size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
                  Delivery Address
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
                  {order.deliveryAddress.line1}{order.deliveryAddress.area ? `, ${order.deliveryAddress.area}` : ""}
                  {order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ""}
                  {order.deliveryAddress.instructions && (
                    <><br /><span style={{ fontStyle: "italic" }}>Note: {order.deliveryAddress.instructions}</span></>
                  )}
                </div>
              </div>
            )}
            {orderType === "pickup" && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}><Package size={16} weight="bold" style={{ verticalAlign: "middle", marginRight: 4 }} /> Pickup Order</div>
                <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                  Customer will collect from restaurant
                </div>
              </div>
            )}
          </div>

          <div className="admin-card">
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>
              Order Status
              <span style={{ fontWeight: 400, fontSize: 12, color: "var(--ink-soft)", marginLeft: 8 }}>
                ({orderType === "pickup" ? "Pickup" : "Delivery"} flow)
              </span>
            </h3>
            <select className="admin-input" value={order.orderStatus} disabled={updating} onChange={(e) => updateStatus(e.target.value)}>
              {(orderType === "pickup" ? ["pending", "confirmed", "preparing", "ready_for_pickup", "pickup_complete", "cancelled"] : ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
            {orderType === "delivery" ? (
              <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 8 }}>
                Expected flow: Order Received → Confirmed → Preparing → Out for Delivery → Delivered
              </div>
            ) : (
              <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 8 }}>
                Expected flow: Order Received → Confirmed → Preparing → Ready for Pickup → Pickup Complete
              </div>
            )}
            {order.pickupTime && (
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--paprika)", marginTop: 10, padding: "8px 12px", background: "rgba(194,65,12,0.06)", borderRadius: 10 }}>
                Ready for Pickup at: {order.pickupTime}
              </div>
            )}
            {order.deliveryTime && (
              <div style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", marginTop: 10, padding: "8px 12px", background: "#2563eb10", borderRadius: 10 }}>
                Out for Delivery at: {order.deliveryTime}
              </div>
            )}
            {orderType === "pickup" && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>Pickup prep time (min):</label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  className="admin-input"
                  style={{ width: 80, padding: "6px 10px" }}
                  value={order.pickupPrepMinutes || 25}
                  disabled={updating}
                  onChange={(e) => {
                    const raw = e.target.value.trim();
                    if (!raw) return;
                    const val = Number.parseInt(raw, 10);
                    if (!Number.isFinite(val)) return;
                    api.put(`/orders/${id}/status`, { pickupPrepMinutes: val || 25 })
                      .then(({ data }) => setOrder(data.data))
                      .catch(() => toast.error("Failed to update prep time"));
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
      <ReceiptModal order={order} onClose={() => setShowReceipt(false)} show={showReceipt} />
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: bold ? 15 : 13.5, fontWeight: bold ? 800 : 400 }}>
      <span style={{ color: bold ? "var(--ink)" : "var(--ink-soft)" }}>{label}</span>
      <span style={{ fontWeight: 700, color: bold ? "var(--paprika)" : "var(--ink)" }}>{value}</span>
    </div>
  );
}
