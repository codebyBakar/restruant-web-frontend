import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

const LS_NOTIFS = "pratha_admin_notifications";
const LS_SEEN = "pratha_admin_seen_orders";
const LS_BASELINE = "pratha_admin_notif_baseline";
const POLL_MS = 15000;
const WINDOW_MINUTES = 360; // look back up to 6h for new orders

const LIVE_STATUSES = ["pending", "confirmed", "preparing", "out_for_delivery", "ready_for_pickup"];

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() => readJSON(LS_NOTIFS, []));
  const [seenIds, setSeenIds] = useState(() => new Set(readJSON(LS_SEEN, [])));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const baselineRef = useRef(null);
  const knownIdsRef = useRef(new Set(readJSON(LS_NOTIFS, []).map((n) => n._id)));
  const seenRef = useRef(seenIds);
  const toastedRef = useRef(new Set());

  const isAdminArea = window.location.pathname.startsWith("/admin");

  // Keep a live ref of seen ids so the polling closure always sees fresh values.
  useEffect(() => {
    seenRef.current = seenIds;
  }, [seenIds]);

  // Persist notifications + seen ids across reloads.
  useEffect(() => {
    try {
      localStorage.setItem(LS_NOTIFS, JSON.stringify(notifications));
    } catch {
      /* ignore */
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SEEN, JSON.stringify([...seenIds]));
    } catch {
      /* ignore */
    }
  }, [seenIds]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => (prev.some((n) => !n.read) ? prev.map((n) => ({ ...n, read: true })) : prev));
  }, []);

  const markOrderSeen = useCallback((orderId) => {
    if (!orderId) return;
    setSeenIds((prev) => {
      if (prev.has(orderId)) return prev;
      const next = new Set(prev);
      next.add(orderId);
      return next;
    });
    setNotifications((prev) =>
      prev.some((n) => n._id === orderId && !n.read)
        ? prev.map((n) => (n._id === orderId ? { ...n, read: true } : n))
        : prev
    );
  }, []);

  const openDrawer = useCallback(() => {
    setDrawerOpen(true);
    markAllRead();
  }, [markAllRead]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Poll for new orders while the admin is logged in and inside the admin panel.
  useEffect(() => {
    if (!user || !isAdminArea) return;
    let active = true;

    const poll = async () => {
      try {
        const { data } = await api.get(`/orders/recent?minutes=${WINDOW_MINUTES}`);
        const orders = data?.data || [];
        if (!active || !Array.isArray(orders)) return;

        // Baseline: only treat orders placed AFTER the first poll as "new",
        // so we never spam notifications for the existing order history.
        if (baselineRef.current == null) {
          const stored = readJSON(LS_BASELINE, null);
          baselineRef.current = stored ? new Date(stored).getTime() : Date.now();
          if (!stored) {
            try {
              localStorage.setItem(LS_BASELINE, new Date().toISOString());
            } catch {
              /* ignore */
            }
          }
        }

        const fresh = orders.filter(
          (o) =>
            o?._id &&
            !knownIdsRef.current.has(o._id) &&
            !seenRef.current.has(o._id) &&
            new Date(o.createdAt).getTime() > baselineRef.current
        );

        if (fresh.length) {
          const items = fresh.map((o) => ({
            _id: o._id,
            orderNumber: o.orderNumber,
            customerName: o.customer?.name || "Customer",
            total: o.total,
            createdAt: o.createdAt,
            read: false,
          }));

          setNotifications((prev) => {
            const existing = new Set(prev.map((n) => n._id));
            return [...items.filter((it) => !existing.has(it._id)), ...prev];
          });

          const unToasted = fresh.filter((o) => !toastedRef.current.has(o._id));
          if (unToasted.length) {
            unToasted.forEach((o) => toastedRef.current.add(o._id));
            const first = unToasted[0];
            toast(first.orderNumber ? `New order ${first.orderNumber} received` : "New order received", {
              icon: "🔔",
            });
            if (unToasted.length > 1) toast(`${unToasted.length} new orders received`, { icon: "🔔" });
          }
        }

        const ids = new Set(knownIdsRef.current);
        orders.forEach((o) => ids.add(o._id));
        knownIdsRef.current = ids;
      } catch {
        /* silent — retry on next tick */
      }
    };

    poll();
    const t = setInterval(poll, POLL_MS);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [user, isAdminArea]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // A live order is "new" until the admin opens it (markOrderSeen).
  const isOrderNew = useCallback(
    (order) => {
      if (!order?._id) return false;
      if (seenIds.has(order._id)) return false;
      return LIVE_STATUSES.includes(order.orderStatus);
    },
    [seenIds]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        drawerOpen,
        openDrawer,
        closeDrawer,
        markAllRead,
        markOrderSeen,
        isOrderNew,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
};
