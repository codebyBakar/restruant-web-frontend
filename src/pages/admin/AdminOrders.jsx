import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MagnifyingGlass, MapPin, Package, Trash } from "phosphor-react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import EmptyState from "../../components/EmptyState.jsx";
import Pagination from "../../components/admin/Pagination.jsx";
import { useAdminAlert } from "../../components/admin/adminAlertContext.js";
import { formatPKR } from "../../utils/format.js";
import { useCurrency } from "../../hooks/useCurrency.js";

const PAGE_SIZE = 10;

const STATUS_COLORS = {
  pending: "#8a5f02",
  confirmed: "#2563eb",
  preparing: "#c2410c",
  out_for_delivery: "#7c3aed",
  ready_for_pickup: "#7c3aed",
  delivered: "#4b7b5b",
  cancelled: "#c0392b",
  pickup_complete: "#4b7b5b",
};

const TABS = [
  { key: "live", label: "Live Orders" },
  { key: "completed", label: "Completed Orders" },
  { key: "cancelled", label: "Cancelled Orders" },
];

const TAB_STATUS_MAP = {
  live: ["pending", "confirmed", "preparing", "out_for_delivery", "ready_for_pickup"],
  completed: ["delivered", "pickup_complete"],
  cancelled: ["cancelled"],
};

export default function AdminOrders() {
  useCurrency();
  const navigate = useNavigate();
  const alert = useAdminAlert();
  const [tab, setTab] = useState("live");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  const load = () => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams({ limit: "100" });
    if (status) {
      params.set("status", status);
    } else {
      const defaultStatuses = TAB_STATUS_MAP[tab];
      if (defaultStatuses.length === 1) params.set("status", defaultStatuses[0]);
      else params.set("status", defaultStatuses.join(","));
    }
    if (search) params.set("search", search);
    api.get(`/orders?${params}`).then(({ data }) => setOrders(data.data)).catch(() => {
      setError(true);
      toast.error("Failed to load orders");
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    setStatus("");
    setPage(1);
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [tab, retryKey]);

  useEffect(() => {
    setPage(1);
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [status, search]);

  const statusOptions = () => {
    if (tab === "live") return ["pending", "confirmed", "preparing", "out_for_delivery", "ready_for_pickup"];
    if (tab === "completed") return ["delivered", "pickup_complete"];
    return [];
  };

  const pageCount = Math.ceil(orders.length / PAGE_SIZE);
  const safePage = Math.min(page, pageCount) || 1;
  const pageItems = orders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleDelete = async (order) => {
    const ok = await alert.confirm({
      title: "Delete Order",
      message: `Delete order #${order.orderNumber}? This action cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.delete(`/orders/${order._id}`);
      toast.success("Order deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete order");
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-title">Orders</h1>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "9px 20px",
              borderRadius: 10,
              border: `1.5px solid ${tab === t.key ? "var(--paprika)" : "var(--line)"}`,
              background: tab === t.key ? "var(--paprika)" : "#fff",
              color: tab === t.key ? "#fff" : "var(--ink)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <MagnifyingGlass size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)" }} />
          <input className="admin-input" style={{ paddingLeft: 36 }} placeholder="Search order #, name, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {statusOptions().length > 0 && (
          <select className="admin-input" style={{ maxWidth: 200 }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All {TABS.find((t) => t.key === tab)?.label}</option>
            {statusOptions().map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        )}
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr><th>Order #</th><th>Customer</th><th>Type</th><th>Payment</th><th>Subtotal</th><th>Total</th><th>Status</th><th>Date</th>{tab !== "live" && <th>Actions</th>}</tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skel-row-${i}`}>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "70%" }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4 }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "55%" }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4 }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "45%" }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "45%" }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4, width: "60%" }} /></td>
                  <td><div className="skeleton" style={{ height: 12, borderRadius: 4 }} /></td>
                </tr>
              ))
            ) : (
              pageItems.map((o) => (
                <tr key={o._id} onClick={() => navigate(`/admin/orders/${o._id}`)} style={{ cursor: "pointer" }}>
                  <td><Link to={`/admin/orders/${o._id}`} onClick={(e) => e.stopPropagation()} style={{ fontWeight: 700, color: "var(--paprika)" }}>{o.orderNumber}</Link></td>
                  <td>{o.customer.name}<div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{o.customer.phone}</div></td>
                  <td>
                    <span className="admin-badge" style={{
                      background: o.orderType === "delivery" ? "#2563eb18" : "#7c3aed18",
                      color: o.orderType === "delivery" ? "#2563eb" : "#7c3aed",
                      fontSize: 11,
                    }}>
                      {o.orderType === "delivery" ? <MapPin size={12} style={{ marginRight: 2, verticalAlign: "middle" }} /> : <Package size={12} weight="bold" style={{ marginRight: 2, verticalAlign: "middle" }} />}
                      {o.orderType}
                    </span>
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{o.paymentMethod} · {o.paymentStatus}</td>
                  <td style={{ color: "var(--ink-soft)" }}>{formatPKR(o.subtotal)}</td>
                  <td style={{ fontWeight: 700 }}>{formatPKR(o.total)}</td>
                  <td><span className="admin-badge" style={{ background: `${STATUS_COLORS[o.orderStatus]}18`, color: STATUS_COLORS[o.orderStatus] }}>{o.orderStatus.replace(/_/g, " ")}</span></td>
                  <td style={{ color: "var(--ink-soft)", fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  {tab !== "live" && (
                    <td>
                      <button className="icon-btn danger" title="Delete order" aria-label="Delete order" onClick={(e) => { e.stopPropagation(); handleDelete(o); }}><Trash size={15} /></button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && error && <EmptyState type="orders" hasError onAction={() => setRetryKey((k) => k + 1)} style={{ margin: 24 }} />}
        {!loading && !error && orders.length === 0 && <EmptyState type="orders" style={{ margin: 24 }} />}
      </div>
      {!loading && !error && <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />}
    </div>
  );
}