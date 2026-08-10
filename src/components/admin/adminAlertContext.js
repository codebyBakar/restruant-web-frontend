import { createContext, useContext } from "react";

export const AdminAlertContext = createContext(null);

export function useAdminAlert() {
  const ctx = useContext(AdminAlertContext);
  if (!ctx) throw new Error("useAdminAlert must be used within AdminAlertProvider");
  return ctx;
}