import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./useAuth.jsx";

const NotificationsContext = createContext(null);

const POLL_INTERVAL = 30_000; // 30 seconds

const STATUS_MSG = {
  awaiting_vendeur: (n) => `📦 Livraison de "${n}" en attente du vendeur`,
  pending:          (n) => `✅ Livraison de "${n}" approuvée — un livreur va être assigné`,
  accepted:         (n) => `🚚 Un livreur a accepté votre livraison de "${n}"`,
  in_progress:      (n) => `🚗 Votre livraison de "${n}" est en route !`,
  delivered:        (n) => `🎉 Votre livraison de "${n}" a été livrée !`,
  rejected:         (n) => `❌ Votre livraison de "${n}" a été refusée`,
};

export function NotificationsProvider({ children }) {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const prevStatuses = useRef({});
  const isFirstPoll  = useRef(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const markRead    = (id) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const clear       = () => setNotifications([]);

  useEffect(() => {
    if (!token || user?.role === "admin") return;

    // Reset on login/user change
    prevStatuses.current = {};
    isFirstPoll.current  = true;

    const poll = async () => {
      try {
        const res = await fetch("http://localhost:5000/deliveries/client", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const deliveries = await res.json();
        if (!Array.isArray(deliveries)) return;

        // First poll = establish baseline, never generate notifications
        if (isFirstPoll.current) {
          deliveries.forEach((d) => { prevStatuses.current[d.id] = d.status; });
          isFirstPoll.current = false;
          return;
        }

        const newNotifs = [];
        deliveries.forEach((d) => {
          const prev = prevStatuses.current[d.id];
          if (prev !== undefined && prev !== d.status) {
            const msg = STATUS_MSG[d.status]?.(d.product_name) ?? `Livraison #${d.id} mise à jour`;
            newNotifs.push({
              id:        `${d.id}-${d.status}-${Date.now()}`,
              message:   msg,
              read:      false,
              timestamp: new Date(),
            });
          }
          prevStatuses.current[d.id] = d.status;
        });

        if (newNotifs.length > 0) {
          setNotifications((prev) => [...newNotifs, ...prev].slice(0, 30));
        }
      } catch { /* network error — silently skip */ }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [token, user?.role]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, clear }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
