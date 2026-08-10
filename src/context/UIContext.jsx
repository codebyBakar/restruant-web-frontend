import { createContext, useContext, useState } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeDeal, setActiveDeal] = useState(null);

  const openProduct = (product) => setActiveProduct(product);
  const closeProduct = () => setActiveProduct(null);
  const openDeal = (deal) => setActiveDeal(deal);
  const closeDeal = () => setActiveDeal(null);
  const openCart = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  return (
    <UIContext.Provider
      value={{
        cartOpen, openCart, closeCart,
        activeProduct, openProduct, closeProduct,
        activeDeal, openDeal, closeDeal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
};
