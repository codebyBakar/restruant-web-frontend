let currency = "Rs.";
const listeners = new Set();

export function getCurrency() {
  return currency;
}

export function setCurrency(symbol) {
  currency = symbol || "Rs.";
  listeners.forEach((fn) => fn(currency));
}

export function subscribeCurrency(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
