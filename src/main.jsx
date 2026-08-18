import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { UIProvider } from "./context/UIContext.jsx";
import AdminAlertProvider from "./components/admin/AdminAlert.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <UIProvider>
          <LazyMotion features={domAnimation}>
          <AdminAlertProvider>
            <App />
            <Toaster
              position="top-center"
              containerStyle={{ zIndex: 999999 }}
              toastOptions={{
                style: {
                  background: "#211711",
                  color: "#fbf3e6",
                  borderRadius: "999px",
                  padding: "10px 18px",
                  fontFamily: "Manrope, sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                },
              }}
            />
          </AdminAlertProvider>
          </LazyMotion>
          </UIProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);