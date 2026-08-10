import { useEffect, useState } from "react";
import { useSettings } from "./useSettings.js";
import { isStoreOpen } from "../utils/storeStatus.js";

const CHECK_INTERVAL = 30000;

export function useStoreStatus() {
  const { settings } = useSettings();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), CHECK_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return {
    isOpen: isStoreOpen(settings, now),
    settings,
  };
}