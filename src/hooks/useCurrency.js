import { useEffect, useState } from "react";
import { getCurrency, subscribeCurrency } from "../utils/currency.js";

export function useCurrency() {
  const [currency, setCurrencyState] = useState(() => getCurrency());

  useEffect(() => subscribeCurrency(setCurrencyState), []);

  return currency;
}
