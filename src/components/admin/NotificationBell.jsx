import { Bell } from "phosphor-react";
import { useNotification } from "../../context/NotificationContext.jsx";

export default function NotificationBell() {
  const { unreadCount, openDrawer } = useNotification();

  return (
    <button
      className="admin-topbar-btn"
      onClick={openDrawer}
      aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
    >
      <Bell size={20} weight={unreadCount > 0 ? "fill" : "regular"} />
      {unreadCount > 0 && <span className="admin-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
    </button>
  );
}
