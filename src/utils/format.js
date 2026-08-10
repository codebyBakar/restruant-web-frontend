import { getCurrency } from "./currency.js";

export const formatPKR = (amount) => {
  const value = Number(amount) || 0;
  const formatted = value.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${getCurrency()} ${formatted}`;
};

export const todayISO = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};
