import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth.jsx";
import { useCart } from "../CartContext.jsx";
import { colors, font, radius, shadow, makeBtn } from "../theme.js";

export default function PanierPage() {
  const { token } = useAuth();
  const { items, removeItem, updateQty, clearCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [couponInput,  setCouponInput]  = useState("");
  const [coupon,       setCoupon]       = useState(null);   // { code, discount_pct }
  const [couponError,  setCouponError]  = useState("");
  const [couponLoading,setCouponLoading]= useState(false);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true); setCouponError(""); setCoupon(null);
    try {
      const res = await fetch("http://localhost:5000/admin/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) { setCouponError(await res.text()); return; }
      setCoupon(await res.json());
    } catch {
      setCouponError("Erreur réseau");
    } finally {
      setCouponLoading(false);
    }
  };

  const discountedTotal = coupon
    ? cartTotal * (1 - coupon.discount_pct / 100)
    : cartTotal;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
          coupon_code: coupon?.code || null,
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

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 640, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
        <h2 style={{ color: colors.gray800, marginBottom: 8 }}>Votre panier est vide</h2>
        <p style={{ color: colors.gray500, marginBottom: 28 }}>
          Ajoutez des produits depuis le catalogue pour continuer.
        </p>
        <button onClick={() => navigate("/")} style={makeBtn("primary", "md")}>
          Voir les produits
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: font.size["3xl"], fontWeight: font.weight.extrabold, color: colors.gray900, marginBottom: 8 }}>
        Mon panier
      </h1>
      <p style={{ color: colors.gray500, marginBottom: 28, fontSize: font.size.base }}>
        {items.length} article{items.length > 1 ? "s" : ""} — confirmez pour créer vos réservations.
      </p>

      {/* Feedback */}
      {error && (
        <div style={{ padding: "12px 16px", borderRadius: radius.md, background: colors.dangerLight,
          color: colors.dangerDark, borderLeft: `4px solid ${colors.danger}`, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onQtyChange={(qty) => updateQty(item.id, qty)}
            onRemove={() => removeItem(item.id)}
          />
        ))}
      </div>

      {/* Summary */}
      <div style={{
        background: colors.white, borderRadius: radius.xl,
        boxShadow: shadow.card, border: `1px solid ${colors.gray200}`,
        padding: "20px 24px",
      }}>
        {/* Coupon field */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.gray700, marginBottom: 8 }}>
            Code promo
          </p>
          {coupon ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ flex: 1, padding: "9px 12px", borderRadius: radius.md, background: colors.primaryLight,
                color: colors.primaryDark, fontWeight: 700, fontSize: 14, fontFamily: "monospace" }}>
                {coupon.code} — -{coupon.discount_pct}% appliqué
              </span>
              <button onClick={() => { setCoupon(null); setCouponInput(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: colors.gray400, fontSize: 16 }}>
                ✕
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                placeholder="Ex: ETE20"
                style={{ flex: 1, padding: "9px 12px", borderRadius: radius.md, border: `1.5px solid ${couponError ? colors.danger : colors.gray200}`,
                  fontSize: 14, fontFamily: "monospace" }}
              />
              <button onClick={handleApplyCoupon} disabled={couponLoading}
                style={{ ...makeBtn("ghost", "md"), whiteSpace: "nowrap", opacity: couponLoading ? 0.7 : 1 }}>
                {couponLoading ? "…" : "Appliquer"}
              </button>
            </div>
          )}
          {couponError && <p style={{ margin: "6px 0 0", fontSize: 12, color: colors.danger }}>{couponError}</p>}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: coupon ? 4 : 16 }}>
          <span style={{ fontSize: font.size.lg, fontWeight: font.weight.semibold, color: colors.gray700 }}>
            Total estimé
          </span>
          <span style={{ fontSize: font.size["3xl"], fontWeight: font.weight.extrabold,
            color: coupon ? colors.gray400 : colors.primary,
            textDecoration: coupon ? "line-through" : "none",
            fontSize: coupon ? font.size.xl : font.size["3xl"] }}>
            {cartTotal.toFixed(2)} <span style={{ fontSize: font.size.base, color: colors.gray500 }}>DT</span>
          </span>
        </div>
        {coupon && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.primaryDark }}>
              Après remise -{coupon.discount_pct}%
            </span>
            <span style={{ fontSize: font.size["3xl"], fontWeight: font.weight.extrabold, color: colors.primary }}>
              {discountedTotal.toFixed(2)} <span style={{ fontSize: font.size.base, color: colors.gray500 }}>DT</span>
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{
              ...makeBtn("primary", "lg"), flex: 1,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Redirection vers Stripe…" : "Payer maintenant"}
          </button>
          <button onClick={clearCart} style={{ ...makeBtn("ghost", "lg"), whiteSpace: "nowrap" }}>
            Vider le panier
          </button>
        </div>

        <p style={{ fontSize: font.size.xs, color: colors.gray400, marginTop: 12, textAlign: "center" }}>
          Paiement sécurisé par Stripe. Vous serez redirigé vers la page de paiement.
        </p>
      </div>
    </div>
  );
}

function CartItem({ item, onQtyChange, onRemove }) {
  const subtotal = (item.qty * Number(item.price)).toFixed(2);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      background: colors.white, borderRadius: radius.xl,
      boxShadow: shadow.card, border: `1px solid ${colors.gray200}`,
      padding: "14px 18px",
    }}>
      {/* Image */}
      <div style={{
        width: 72, height: 72, flexShrink: 0,
        borderRadius: radius.lg, overflow: "hidden",
        background: colors.gray100,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28,
      }}>
        {item.image
          ? <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : "🥗"}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: font.weight.semibold, fontSize: font.size.md, color: colors.gray900,
          margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {item.name}
        </p>
        <p style={{ color: colors.gray500, fontSize: font.size.sm, margin: "2px 0 0" }}>
          {Number(item.price).toFixed(2)} DT / unité
        </p>
      </div>

      {/* Qty controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button onClick={() => onQtyChange(item.qty - 1)} style={qtyBtn}>−</button>
        <span style={{ minWidth: 24, textAlign: "center", fontWeight: font.weight.semibold, fontSize: font.size.md }}>
          {item.qty}
        </span>
        <button onClick={() => onQtyChange(item.qty + 1)} disabled={item.qty >= item.stock} style={{
          ...qtyBtn, opacity: item.qty >= item.stock ? 0.4 : 1,
          cursor: item.qty >= item.stock ? "not-allowed" : "pointer",
        }}>+</button>
      </div>

      {/* Subtotal */}
      <div style={{ minWidth: 72, textAlign: "right", flexShrink: 0 }}>
        <p style={{ fontWeight: font.weight.bold, fontSize: font.size.lg, color: colors.primary, margin: 0 }}>
          {subtotal} DT
        </p>
      </div>

      {/* Remove */}
      <button onClick={onRemove} style={{
        background: "none", border: "none", cursor: "pointer",
        color: colors.gray400, fontSize: 18, padding: 4, flexShrink: 0,
        borderRadius: radius.md, transition: "color .15s",
      }}
        onMouseEnter={(e) => e.currentTarget.style.color = colors.danger}
        onMouseLeave={(e) => e.currentTarget.style.color = colors.gray400}
      >
        ✕
      </button>
    </div>
  );
}

const qtyBtn = {
  width: 30, height: 30, borderRadius: radius.md,
  border: `1.5px solid ${colors.gray300}`,
  background: colors.white, cursor: "pointer",
  fontSize: 16, fontWeight: "bold", color: colors.gray700,
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: 0, lineHeight: 1,
};
