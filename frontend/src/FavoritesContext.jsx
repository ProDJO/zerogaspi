import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./useAuth.jsx";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();

  // Key is scoped to the user — "guest" when not logged in
  const storageKey = `zerogaspi_favorites_${user?.id ?? "guest"}`;

  const [favorites, setFavorites] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey)) || [];
      // Discard old format (plain IDs instead of objects)
      if (data.length > 0 && typeof data[0] !== "object") return [];
      return data;
    } catch { return []; }
  });

  const [favOpen, setFavOpen] = useState(false);
  const openFavorites  = () => setFavOpen(true);
  const closeFavorites = () => setFavOpen(false);

  // When user changes (login / logout / switch account) → load their favorites
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey)) || [];
      if (data.length > 0 && typeof data[0] !== "object") {
        setFavorites([]);
      } else {
        setFavorites(data);
      }
    } catch { setFavorites([]); }
    setFavOpen(false);
  }, [storageKey]);

  // Persist favorites to the user-scoped key whenever favorites change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  }, [favorites, storageKey]);

  const toggleFavorite = (product) =>
    setFavorites((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );

  const removeFavorite = (id) => setFavorites((prev) => prev.filter((p) => p.id !== id));
  const clearFavorites = () => setFavorites([]);
  const isFavorite     = (id) => favorites.some((p) => p.id === id);
  const favoriteIds    = favorites.map((p) => p.id);

  return (
    <FavoritesContext.Provider value={{
      favorites, favoriteIds, toggleFavorite, removeFavorite, clearFavorites,
      isFavorite, favOpen, openFavorites, closeFavorites,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
