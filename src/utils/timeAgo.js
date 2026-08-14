// Format a date as a friendly relative time: "just now", "5m ago", "1h ago", "3d ago"
export function timeAgo(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const diff = Date.now() - date.getTime();
  if (Number.isNaN(diff) || diff < 0) return "";

  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "just now";

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
