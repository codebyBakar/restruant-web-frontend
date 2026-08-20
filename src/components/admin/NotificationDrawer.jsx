import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bell, Check, ShoppingCart, Trash, X } from "phosphor-react";
import { useNotification } from "../../context/NotificationContext.jsx";
import ConfirmDialog from "../ConfirmDialog.jsx";
import RelativeTime from "../RelativeTime.jsx";
import { formatPKR } from "../../utils/format.js";

export default function NotificationDrawer() {
  const {
    notifications,
    unreadCount,
    drawerOpen,
    closeDrawer,
    markAllRead,
    markOrderSeen,
    deleteNotification,
    deleteAllNotifications,
  } = useNotification();
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState(null);

  const openOrder = (n) => {
    markOrderSeen(n._id);
    closeDrawer();
    navigate(`/admin/orders/${n._id}`);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "all") deleteAllNotifications();
    else deleteNotification(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            role="button"
            aria-label="Close notifications"
            style={{ position: "fixed", inset: 0, background: "rgba(20,14,10,0.45)", zIndex: 400 }}
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
              width: "min(400px, 100vw)",
              background: "#fff",
              zIndex: 401,
              display: "flex",
              flexDirection: "column",
              boxShadow: "-16px 0 40px rgba(0,0,0,.25)",
            }}
          >
            <div
              style={{
                padding: "20px 20px 14px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <Bell size={20} weight="fill" color="var(--paprika)" />
                <h3 style={{ fontSize: 18, margin: 0, whiteSpace: "nowrap" }}>Notifications</h3>
                {unreadCount > 0 && (
                  <span className="admin-badge" style={{ background: "rgba(194,65,12,.12)", color: "var(--paprika)", whiteSpace: "nowrap" }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                {notifications.length > 0 && (
                  <button
                    onClick={() => setPendingDelete({ type: "all" })}
                    aria-label="Delete all notifications"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      border: "none",
                      background: "none",
                      color: "var(--ink-soft)",
                      fontSize: 12.5,
                      fontWeight: 700,
                      padding: "4px 6px",
                      cursor: "pointer",
                    }}
                  >
                    <Trash size={14} /> Delete all
                  </button>
                )}
                <button onClick={closeDrawer} aria-label="Close notifications" style={{ background: "none", border: "none", padding: 4, cursor: "pointer" }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: 24,
                  textAlign: "center",
                }}
              >
                <Bell size={38} color="var(--ink-soft)" opacity={0.35} />
                <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
                  No notifications yet.
                  <br />
                  New orders will show up here.
                </p>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: "auto" }}>
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openOrder(n)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openOrder(n);
                      }
                    }}
                    className={n.read ? "" : "notif-row-new"}
                    style={{
                      display: "flex",
                      width: "100%",
                      gap: 12,
                      alignItems: "flex-start",
                      textAlign: "left",
                      padding: "14px 12px 14px 20px",
                      border: "none",
                      borderBottom: "1px solid var(--line)",
                      background: n.read ? "#fff" : "#ffecec",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(194,65,12,.1)",
                        color: "var(--paprika)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ShoppingCart size={18} />
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 13.5 }}>{n.orderNumber}</span>
                        {!n.read && <span className="order-new-dot" style={{ width: 7, height: 7, marginRight: 0 }} />}
                      </span>
                      <span style={{ display: "block", fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {n.customerName} · {formatPKR(n.total)}
                      </span>
                      <span style={{ display: "block", fontSize: 11.5, color: "var(--ink-soft)", marginTop: 3 }}>
                        <RelativeTime date={n.createdAt} />
                      </span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDelete({ type: "single", id: n._id, label: n.orderNumber });
                      }}
                      aria-label={`Delete notification ${n.orderNumber}`}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 6,
                        color: "var(--ink-soft)",
                        cursor: "pointer",
                        flexShrink: 0,
                        borderRadius: 8,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--paprika)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-soft)")}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ padding: "14px 20px 18px", borderTop: "1px solid var(--line)" }}>
              <button
                onClick={markAllRead}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  border: "none",
                  background: "var(--paprika)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                <Check size={16} weight="bold" /> Mark all read
              </button>
            </div>
          </m.aside>
        </>
      )}
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete notification?"
        message={
          pendingDelete?.type === "all"
            ? `Are you sure you want to delete all ${notifications.length} notifications? This cannot be undone.`
            : `Delete notification for ${pendingDelete?.label || "this order"}? This cannot be undone.`
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </AnimatePresence>
  );
}
