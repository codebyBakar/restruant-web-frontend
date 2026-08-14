import { useEffect, useState } from "react";
import { timeAgo } from "../utils/timeAgo.js";

// Renders "just now" / "5m ago" / "1h ago" and re-renders every 30s so the
// label keeps updating live (e.g. "just now" -> "1m ago").
export default function RelativeTime({ date, style }) {
  const [label, setLabel] = useState(() => timeAgo(date));

  useEffect(() => {
    setLabel(timeAgo(date));
    const t = setInterval(() => setLabel(timeAgo(date)), 30000);
    return () => clearInterval(t);
  }, [date]);

  const full = date
    ? new Date(date).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <span title={full} style={style}>
      {label}
    </span>
  );
}
