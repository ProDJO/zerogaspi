import { useRef, useEffect, useState } from "react";
import { Routes, Route, Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth.jsx";
import { useTheme } from "./ThemeContext.jsx";
import { useLanguage } from "./LanguageContext.jsx";
import { useCart } from "./CartContext.jsx";
import { useFavorites } from "./FavoritesContext.jsx";
import { useNotifications } from "./NotificationsContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { colors, shadow, radius, font, makeBtn, roleColor } from "./theme.js";

import HomePage           from "./pages/HomePage";
import LoginPage          from "./pages/LoginPage";
import RegisterPage       from "./pages/RegisterPage";
import MesReservationsPage from "./pages/MesReservationsPage";
import AdminPage          from "./pages/AdminPage";
import VendeurPage        from "./pages/VendeurPage";
import LivreurPage        from "./pages/LivreurPage";
import ProfilPage         from "./pages/ProfilPage";
import ParametresPage     from "./pages/ParametresPage";
import PanierPage          from "./pages/PanierPage";
import CartSidebar         from "./CartSidebar.jsx";
import FavoritesSidebar    from "./FavoritesSidebar.jsx";
import PaymentSuccessPage  from "./pages/PaymentSuccessPage";
import PaymentCancelPage   from "./pages/PaymentCancelPage";

// ── Avatar dropdown ──────────────────────────
function UserDropdown({ user, avatar, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const color   = roleColor[user?.role] || colors.gray400;
  const initial = (user?.role?.[0] || "?").toUpperCase();
  const go      = (path) => { setOpen(false); navigate(path); };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 38, height: 38, borderRadius: radius.full,
          overflow: "hidden", border: `2.5px solid ${color}`,
          background: avatar ? "transparent" : color,
          cursor: "pointer", padding: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: colors.white, fontWeight: font.weight.bold, fontSize: 15,
          boxShadow: `0 0 0 3px ${color}22`,
          transition: "box-shadow .2s",
        }}
      >
        {avatar
          ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initial}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "absolute", right: 0, top: 48,
          background: colors.white, borderRadius: radius.xl,
          boxShadow: shadow.xl, border: `1px solid ${colors.gray100}`,
          minWidth: 220, zIndex: 200, overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "18px 16px 14px", textAlign: "center",
            background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.white} 100%)`,
            borderBottom: `1px solid ${colors.gray100}`,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: radius.full, overflow: "hidden",
              background: avatar ? "transparent" : color,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 10px",
              border: `3px solid ${color}`,
              fontSize: 22, fontWeight: font.weight.bold, color: colors.white,
            }}>
              {avatar
                ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initial}
            </div>
            {user?.name && (
              <p style={{ fontWeight: font.weight.bold, fontSize: font.size.md, color: colors.gray900, marginBottom: 3 }}>
                {user.name}
              </p>
            )}
            <span style={{
              display: "inline-block", padding: "2px 10px", borderRadius: radius.full,
              background: color + "22", color, fontSize: font.size.xs, fontWeight: font.weight.semibold,
              textTransform: "capitalize",
            }}>
              {user?.role}
            </span>
          </div>

          {/* Menu items */}
          <div style={{ padding: "6px 0" }}>
            {[
              { icon: "👤", label: "Mon Profil",      path: "/profil" },
              { icon: "⚙️", label: "Paramètres",      path: "/parametres" },
              ...(user?.role === "vendeur" ? [{ icon: "🏪", label: "Espace Vendeur", path: "/vendeur" }] : []),
              ...(user?.role === "livreur" ? [{ icon: "🚚", label: "Espace Livreur", path: "/livreur" }] : []),
            ].map((item) => (
              <button key={item.path} onClick={() => go(item.path)} style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%", padding: "10px 16px",
                background: "none", border: "none", cursor: "pointer",
                fontSize: font.size.base, color: colors.gray700, textAlign: "left",
                transition: "background .15s",
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.gray50}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span> {item.label}
              </button>
            ))}
            <div style={{ height: 1, background: colors.gray100, margin: "4px 0" }} />
            <button onClick={() => { setOpen(false); logout(); }} style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "10px 16px",
              background: "none", border: "none", cursor: "pointer",
              fontSize: font.size.base, color: colors.danger, fontWeight: font.weight.semibold, textAlign: "left",
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.dangerLight}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              🚪 Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── App ──────────────────────────────────────
function App() {
  const { token, user, avatar, logout } = useAuth();
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const { cartCount, openCart } = useCart();
  const { favoriteIds, openFavorites } = useFavorites();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const location = useLocation();
  const isBackoffice = location.pathname.startsWith("/admin");

  // Le backoffice a son propre layout complet
  if (isBackoffice) {
    return (
      <Routes>
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>
        } />
      </Routes>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: darkMode ? colors.bo900 : colors.gray50 }}>
      <CartSidebar />
      <FavoritesSidebar />

      {/* ══════════ NAVBAR FRONTOFFICE ══════════ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: darkMode ? colors.bo800 : colors.white,
        borderBottom: `1px solid ${darkMode ? colors.bo700 : colors.gray200}`,
        boxShadow: shadow.nav,
        padding: "0 32px", height: 64,
        display: "flex", alignItems: "center", gap: 8,
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", marginRight: 24, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: radius.md,
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryMid} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, boxShadow: `0 2px 6px rgba(22,163,74,.4)`,
          }}>
            🌿
          </div>
          <span style={{ fontWeight: font.weight.extrabold, fontSize: font.size.xl, color: colors.primary, letterSpacing: -0.5 }}>
            ZeroGaspi
          </span>
        </Link>

        {/* Nav links — le logo remplace déjà le lien "Accueil" */}
        <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          {!token && <>
            <NavLink to="/login"    className={({ isActive }) => `fo-nav-link${isActive ? " active" : ""}`}>{t("nav_login")}</NavLink>
            <NavLink to="/register" className={({ isActive }) => `fo-nav-link${isActive ? " active" : ""}`}>{t("nav_register")}</NavLink>
          </>}

          {token && <>
            {user?.role !== "admin" && (
              <NavLink to="/mes-reservations" className={({ isActive }) => `fo-nav-link${isActive ? " active" : ""}`}>
                {t("nav_reservations")}
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink to="/admin" className="fo-nav-link" style={{
                background: `${colors.danger}11`, color: colors.danger,
              }}>
                {t("nav_admin")}
              </NavLink>
            )}
          </>}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Bell icon */}
          {token && user?.role !== "admin" && (
            <div ref={notifRef} style={{ position: "relative" }}>
              <button
                onClick={() => { setNotifOpen((v) => !v); if (!notifOpen) markAllRead(); }}
                style={{
                  position: "relative", background: "none", border: "none",
                  cursor: "pointer", fontSize: 22, padding: "4px 6px",
                  borderRadius: radius.md, color: colors.gray700,
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.gray100}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: "absolute", top: 0, right: 0,
                    background: colors.danger, color: colors.white,
                    fontSize: 10, fontWeight: font.weight.bold,
                    borderRadius: radius.full, minWidth: 17, height: 17,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "0 3px", lineHeight: 1,
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div style={{
                  position: "absolute", right: 0, top: 48,
                  width: 320, background: colors.white,
                  borderRadius: radius.xl, boxShadow: shadow.xl,
                  border: `1px solid ${colors.gray100}`,
                  zIndex: 300, overflow: "hidden",
                }}>
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.gray100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: font.weight.bold, fontSize: font.size.base, color: colors.gray900 }}>Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", fontSize: font.size.xs, color: colors.primary, fontFamily: font.family }}>
                        Tout marquer lu
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: "32px 16px", textAlign: "center", color: colors.gray400 }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                        <p style={{ fontSize: font.size.sm, margin: 0 }}>Aucune notification</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          style={{
                            padding: "12px 16px",
                            background: n.read ? colors.white : colors.primaryLight,
                            borderBottom: `1px solid ${colors.gray100}`,
                            cursor: "pointer",
                            transition: "background .15s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = colors.gray50}
                          onMouseLeave={(e) => e.currentTarget.style.background = n.read ? colors.white : colors.primaryLight}
                        >
                          <p style={{ margin: "0 0 3px", fontSize: font.size.sm, color: colors.gray800, lineHeight: 1.4 }}>{n.message}</p>
                          <p style={{ margin: 0, fontSize: 11, color: colors.gray400 }}>
                            {new Date(n.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Favorites icon */}
          {token && user?.role !== "admin" && (
            <button
              onClick={openFavorites}
              style={{
                position: "relative", background: "none", border: "none",
                cursor: "pointer", fontSize: 22, padding: "4px 6px",
                borderRadius: radius.md, color: colors.gray700,
                transition: "background .15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.gray100}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              title="Mes favoris"
            >
              🤍
              {favoriteIds.length > 0 && (
                <span style={{
                  position: "absolute", top: 0, right: 0,
                  background: colors.danger, color: colors.white,
                  fontSize: 10, fontWeight: font.weight.bold,
                  borderRadius: radius.full, minWidth: 17, height: 17,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 3px", lineHeight: 1,
                }}>
                  {favoriteIds.length}
                </span>
              )}
            </button>
          )}

          {/* Cart icon — visible si connecté et pas admin */}
          {token && user?.role !== "admin" && (
            <button
              onClick={openCart}
              style={{
                position: "relative", background: "none", border: "none",
                cursor: "pointer", fontSize: 22, padding: "4px 6px",
                borderRadius: radius.md, color: colors.gray700,
                transition: "background .15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.gray100}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              title="Mon panier"
            >
              🛒
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: 0, right: 0,
                  background: colors.danger, color: colors.white,
                  fontSize: 10, fontWeight: font.weight.bold,
                  borderRadius: radius.full, minWidth: 17, height: 17,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 3px", lineHeight: 1,
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {token
            ? <UserDropdown user={user} avatar={avatar} logout={logout} />
            : <Link to="/login" style={makeBtn("primary", "sm")}>Se connecter →</Link>
          }
        </div>
      </nav>

      {/* ══════════ PAGES ══════════ */}
      <main>
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/mes-reservations" element={<ProtectedRoute><MesReservationsPage /></ProtectedRoute>} />
          <Route path="/panier"           element={<ProtectedRoute><PanierPage /></ProtectedRoute>} />
          <Route path="/payment/success"  element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
          <Route path="/payment/cancel"   element={<ProtectedRoute><PaymentCancelPage /></ProtectedRoute>} />
          <Route path="/profil"       element={<ProtectedRoute><ProfilPage /></ProtectedRoute>} />
          <Route path="/parametres"   element={<ProtectedRoute><ParametresPage /></ProtectedRoute>} />
          <Route path="/vendeur"      element={<ProtectedRoute requiredRole={["vendeur","admin"]}><VendeurPage /></ProtectedRoute>} />
          <Route path="/livreur"      element={<ProtectedRoute requiredRole={["livreur","admin"]}><LivreurPage /></ProtectedRoute>} />
          <Route path="*"             element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  const sections = [
    {
      title: "Plateforme",
      links: [
        { label: "Accueil",           path: "/" },
        { label: "Mes Réservations",  path: "/mes-reservations" },
        { label: "Mon Profil",        path: "/profil" },
        { label: "Paramètres",        path: "/parametres" },
      ],
    },
    {
      title: "Rôles",
      links: [
        { label: "Devenir Vendeur",   path: "/profil#role-request" },
        { label: "Devenir Livreur",   path: "/profil#role-request" },
        { label: "Espace Vendeur",    path: "/vendeur" },
        { label: "Espace Livreur",    path: "/livreur" },
      ],
    },
    {
      title: "À propos",
      links: [
        { label: "Notre mission",     path: "/" },
        { label: "Anti-gaspillage",   path: "/" },
        { label: "Contact",           path: "/" },
        { label: "Mentions légales",  path: "/" },
      ],
    },
  ];

  return (
    <footer style={{
      background: colors.gray900,
      color: colors.gray400,
      paddingTop: 56,
      marginTop: 80,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px" }}>

        {/* Top row */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, paddingBottom: 48, borderBottom: `1px solid ${colors.gray800}` }}>

          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: radius.md,
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryMid} 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>🌿</div>
              <span style={{ fontWeight: font.weight.extrabold, fontSize: font.size.xl, color: colors.white, letterSpacing: -0.5 }}>
                ZeroGaspi
              </span>
            </div>
            <p style={{ fontSize: font.size.sm, lineHeight: 1.75, color: colors.gray500, marginBottom: 20, maxWidth: 280 }}>
              Plateforme anti-gaspillage alimentaire. Réservez des produits frais à prix réduit et contribuez à un avenir plus durable.
            </p>
            {/* Badges écolo */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["🌱 Éco-responsable", "🤝 Local", "♻️ Anti-gaspi"].map((badge) => (
                <span key={badge} style={{
                  padding: "4px 10px", borderRadius: radius.full,
                  background: `${colors.primary}22`, color: colors.primaryMid,
                  fontSize: font.size.xs, fontWeight: font.weight.semibold,
                  border: `1px solid ${colors.primary}44`,
                }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {sections.map((section) => (
            <div key={section.title}>
              <h4 style={{
                fontSize: font.size.xs, fontWeight: font.weight.semibold,
                color: colors.gray300, textTransform: "uppercase",
                letterSpacing: "0.1em", marginBottom: 16,
              }}>
                {section.title}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      style={{ color: colors.gray500, fontSize: font.size.sm, textDecoration: "none", transition: "color .15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = colors.primaryMid}
                      onMouseLeave={(e) => e.currentTarget.style.color = colors.gray500}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 0", fontSize: font.size.xs, color: colors.gray600,
        }}>
          <span>© {year} ZeroGaspi. Tous droits réservés.</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>Fait avec</span>
            <span style={{ color: colors.danger }}>♥</span>
            <span>pour la planète</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🍃</div>
      <h1 style={{ fontSize: 32, color: colors.gray800, marginBottom: 8 }}>404</h1>
      <p style={{ color: colors.gray500, marginBottom: 24 }}>Cette page n'existe pas.</p>
      <Link to="/" style={makeBtn("primary", "md")}>← Retour à l'accueil</Link>
    </div>
  );
}

export default App;
