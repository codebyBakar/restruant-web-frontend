function toMinutes(time) {
  if (!time || typeof time !== "string") return null;
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

export function to12h(time) {
  if (!time || typeof time !== "string") return time;
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${period}`;
}

export function isStoreOpen(settings, now = new Date()) {
  if (!settings || !settings.storeStatus) return true;
  const st = settings.storeStatus;
  if (st.mode === "manual") return st.manualOpen !== false;
  if (st.mode && st.mode !== "auto") return true;

  const timezone = st.timezone || "Asia/Karachi";
  const openTime = st.openTime || "11:00";
  const closeTime = st.closeTime || "23:00";

  const parts = {};
  try {
    new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .forEach((p) => {
        parts[p.type] = p.value;
      });
  } catch {
    return true;
  }

  const nowMin = Number(parts.hour || 0) * 60 + Number(parts.minute || 0);
  const openMin = toMinutes(openTime);
  const closeMin = toMinutes(closeTime);
  if (openMin === null || closeMin === null) return true;

  if (openMin === closeMin) return false;
  if (closeMin > openMin) return nowMin >= openMin && nowMin < closeMin;
  return nowMin >= openMin || nowMin < closeMin;
}

export function storeClosedMessage(settings, fallback = "We're currently closed.") {
  if (!settings || !settings.storeStatus) return fallback;
  const st = settings.storeStatus;
  if (st.mode === "manual") {
    return (st.closedMessage || "").trim() || fallback;
  }
  const openTime = st.openTime || "11:00";
  const closeTime = st.closeTime || "23:00";
  return `We're currently closed. Opening hours: ${to12h(openTime)} - ${to12h(closeTime)}`;
}

export const STORE_TIMEZONES = [
  { value: "Asia/Karachi", label: "Pakistan (Asia/Karachi)" },
  { value: "Asia/Kolkata", label: "India (Asia/Kolkata)" },
  { value: "Asia/Dubai", label: "UAE (Asia/Dubai)" },
  { value: "Asia/Riyadh", label: "Saudi Arabia (Asia/Riyadh)" },
  { value: "Europe/London", label: "UK (Europe/London)" },
  { value: "Europe/Berlin", label: "Germany (Europe/Berlin)" },
  { value: "Europe/Paris", label: "France (Europe/Paris)" },
  { value: "America/New_York", label: "USA East (America/New_York)" },
  { value: "America/Chicago", label: "USA Central (America/Chicago)" },
  { value: "America/Los_Angeles", label: "USA West (America/Los_Angeles)" },
  { value: "America/Toronto", label: "Canada (America/Toronto)" },
  { value: "Australia/Sydney", label: "Australia (Australia/Sydney)" },
];