import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ShoppingCart, CurrencyDollar, Clock, TrendUp } from "phosphor-react";
import api from "../../api/axios.js";
import EmptyState from "../../components/EmptyState.jsx";
import RelativeTime from "../../components/RelativeTime.jsx";
import { useNotification } from "../../context/NotificationContext.jsx";
import { formatPKR } from "../../utils/format.js";
import { useCurrency } from "../../hooks/useCurrency.js";

export default function Dashboard() {
  useCurrency();
  const { isOrderNew } = useNotification();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([api.get("/orders/stats/dashboard"), api.get("/orders?limit=6")])
      .then(([s, o]) => {
        setStats(s.data.data);
        setRecentOrders(o.data.data);
      })
      .catch(() => {
        setError(true);
        toast.error("Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, [retryKey]);

  const cards = [
    { label: "Today's Orders", value: stats?.todayOrders, icon: ShoppingCart, color: "var(--paprika)" },
    { label: "Total Revenue", value: stats ? formatPKR(stats.totalRevenue) : null, icon: CurrencyDollar, color: "var(--mint)" },
    { label: "Active Orders", value: stats?.pendingOrders, icon: Clock, color: "var(--turmeric)" },
    { label: "Total Orders", value: stats?.totalOrders, icon: TrendUp, color: "var(--ink)" },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-title">Dashboard</h1>
      </div>

      {error ? (
        <EmptyState type="orders" hasError onAction={() => setRetryKey((k) => k + 1)} style={{ marginBottom: 30 }} />
      ) : (
        <>
          <div className="admin-grid-4" style={{ marginBottom: 30 }}>
        {cards.map((c) => (
          <div key={c.label} className="admin-stat-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <c.icon size={22} color={c.color} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              {loading ? <span className="skeleton" style={{ display: "inline-block", width: 60, height: 28 }} /> : c.value}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div className="admin-card" style={{ overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 17 }}>Recent Orders</h3>
          <Link to="/admin/orders" style={{ fontSize: 13, fontWeight: 700, color: "var(--paprika)" }}>View all</Link>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Total</th>
              <th>Placed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skel-row-${i}`}>
                  <td colSpan={6}><div className="skeleton" style={{ height: 14, borderRadius: 4 }} /></td>
                </tr>
              ))
            ) : (
              recentOrders.map((o) => {
                const isNew = isOrderNew(o);
                return (
                <tr key={o._id} className={isNew ? "order-new-row" : ""}>
                  <td>
                    {isNew && <span className="order-new-dot" aria-hidden="true" />}
                    <Link to={`/admin/orders/${o._id}`} style={{ fontWeight: 700, color: "var(--paprika)" }}>{o.orderNumber}</Link>
                  </td>
                  <td>{o.customer.name}</td>
                  <td style={{ textTransform: "capitalize" }}>{o.orderType}</td>
                  <td style={{ fontWeight: 700 }}>{formatPKR(o.total)}</td>
                  <td style={{ color: "var(--ink-soft)", fontSize: 12 }}><RelativeTime date={o.createdAt} /></td>
                  <td><span className="admin-badge" style={{ background: "var(--cream-2)" }}>{o.orderStatus.replace(/_/g, " ")}</span></td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
        </>
      )}
    </div>
  );
}
