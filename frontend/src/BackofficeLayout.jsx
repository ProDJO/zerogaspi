import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import { colors, shadow, radius, font, roleColor } from "./theme.js";

const NAV_ITEMS = [
  { id: "dashboard",  icon: "📊", label: "Tableau de bord" },
  { id: "products",   icon: "📦", label: "Produits" },
  { id: "roles",      icon: "👥", label: "Demandes de rôle" },
  { id: "deliveries", icon: "🚚", label: "Livraisons" },
  { id: "users",      icon: "🧑", label: "Utilisateurs" },
  { id: "categories", icon: "🏷️", label: "Catégories" },
  { id: "coupons",    icon: "🎟️", label: "Codes promo" },
  { id: "export",     icon: "📤", label: "Export CSV" },
];

export default function BackofficeLayout() {
  const { user, avatar, token, logout } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [badges, setBadges] = useState({ roles: 0, products: 0 });

  useEffect(() => {
    const h = { "Authorization": `Bearer ${token}` };
    Promise.all([
      fetch("http://localhost:5000/users/role-requests", { headers: h }).then((r) => r.ok ? r.json() : []),
      fetch("http://localhost:5000/products/pending",    { headers: h }).then((r) => r.ok ? r.json() : []),
    ]).then(([roles, products]) => setBadges({ roles: roles.length, products: products.length }))
      .catch(() => {});
  }, [active]);

  const initial = (user?.name?.[0] || user?.role?.[0] || "A").toUpperCase();
  const badgeOf = { roles: badges.roles, products: badges.products };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: font.family, background: colors.bo900 }}>

      {/* ══════════ SIDEBAR ══════════ */}
      <aside style={{
        width: 256, background: colors.bo900,
        borderRight: `1px solid ${colors.bo700}`,
        display: "flex", flexDirection: "column",
        position: "fixed", inset: "0 auto 0 0",
        zIndex: 200,
      }}>

        {/* Brand */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${colors.bo700}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 34, height: 34, borderRadius: radius.md,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryMid} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, boxShadow: `0 2px 8px rgba(22,163,74,.5)`,
            }}>🌿</div>
            <div>
              <div style={{ fontWeight: font.weight.extrabold, fontSize: font.size.lg, color: colors.boText, letterSpacing: -0.5 }}>
                ZeroGaspi
              </div>
            </div>
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: `${colors.boAccent}22`, color: colors.boAccentL,
            padding: "3px 10px", borderRadius: radius.full,
            fontSize: font.size.xs, fontWeight: font.weight.semibold, letterSpacing: "0.04em",
          }}>
            ⚡ Admin Panel
          </div>
        </div>

        {/* Section label */}
        <div style={{ padding: "16px 20px 8px" }}>
          <span style={{ fontSize: font.size.xs, fontWeight: font.weight.semibold, color: colors.bo600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Navigation
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: "0 10px" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            const badge    = badgeOf[item.id];
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`bo-nav-item${isActive ? " active" : ""}`}
                style={{ borderRadius: radius.md, marginBottom: 2 }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 17, lineHeight: 1 }}>{item.icon}</span>
                  <span style={{ fontSize: font.size.base }}>{item.label}</span>
                </span>
                {badge > 0 && (
                  <span style={{
                    background: colors.danger, color: colors.white,
                    fontSize: 11, fontWeight: font.weight.bold,
                    borderRadius: radius.full, padding: "2px 7px", minWidth: 20, textAlign: "center",
                    boxShadow: "0 1px 4px rgba(239,68,68,.4)",
                  }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${colors.bo700}` }}>

          {/* User card */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: radius.lg,
            background: colors.bo800, marginBottom: 8,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: radius.full, overflow: "hidden",
              background: avatar ? "transparent" : colors.danger,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, color: colors.white, fontWeight: font.weight.bold, fontSize: 15,
              border: `2px solid ${colors.bo700}`,
            }}>
              {avatar
                ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : initial}
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.boText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name || "Administrateur"}
              </div>
              <div style={{ fontSize: 11, color: colors.boMuted }}>Admin</div>
            </div>
          </div>

          {/* Actions */}
          <Link to="/" style={{
            display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
            color: colors.boMuted, textDecoration: "none",
            fontSize: font.size.sm, borderRadius: radius.md,
            transition: "background .15s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = colors.bo800}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <span>←</span> Retour au site
          </Link>

          <button onClick={() => { logout(); navigate("/"); }} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
            background: "none", border: "none", cursor: "pointer",
            color: "#f87171", fontSize: font.size.sm, width: "100%",
            borderRadius: radius.md, textAlign: "left", fontFamily: font.family,
            transition: "background .15s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = `${colors.danger}15`}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* ══════════ MAIN AREA ══════════ */}
      <div style={{ marginLeft: 256, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <header style={{
          background: colors.bo800, borderBottom: `1px solid ${colors.bo700}`,
          padding: "0 28px", height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Breadcrumb */}
            <span style={{ color: colors.boMuted, fontSize: font.size.sm }}>Admin</span>
            <span style={{ color: colors.bo700 }}>/</span>
            <span style={{ color: colors.boText, fontSize: font.size.sm, fontWeight: font.weight.semibold }}>
              {NAV_ITEMS.find((n) => n.id === active)?.icon}{" "}
              {NAV_ITEMS.find((n) => n.id === active)?.label}
            </span>
          </div>

          {/* Right: clock-like info */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {badges.roles > 0 && (
              <button onClick={() => setActive("roles")} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: `${colors.danger}22`, color: "#f87171",
                border: `1px solid ${colors.danger}44`,
                borderRadius: radius.full, padding: "4px 12px",
                fontSize: font.size.xs, fontWeight: font.weight.semibold, cursor: "pointer",
                fontFamily: font.family,
              }}>
                🔔 {badges.roles} demande{badges.roles > 1 ? "s" : ""} en attente
              </button>
            )}
            <div style={{
              width: 32, height: 32, borderRadius: radius.full, overflow: "hidden",
              background: avatar ? "transparent" : colors.danger,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: colors.white, fontWeight: font.weight.bold, fontSize: 14,
              border: `2px solid ${colors.bo700}`,
            }}>
              {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initial}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 24, background: colors.bo900 }}>
          {/* Wrapper blanc — le AdminDashboard utilise des couleurs claires */}
          <div style={{
            background: colors.white,
            borderRadius: radius.xl,
            padding: "24px 28px",
            minHeight: "calc(100vh - 108px)",
            boxShadow: `0 1px 3px rgba(0,0,0,.2)`,
          }}>
            <AdminDashboard activeSection={active} />
          </div>
        </main>
      </div>
    </div>
  );
}
