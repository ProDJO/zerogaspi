import { useState } from "react";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./useAuth.jsx";
import { colors, font, radius, shadow, makeBtn } from "./theme.js";

export default function CartSidebar() {
  const { items, removeItem, updateQty, clearCart, cartTotal, cartCount, cartOpen, closeCart } = useCart();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleCheckout = async () => {
    if (!token || items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Overlay ── */}
      <div
        onClick={closeCart}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          opacity: cartOpen ? 1 : 0,
          pointerEvents: cartOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* ── Sidebar panel ── */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0,
        width: 420, maxWidth: "95vw",
        background: colors.white,
        boxShadow: "-6px 0 32px rgba(0,0,0,0.15)",
        zIndex: 1001,
        transform: cartOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        fontFamily: font.family,
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px",
          borderBottom: `1px solid ${colors.gray100}`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🛒</span>
            <span style={{ fontWeight: font.weight.extrabold, fontSize: font.size.xl, color: colors.gray900 }}>
              Mon panier
            </span>
            {cartCount > 0 && (
              <span style={{
                background: colors.primary, color: colors.white,
                fontSize: font.size.xs, fontWeight: font.weight.bold,
                borderRadius: radius.full, padding: "2px 8px",
              }}>
                {cartCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            style={{
              background: colors.gray100, border: "none", cursor: "pointer",
              width: 34, height: 34, borderRadius: radius.full,
              fontSize: 18, color: colors.gray500,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = colors.gray200}
            onMouseLeave={(e) => e.currentTarget.style.background = colors.gray100}
          >
            ✕
          </button>
        </div>

        {/* Items list — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: colors.gray400 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
              <p style={{ fontSize: font.size.md, fontWeight: font.weight.medium, marginBottom: 4, color: colors.gray600 }}>
                Votre panier est vide
              </p>
              <p style={{ fontSize: font.size.sm }}>
                Ajoutez des produits depuis le catalogue.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  onQtyChange={(qty) => updateQty(item.id, qty)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: "16px 20px",
            borderTop: `1px solid ${colors.gray100}`,
            background: colors.gray50,
            flexShrink: 0,
          }}>
            {error && (
              <div style={{
                marginBottom: 12, padding: "10px 14px",
                background: colors.dangerLight, color: colors.dangerDark,
                borderRadius: radius.md, fontSize: font.size.sm,
                borderLeft: `3px solid ${colors.danger}`,
              }}>
                {error}
              </div>
            )}

            {/* Total */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 14,
            }}>
              <span style={{ fontSize: font.size.base, color: colors.gray600, fontWeight: font.weight.medium }}>
                Total
              </span>
              <span style={{ fontSize: font.size["2xl"], fontWeight: font.weight.extrabold, color: colors.primary }}>
                {cartTotal.toFixed(2)}{" "}
                <span style={{ fontSize: font.size.base, color: colors.gray500, fontWeight: font.weight.normal }}>DT</span>
              </span>
            </div>

            {/* Checkout button */}
            {!token ? (
              <p style={{ textAlign: "center", fontSize: font.size.sm, color: colors.gray500 }}>
                Connectez-vous pour payer
              </p>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  ...makeBtn("primary", "lg"),
                  width: "100%",
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                  justifyContent: "center",
                }}
              >
                {loading ? "Redirection…" : "Payer avec Flouci"}
              </button>
            )}

            <button
              onClick={clearCart}
              style={{
                ...makeBtn("ghost", "sm"),
                width: "100%", marginTop: 8,
                justifyContent: "center",
                color: colors.gray400, fontSize: font.size.xs,
              }}
            >
              Vider le panier
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function SidebarItem({ item, onQtyChange, onRemove }) {
  const subtotal = (item.qty * Number(item.price)).toFixed(2);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px",
      background: colors.white,
      borderRadius: radius.lg,
      border: `1px solid ${colors.gray100}`,
      boxShadow: shadow.xs,
    }}>
      {/* Thumbnail */}
      <div style={{
        width: 58, height: 58, flexShrink: 0,
        borderRadius: radius.md, overflow: "hidden",
        background: colors.gray100,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22,
      }}>
        {item.image
          ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : "🥗"}
      </div>

      {/* Info + qty */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: font.weight.semibold, fontSize: font.size.base, color: colors.gray900,
          margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {item.name}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Qty controls */}
          <button onClick={() => onQtyChange(item.qty - 1)} style={qtyBtn}>−</button>
          <span style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, minWidth: 18, textAlign: "center" }}>
            {item.qty}
          </span>
          <button
            onClick={() => onQtyChange(item.qty + 1)}
            disabled={item.qty >= item.stock}
            style={{ ...qtyBtn, opacity: item.qty >= item.stock ? 0.4 : 1, cursor: item.qty >= item.stock ? "not-allowed" : "pointer" }}
          >
            +
          </button>

          <span style={{ fontSize: font.size.sm, color: colors.gray400, marginLeft: 4 }}>
            × {Number(item.price).toFixed(2)} DT
          </span>
        </div>
      </div>

      {/* Subtotal + remove */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <span style={{ fontWeight: font.weight.bold, fontSize: font.size.md, color: colors.primary }}>
          {subtotal} DT
        </span>
        <button
          onClick={onRemove}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: colors.gray300, fontSize: 15, padding: 2,
            transition: "color .15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.danger}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.gray300}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const qtyBtn = {
  width: 26, height: 26,
  borderRadius: radius.md,
  border: `1.5px solid ${colors.gray200}`,
  background: colors.white,
  cursor: "pointer", fontSize: 14, fontWeight: "bold",
  color: colors.gray700,
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 0, lineHeight: 1,
};
