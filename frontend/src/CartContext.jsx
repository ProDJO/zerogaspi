import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./useAuth.jsx";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();

  // Key is scoped to the user — "guest" when not logged in
  const storageKey = `zerogaspi_cart_${user?.id ?? "guest"}`;

  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
    catch { return []; }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const openCart  = () => setCartOpen(true);
  const closeCart = () => setCartOpen(false);

  // When user changes (login / logout / switch account) → load their cart
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(storageKey)) || []); }
    catch { setItems([]); }
    setCartOpen(false);
  }, [storageKey]);

  // Persist cart to the user-scoped key whenever items change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, qty: Math.min(i.qty + 1, product.quantity) }
            : i
        );
      }
      return [...prev, {
        id:    product.id,
        name:  product.name,
        price: product.price,
        image: product.image,
        stock: product.quantity,
        qty:   1,
      }];
    });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) => i.id === id ? { ...i, qty: Math.min(qty, i.stock) } : i)
    );
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.qty * Number(i.price), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, cartCount, cartTotal, cartOpen, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
