import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "pratha_cart_v1";

function loadInitialCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const { item } = action;
      const existingIndex = state.findIndex(
        (i) =>
          (item.dealId ? i.dealId === item.dealId : i.productId === item.productId) &&
          i.variantLabel === item.variantLabel
      );
      if (existingIndex > -1) {
        const next = [...state];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + item.quantity,
        };
        return next;
      }
      return [...state, item];
    }
    case "UPDATE_QUANTITY": {
      const { lineKey, quantity } = action;
      if (quantity <= 0) {
        return state.filter((i) => i.lineKey !== lineKey);
      }
      return state.map((i) => (i.lineKey === lineKey ? { ...i, quantity } : i));
    }
    case "REMOVE_ITEM":
      return state.filter((i) => i.lineKey !== action.lineKey);
    case "CLEAR":
      return [];
    case "SET":
      return action.items;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadInitialCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, variant, quantity, specialInstructions = "") => {
    const unitPrice = variant ? variant.price : product.discountPrice || product.basePrice;
    const lineKey = `${product._id}__${variant?.label || "default"}`;
    dispatch({
      type: "ADD_ITEM",
      item: {
        lineKey,
        productId: product._id,
        name: product.name,
        image: product.images?.[0]?.url || "",
        variantLabel: variant?.label || "",
        unitPrice,
        quantity,
        specialInstructions,
      },
    });
  }, []);

  const addDeal = useCallback((deal) => {
    const lineKey = `deal__${deal._id}`;
    dispatch({
      type: "ADD_ITEM",
      item: {
        lineKey,
        dealId: deal._id,
        name: deal.title,
        image: deal.image?.url || "",
        unitPrice: deal.price,
        quantity: 1,
        dealItems: deal.items?.map((i) => ({
          productId: i.product?._id || i.product,
          productName: i.product?.name || i.productName || "",
          quantity: i.quantity,
        })) || [],
      },
    });
  }, []);

  const updateQuantity = useCallback((lineKey, quantity) => dispatch({ type: "UPDATE_QUANTITY", lineKey, quantity }), []);
  const removeItem = useCallback((lineKey) => dispatch({ type: "REMOVE_ITEM", lineKey }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items]
  );
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, addItem, addDeal, updateQuantity, removeItem, clearCart, subtotal, itemCount }),
    [items, addItem, addDeal, updateQuantity, removeItem, clearCart, subtotal, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
