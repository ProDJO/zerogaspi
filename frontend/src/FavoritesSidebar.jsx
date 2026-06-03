import { useFavorites } from "./FavoritesContext.jsx";
import { useCart } from "./CartContext.jsx";
import { colors, font, radius, shadow, makeBtn } from "./theme.js";

export default function FavoritesSidebar() {
  const { favorites, removeFavorite, clearFavorites, favOpen, closeFavorites } = useFavorites();
  const { addItem, items, openCart } = useCart();

  const cartIds = new Set(items.map((i) => i.id));

  const handleAddToCart = (product) => {
    addItem(product);
    closeFavorites();
    openCart();
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeFavorites}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          opacity: favOpen ? 1 : 0,
          pointerEvents: favOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Sidebar panel */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0,
        width: 400, maxWidth: "95vw",
        background: colors.white,
        boxShadow: "-6px 0 32px rgba(0,0,0,0.15)",
        zIndex: 1001,
        transform: favOpen ? "translateX(0)" : "translateX(100%)",
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
            <span style={{ fontSize: 22 }}>❤️</span>
            <span style={{ fontWeight: font.weight.extrabold, fontSize: font.size.xl, color: colors.gray900 }}>
              Mes favoris
            </span>
            {favorites.length > 0 && (
              <span style={{
                background: colors.danger, color: colors.white,
                fontSize: font.size.xs, fontWeight: font.weight.bold,
                borderRadius: radius.full, padding: "2px 8px",
              }}>
                {favorites.length}
              </span>
            )}
          </div>
          <button
            onClick={closeFavorites}
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

        {/* Items list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
          {favorites.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: colors.gray400 }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🤍</div>
              <p style={{ fontSize: font.size.md, fontWeight: font.weight.medium, color: colors.gray600, marginBottom: 6 }}>
                Aucun favori pour le moment
              </p>
              <p style={{ fontSize: font.size.sm, marginBottom: 24 }}>
                Cliquez sur ❤️ sur un produit pour le sauvegarder ici.
              </p>
              <button onClick={closeFavorites} style={makeBtn("primary", "sm")}>
                Voir le catalogue
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {favorites.filter((p) => p && p.id).map((product) => (
                <FavoriteItem
                  key={product.id}
                  product={product}
                  inCart={cartIds.has(product.id)}
                  onAddToCart={() => handleAddToCart(product)}
                  onViewCart={() => { closeFavorites(); openCart(); }}
                  onRemove={() => removeFavorite(product.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {favorites.length > 0 && (
          <div style={{
            padding: "14px 20px",
            borderTop: `1px solid ${colors.gray100}`,
            background: colors.gray50,
            flexShrink: 0,
          }}>
            <button
              onClick={clearFavorites}
              style={{
                ...makeBtn("ghost", "sm"),
                width: "100%", justifyContent: "center",
                color: colors.gray400, fontSize: font.size.xs,
              }}
            >
              Vider les favoris
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function FavoriteItem({ product: p, inCart, onAddToCart, onViewCart, onRemove }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px",
      background: colors.white, borderRadius: radius.lg,
      border: `1px solid ${colors.gray100}`,
      boxShadow: shadow.xs,
    }}>
      {/* Thumbnail */}
      <div style={{
        width: 60, height: 60, flexShrink: 0,
        borderRadius: radius.md, overflow: "hidden",
        background: colors.gray100,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24,
      }}>
        {p.image
          ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : "🥗"}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: font.weight.semibold, fontSize: font.size.base, color: colors.gray900,
          margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {p.name}
        </p>
        <p style={{ fontSize: font.size.sm, color: colors.gray500, margin: 0 }}>
          {Number(p.price).toFixed(2)} DT
        </p>

        {/* Cart action */}
        {inCart ? (
          <button onClick={onViewCart} style={{
            ...makeBtn("outline", "sm"),
            marginTop: 6, fontSize: 11, padding: "3px 10px",
          }}>
            Voir le panier
          </button>
        ) : (
          <button onClick={onAddToCart} style={{
            ...makeBtn("primary", "sm"),
            marginTop: 6, fontSize: 11, padding: "3px 10px",
          }}>
            + Panier
          </button>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 18, flexShrink: 0,
          transition: "transform .15s",
        }}
        title="Retirer des favoris"
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        ❤️
      </button>
    </div>
  );
}
