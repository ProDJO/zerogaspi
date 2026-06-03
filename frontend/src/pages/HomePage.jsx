import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../useAuth.jsx";
import { useLanguage } from "../LanguageContext.jsx";
import { useCart } from "../CartContext.jsx";
import { useFavorites } from "../FavoritesContext.jsx";
import StarRating from "../StarRating.jsx";
import ProductModal from "../ProductModal.jsx";
import { colors, radius, font, shadow, makeBtn, makeBadge } from "../theme.js";

const SORT_OPTIONS = [
  { value: "default",    label: "Pertinence" },
  { value: "price_asc",  label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "rating",     label: "Mieux notés" },
  { value: "stock",      label: "Plus de stock" },
];

export default function HomePage() {
  const { token, user } = useAuth();
  const { t } = useLanguage();
  const { addItem, items, openCart } = useCart();
  const { favorites, toggleFavorite, isFavorite, openFavorites } = useFavorites();

  const [products,         setProducts]         = useState([]);
  const [categories,       setCategories]       = useState([]);
  const [added,            setAdded]            = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [selectedProduct,  setSelectedProduct]  = useState(null);

  // ── Filter state ──
  const [search,     setSearch]     = useState("");
  const [minPrice,   setMinPrice]   = useState("");
  const [maxPrice,   setMaxPrice]   = useState("");
  const [sortBy,     setSortBy]     = useState("default");
  const [stockOnly,  setStockOnly]  = useState(false);
  const [showFilters,setShowFilters]= useState(false);
  const [category,   setCategory]   = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/products");
      setProducts(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/categories");
      if (res.ok) setCategories(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const handleAddToCart = (product) => {
    addItem(product);
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500);
  };

  // ── Computed price range for slider hint ──
  const priceMin = products.length ? Math.min(...products.map((p) => Number(p.price))) : 0;
  const priceMax = products.length ? Math.max(...products.map((p) => Number(p.price))) : 999;

  // ── Merged category list: API categories + any category already on products ──
  const allCategoryNames = useMemo(() => {
    const fromApi      = categories.map((c) => c.name);
    const fromProducts = products.map((p) => p.category).filter(Boolean);
    return [...new Set([...fromApi, ...fromProducts])].sort();
  }, [categories, products]);

  // ── Active filter count ──
  const activeFilterCount = [
    minPrice !== "",
    maxPrice !== "",
    sortBy !== "default",
    stockOnly,
    category !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setMinPrice(""); setMaxPrice(""); setSortBy("default"); setStockOnly(false); setCategory("");
  };

  // ── Filtered + sorted products ──
  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
    });
    if (minPrice !== "") list = list.filter((p) => Number(p.price) >= Number(minPrice));
    if (maxPrice !== "") list = list.filter((p) => Number(p.price) <= Number(maxPrice));
    if (stockOnly)       list = list.filter((p) => p.quantity > 0);
    if (category)        list = list.filter((p) => p.category === category);

    return [...list].sort((a, b) => {
      if (sortBy === "price_asc")  return Number(a.price) - Number(b.price);
      if (sortBy === "price_desc") return Number(b.price) - Number(a.price);
      if (sortBy === "rating")     return (b.avg_rating || 0) - (a.avg_rating || 0);
      if (sortBy === "stock")      return b.quantity - a.quantity;
      return 0;
    });
  }, [products, search, minPrice, maxPrice, sortBy, stockOnly, category]);

  const cartIds = new Set(items.map((i) => i.id));

  return (
    <div>

      {/* ══ HERO ══ */}
      <section style={{
        background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 70%, ${colors.primaryMid} 100%)`,
        padding: "56px 32px 48px", textAlign: "center", color: colors.white,
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🌿</div>
          <h1 style={{ fontSize: 40, fontWeight: font.weight.extrabold, color: colors.white, marginBottom: 12, lineHeight: 1.15, letterSpacing: -1 }}>
            Réservez frais,<br />gaspillez moins
          </h1>
          <p style={{ fontSize: font.size.xl, color: "rgba(255,255,255,.85)", marginBottom: 28, lineHeight: 1.7 }}>
            Des produits frais à prix réduit, directement auprès de nos vendeurs partenaires.
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 480, margin: "0 auto" }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: colors.gray400, pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher un produit…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "14px 16px 14px 48px",
                borderRadius: radius.full, border: "none",
                fontSize: font.size.base, boxShadow: shadow.xl,
                outline: "none", boxSizing: "border-box", fontFamily: font.family,
              }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{
                position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                fontSize: 16, color: colors.gray400,
              }}>✕</button>
            )}
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <div style={{ background: colors.white, borderBottom: `1px solid ${colors.gray200}`, padding: "14px 32px", display: "flex", justifyContent: "center", gap: 48 }}>
        {[
          { label: "Produits disponibles", value: products.length,                               icon: "📦", onClick: null },
          { label: "En stock",             value: products.filter((p) => p.quantity > 0).length, icon: "✅", onClick: null },
          { label: "Favoris",              value: favorites.length,                              icon: "❤️", onClick: openFavorites },
        ].map((s) => (
          <div key={s.label} onClick={s.onClick} style={{ textAlign: "center", cursor: s.onClick ? "pointer" : "default" }}>
            <div style={{ fontSize: 20, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontSize: font.size["2xl"], fontWeight: font.weight.bold, color: colors.primary }}>{s.value}</div>
            <div style={{ fontSize: font.size.xs, color: colors.gray500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══ FEEDBACK ══ */}
      {added && (
        <div style={{ margin: "16px 32px 0", padding: "12px 16px", borderRadius: radius.md, background: colors.primaryLight, color: colors.primaryDark, borderLeft: `4px solid ${colors.primary}`, fontSize: font.size.base }}>
          Produit ajouté au panier —{" "}
          <span onClick={openCart} style={{ fontWeight: "bold", textDecoration: "underline", cursor: "pointer" }}>Voir le panier</span>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px 48px" }}>


        {/* ══ CATEGORY PILLS ══ */}
        {allCategoryNames.length > 0 && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
            {["", ...allCategoryNames].map((cat) => {
              const isAll    = cat === "";
              const label    = isAll ? "Tous" : cat;
              const isActive = category === cat;
              const count    = isAll
                ? products.length
                : products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat || "__all"}
                  onClick={() => setCategory(isActive && !isAll ? "" : cat)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: radius.full, border: "none", cursor: "pointer",
                    fontFamily: font.family, fontSize: font.size.sm, fontWeight: font.weight.semibold,
                    background: isActive ? colors.primary : colors.gray100,
                    color: isActive ? colors.white : colors.gray600,
                    transition: "all .15s",
                    opacity: !isAll && count === 0 ? 0.45 : 1,
                  }}
                >
                  {label}
                  <span style={{
                    fontSize: 11, fontWeight: 700, lineHeight: 1,
                    background: isActive ? "rgba(255,255,255,.25)" : colors.gray200,
                    color: isActive ? colors.white : colors.gray500,
                    borderRadius: radius.full, padding: "1px 6px",
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* ══ FILTER BAR ══ */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: font.size["2xl"], fontWeight: font.weight.bold, color: colors.gray900, margin: 0, flex: 1 }}>
              {search ? `Résultats pour "${search}"` : "Tous les produits"}
              <span style={{ fontSize: font.size.base, fontWeight: font.weight.normal, color: colors.gray400, marginLeft: 8 }}>({filtered.length})</span>
            </h2>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "8px 12px", borderRadius: radius.md, border: `1.5px solid ${colors.gray200}`,
                fontSize: font.size.sm, fontFamily: font.family, color: colors.gray700,
                background: colors.white, cursor: "pointer", outline: "none",
              }}
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Filters toggle button */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              style={{
                ...makeBtn(showFilters ? "primary" : "ghost", "sm"),
                position: "relative",
              }}
            >
              ⚙️ Filtres
              {activeFilterCount > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -6,
                  background: colors.danger, color: colors.white,
                  fontSize: 10, fontWeight: 700, borderRadius: radius.full,
                  minWidth: 17, height: 17, display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "0 3px",
                }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded filter panel */}
          {showFilters && (
            <div style={{
              marginTop: 12, padding: "16px 20px",
              background: colors.white, borderRadius: radius.xl,
              border: `1.5px solid ${colors.gray200}`,
              boxShadow: shadow.sm,
              display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
            }}>
              {/* Price range */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.gray600, whiteSpace: "nowrap" }}>Prix (DT)</span>
                <input
                  type="number" min="0" placeholder={`Min (${priceMin})`}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{ width: 80, padding: "7px 10px", borderRadius: radius.md, border: `1.5px solid ${colors.gray200}`, fontSize: font.size.sm, fontFamily: font.family, outline: "none" }}
                />
                <span style={{ color: colors.gray400 }}>—</span>
                <input
                  type="number" min="0" placeholder={`Max (${priceMax})`}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ width: 80, padding: "7px 10px", borderRadius: radius.md, border: `1.5px solid ${colors.gray200}`, fontSize: font.size.sm, fontFamily: font.family, outline: "none" }}
                />
              </div>

              {/* Stock only toggle */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox" checked={stockOnly}
                  onChange={(e) => setStockOnly(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: colors.primary, cursor: "pointer" }}
                />
                <span style={{ fontSize: font.size.sm, fontWeight: font.weight.medium, color: colors.gray700 }}>
                  En stock uniquement
                </span>
              </label>

              {/* Clear filters */}
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} style={{ ...makeBtn("ghost", "sm"), color: colors.danger, borderColor: colors.danger + "44", marginLeft: "auto" }}>
                  ✕ Effacer les filtres
                </button>
              )}
            </div>
          )}

          {/* Active filter chips */}
          {activeFilterCount > 0 && !showFilters && (
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {minPrice !== "" && (
                <FilterChip label={`Min ${minPrice} DT`} onRemove={() => setMinPrice("")} />
              )}
              {maxPrice !== "" && (
                <FilterChip label={`Max ${maxPrice} DT`} onRemove={() => setMaxPrice("")} />
              )}
              {sortBy !== "default" && (
                <FilterChip label={SORT_OPTIONS.find((o) => o.value === sortBy)?.label} onRemove={() => setSortBy("default")} />
              )}
              {stockOnly && (
                <FilterChip label="En stock uniquement" onRemove={() => setStockOnly(false)} />
              )}
              {category && (
                <FilterChip label={category} onRemove={() => setCategory("")} />
              )}
            </div>
          )}
        </div>

        {/* ══ PRODUCT GRID ══ */}
        {loading && (
          <div style={{ textAlign: "center", padding: 64, color: colors.gray400 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            <p>Chargement des produits…</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 64, color: colors.gray400 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ fontSize: font.size.lg, fontWeight: font.weight.medium, marginBottom: 6 }}>Aucun produit trouvé</p>
            <p style={{ fontSize: font.size.base }}>Essayez d'élargir vos filtres.</p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} style={{ ...makeBtn("primary", "sm"), marginTop: 16 }}>
                Effacer les filtres
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                token={token}
                inCart={cartIds.has(p.id)}
                justAdded={added === p.id}
                favorite={isFavorite(p.id)}
                onAdd={handleAddToCart}
                onGoToCart={openCart}
                onViewProduct={() => setSelectedProduct(p)}
                onToggleFavorite={() => toggleFavorite(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

// ── Filter chip ──
function FilterChip({ label, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: radius.full,
      background: colors.primaryLight, color: colors.primaryDark,
      fontSize: font.size.xs, fontWeight: font.weight.semibold,
    }}>
      {label}
      <button onClick={onRemove} style={{
        background: "none", border: "none", cursor: "pointer",
        color: colors.primaryDark, fontSize: 12, padding: 0, lineHeight: 1,
      }}>✕</button>
    </span>
  );
}

// ── Product card ──
function ProductCard({ product: p, token, inCart, justAdded, favorite, onAdd, onGoToCart, onViewProduct, onToggleFavorite, compact }) {
  const outOfStock = p.quantity === 0;

  return (
    <div className="product-card" style={{ fontSize: compact ? "0.92em" : undefined }}>
      {/* Image */}
      <div style={{ position: "relative", height: compact ? 160 : 200, background: colors.gray100, overflow: "hidden", cursor: "pointer" }} onClick={onViewProduct}>
        {p.image
          ? <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🥗</div>
        }

        {/* Stock badge */}
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          {outOfStock
            ? <span style={{ ...makeBadge("red"),   fontSize: 11 }}>Rupture</span>
            : <span style={{ ...makeBadge("green"), fontSize: 11 }}>En stock · {p.quantity}</span>
          }
        </div>

        {/* In cart badge */}
        {inCart && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <span style={{ ...makeBadge("blue"), fontSize: 11 }}>Dans le panier</span>
          </div>
        )}

        {/* Heart button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          title={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          style={{
            position: "absolute", bottom: 10, right: 10,
            width: 32, height: 32, borderRadius: radius.full,
            background: "rgba(255,255,255,0.92)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, boxShadow: shadow.sm,
            transition: "transform .15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.15)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          {favorite ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <h3
          onClick={onViewProduct}
          style={{ fontSize: font.size.lg, fontWeight: font.weight.bold, color: colors.gray900, margin: 0, lineHeight: 1.3, cursor: "pointer" }}
        >
          {p.name}
        </h3>

        {p.description && (
          <p style={{ fontSize: font.size.sm, color: colors.gray500, lineHeight: 1.55, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {p.description}
          </p>
        )}

        {/* Rating */}
        <button onClick={onViewProduct} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: font.family }}>
          {p.rating_count > 0 ? (
            <>
              <StarRating value={p.avg_rating} size={14} />
              <span style={{ fontSize: font.size.xs, color: colors.gray500 }}>{p.avg_rating?.toFixed(1)} · {p.rating_count} avis</span>
            </>
          ) : (
            <span style={{ fontSize: font.size.xs, color: colors.gray400 }}>Voir les avis</span>
          )}
        </button>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: "auto", paddingTop: 6 }}>
          <span style={{ fontSize: font.size["2xl"], fontWeight: font.weight.extrabold, color: colors.primary }}>{Number(p.price).toFixed(2)}</span>
          <span style={{ fontSize: font.size.base, fontWeight: font.weight.semibold, color: colors.gray500 }}>DT</span>
        </div>

        {/* CTA */}
        {!token ? (
          <button disabled style={{ ...makeBtn("secondary", "md"), width: "100%", cursor: "not-allowed", opacity: 0.7 }}>Connectez-vous</button>
        ) : outOfStock ? (
          <button disabled style={{ ...makeBtn("secondary", "md"), width: "100%", cursor: "not-allowed", opacity: 0.55 }}>Rupture de stock</button>
        ) : inCart ? (
          <button onClick={onGoToCart} style={{ ...makeBtn("outline", "md"), width: "100%" }}>
            {justAdded ? "Ajouté ✓" : "Voir le panier"}
          </button>
        ) : (
          <button onClick={() => onAdd(p)} style={{ ...makeBtn("primary", "md"), width: "100%" }}>
            Ajouter au panier
          </button>
        )}
      </div>
    </div>
  );
}
