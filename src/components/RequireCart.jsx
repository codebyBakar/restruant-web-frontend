import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function RequireCart({ children }) {
  const { items } = useCart();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  if (items.length === 0 && !mounted.current) {
    return <Navigate to="/menu" replace />;
  }
  return children;
}
