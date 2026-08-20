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

const CURRENCY_CODE_BY_SYMBOL = {
  "Rs.": "PKR",
  $: "USD",
  "£": "GBP",
  "€": "EUR",
  "₹": "INR",
  AED: "AED",
  SAR: "SAR",
};

const CURRENCY_COUNTRIES = {
  PKR: [{ value: "Asia/Karachi", country: "Pakistan", tz: "PKT · GMT+5" }],
  USD: [{ value: "America/New_York", country: "United States", tz: "ET · GMT-5" }],
  GBP: [{ value: "Europe/London", country: "United Kingdom", tz: "GMT / BST" }],
  EUR: [
    { value: "Europe/Berlin", country: "Germany", tz: "CET · GMT+1" },
    { value: "Europe/Paris", country: "France", tz: "CET · GMT+1" },
    { value: "Europe/Rome", country: "Italy", tz: "CET · GMT+1" },
    { value: "Europe/Madrid", country: "Spain", tz: "CET · GMT+1" },
    { value: "Europe/Amsterdam", country: "Netherlands", tz: "CET · GMT+1" },
    { value: "Europe/Brussels", country: "Belgium", tz: "CET · GMT+1" },
    { value: "Europe/Dublin", country: "Ireland", tz: "GMT · GMT+0" },
    { value: "Europe/Lisbon", country: "Portugal", tz: "WET · GMT+0" },
    { value: "Europe/Vienna", country: "Austria", tz: "CET · GMT+1" },
    { value: "Europe/Athens", country: "Greece", tz: "EET · GMT+2" },
    { value: "Europe/Helsinki", country: "Finland", tz: "EET · GMT+2" },
    { value: "Europe/Warsaw", country: "Poland", tz: "CET · GMT+1" },
    { value: "Europe/Prague", country: "Czechia", tz: "CET · GMT+1" },
    { value: "Europe/Budapest", country: "Hungary", tz: "CET · GMT+1" },
    { value: "Europe/Luxembourg", country: "Luxembourg", tz: "CET · GMT+1" },
    { value: "Europe/Stockholm", country: "Sweden", tz: "CET · GMT+1" },
    { value: "Europe/Copenhagen", country: "Denmark", tz: "CET · GMT+1" },
    { value: "Europe/Sofia", country: "Bulgaria", tz: "EET · GMT+2" },
    { value: "Europe/Bucharest", country: "Romania", tz: "EET · GMT+2" },
    { value: "Europe/Zagreb", country: "Croatia", tz: "CET · GMT+1" },
    { value: "Europe/Bratislava", country: "Slovakia", tz: "CET · GMT+1" },
    { value: "Europe/Ljubljana", country: "Slovenia", tz: "CET · GMT+1" },
    { value: "Europe/Vilnius", country: "Lithuania", tz: "EET · GMT+2" },
    { value: "Europe/Riga", country: "Latvia", tz: "EET · GMT+2" },
    { value: "Europe/Tallinn", country: "Estonia", tz: "EET · GMT+2" },
    { value: "Europe/Nicosia", country: "Cyprus", tz: "EET · GMT+2" },
    { value: "Europe/Malta", country: "Malta", tz: "CET · GMT+1" },
    { value: "Europe/Andorra", country: "Andorra", tz: "CET · GMT+1" },
    { value: "Europe/Monaco", country: "Monaco", tz: "CET · GMT+1" },
    { value: "Europe/San_Marino", country: "San Marino", tz: "CET · GMT+1" },
  ],
  INR: [{ value: "Asia/Kolkata", country: "India", tz: "IST · GMT+5:30" }],
  AED: [{ value: "Asia/Dubai", country: "United Arab Emirates", tz: "GST · GMT+4" }],
  SAR: [{ value: "Asia/Riyadh", country: "Saudi Arabia", tz: "AST · GMT+3" }],
};

// Countries available for store hours, filtered by the currency set in site settings.
// Each country shows its overall standard timezone (not a city-specific zone).
export function getTimezonesForCurrency(currencySymbol) {
  const code = CURRENCY_CODE_BY_SYMBOL[currencySymbol];
  const list = CURRENCY_COUNTRIES[code];
  if (!list || !list.length) return [{ value: "Asia/Karachi", country: "Pakistan", tz: "PKT · GMT+5" }];
  return list.map((c) => ({ value: c.value, label: `${c.country} (${c.tz})` }));
}