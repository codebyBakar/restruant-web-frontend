import { useEffect, useState } from "react";
import api from "../api/axios";
import { setCurrency } from "../utils/currency.js";
import { getSettings, setSettings, subscribeSettings } from "../utils/settingsStore.js";

let fetchPromise = null;

function applySettings(data) {
  if (!data) return;
  setCurrency(data.currency || "Rs.");
  document.title = `${data.siteName || "Pratha"} | Authentic Parathas & Rolls`;
}

function fetchSettingsOnce() {
  if (!fetchPromise) {
    fetchPromise = api
      .get("/settings")
      .then(({ data }) => {
        setSettings(data.data);
        applySettings(data.data);
        return data.data;
      })
      .catch(() => null)
      .finally(() => {
        fetchPromise = null;
      });
  }
  return fetchPromise;
}

export function useSettings() {
  const [settings, setSettingsState] = useState(getSettings());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeSettings((data) => {
      setSettingsState(data);
      applySettings(data);
    });

    fetchSettingsOnce().finally(() => setLoading(false));

    return unsubscribe;
  }, []);

  return { settings, loading };
}

export { setSettings };
