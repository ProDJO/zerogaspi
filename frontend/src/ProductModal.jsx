import { useEffect, useState } from "react";
import StarRating from "./StarRating.jsx";
import { useCart } from "./CartContext.jsx";
import { useAuth } from "./useAuth.jsx";
import { useFavorites } from "./FavoritesContext.jsx";
import { colors, font, radius, shadow, makeBtn, makeBadge } from "./theme.js";

export default function ProductModal({ product, onClose }) {
  const { token, user } = useAuth();
  const { addItem, items, openCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [reviews,     setReviews]     = useState([]);
  const [loadingRevs, setLoadingRevs] = useState(true);
  const [myRating,    setMyRating]    = useState(null); // existing rating by this user

  // Form state
  const [stars,      setStars]      = useState(0);
  const [comment,    setComment]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMsg,    setFormMsg]    = useState("");

  const inCart     = items.some((i) => i.id === product.id);
  const outOfStock = product.quantity === 0;

  const fetchReviews = () => {
    setLoadingRevs(true);
    fetch(`http://localhost:5000/ratings/product/${product.id}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setReviews(list);
        // Check if current user already rated
        if (user) {
          const mine = list.find((r) => r.author === user.name);
          setMyRating(mine || null);
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setLoadingRevs(false));
  };

  useEffect(() => { fetchReviews(); }, [product.id]);

  const handleAdd = () => { addItem(product); openCart(); };

  const handleSubmitReview = async () => {
    if (!stars) { setFormMsg("Choisissez une note (1 à 5 étoiles)"); return; }
    setSubmitting(true);
    setFormMsg("");
    try {
      const res = await fetch("http://localhost:5000/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: product.id, stars, comment }),
      });
      const text = await res.text();
      if (!res.ok) { setFormMsg(text); return; }
      setStars(0); setComment("");
      setFormMsg("Avis publié !");
      fetchReviews();
    } catch {
      setFormMsg("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 2001,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, pointerEvents: "none",
      }}>
        <div style={{
          background: colors.white, borderRadius: radius["2xl"],
          boxShadow: shadow.xl, width: "100%", maxWidth: 640,
          maxHeight: "90vh", overflow: "hidden",
          display: "flex", flexDirection: "column",
          pointerEvents: "auto",
        }}>

          {/* ── Image header ── */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{ height: 200, background: colors.gray100, overflow: "hidden" }}>
              {product.image
                ? <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>🥗</div>
              }
            </div>
            <button onClick={onClose} style={{
              position: "absolute", top: 12, right: 12,
              width: 34, height: 34, borderRadius: radius.full,
              background: "rgba(0,0,0,0.45)", border: "none",
              color: colors.white, fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
            {/* Favorite button */}
            <button
              onClick={() => toggleFavorite(product)}
              style={{
                position: "absolute", bottom: 12, right: 12,
                width: 38, height: 38, borderRadius: radius.full,
                background: "rgba(255,255,255,0.95)", border: "none",
                cursor: "pointer", fontSize: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: shadow.sm, transition: "transform .15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.12)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {isFavorite(product.id) ? "❤️" : "🤍"}
            </button>
            <div style={{ position: "absolute", top: 12, left: 12 }}>
              {outOfStock
                ? <span style={{ ...makeBadge("red"),   fontSize: 11 }}>Rupture de stock</span>
                : <span style={{ ...makeBadge("green"), fontSize: 11 }}>En stock · {product.quantity}</span>
              }
            </div>
          </div>

          {/* ── Scrollable body ── */}
          <div style={{ overflowY: "auto", flex: 1 }}>

            {/* Product info */}
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${colors.gray100}` }}>
              <h2 style={{ fontSize: font.size["2xl"], fontWeight: font.weight.extrabold, color: colors.gray900, margin: "0 0 4px" }}>
                {product.name}
              </h2>

              {reviews.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <StarRating value={product.avg_rating} size={16} />
                  <span style={{ fontSize: font.size.xs, color: colors.gray500 }}>
                    {product.avg_rating?.toFixed(1)} · {reviews.length} avis
                  </span>
                </div>
              )}

              {product.description && (
                <p style={{ color: colors.gray600, fontSize: font.size.sm, lineHeight: 1.7, margin: "6px 0 12px" }}>
                  {product.description}
                </p>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <span style={{ fontSize: font.size["3xl"], fontWeight: font.weight.extrabold, color: colors.primary }}>
                    {Number(product.price).toFixed(2)}
                  </span>
                  <span style={{ fontSize: font.size.base, color: colors.gray500, marginLeft: 4 }}>DT</span>
                </div>
                {!token ? (
                  <button disabled style={{ ...makeBtn("secondary", "sm"), cursor: "not-allowed", opacity: 0.7 }}>Connectez-vous</button>
                ) : outOfStock ? (
                  <button disabled style={{ ...makeBtn("secondary", "sm"), cursor: "not-allowed", opacity: 0.55 }}>Rupture</button>
                ) : inCart ? (
                  <button onClick={openCart} style={makeBtn("outline", "sm")}>Voir le panier</button>
                ) : (
                  <button onClick={handleAdd} style={makeBtn("primary", "sm")}>Ajouter au panier</button>
                )}
              </div>
            </div>

            {/* ── Avis clients ── */}
            <div style={{ padding: "18px 22px" }}>
              <h3 style={{ fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.gray900, margin: "0 0 14px" }}>
                Avis clients
                {reviews.length > 0 && (
                  <span style={{ fontSize: font.size.sm, fontWeight: font.weight.normal, color: colors.gray400, marginLeft: 6 }}>
                    ({reviews.length})
                  </span>
                )}
              </h3>

              {/* ── Write review form ── */}
              {token && !myRating && (
                <div style={{
                  background: colors.gray50, borderRadius: radius.xl,
                  border: `1px solid ${colors.gray200}`,
                  padding: "16px 18px", marginBottom: 18,
                }}>
                  <p style={{ fontWeight: font.weight.semibold, fontSize: font.size.base, color: colors.gray800, margin: "0 0 10px" }}>
                    Laisser un avis
                  </p>

                  <StarRating value={stars} onChange={setStars} size={30} />

                  <textarea
                    placeholder="Décrivez votre expérience avec ce produit…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%", marginTop: 10,
                      padding: "10px 12px",
                      border: `1.5px solid ${colors.gray300}`,
                      borderRadius: radius.md,
                      fontSize: font.size.sm, fontFamily: font.family,
                      resize: "vertical", boxSizing: "border-box",
                      outline: "none", color: colors.gray800,
                    }}
                  />

                  {formMsg && (
                    <p style={{
                      fontSize: font.size.sm, marginTop: 6,
                      color: formMsg === "Avis publié !" ? colors.primary : colors.danger,
                    }}>
                      {formMsg}
                    </p>
                  )}

                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting || !stars}
                    style={{
                      ...makeBtn("primary", "sm"), marginTop: 10,
                      opacity: !stars || submitting ? 0.5 : 1,
                      cursor: !stars || submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {submitting ? "Publication…" : "Publier l'avis"}
                  </button>
                </div>
              )}

              {token && myRating && (
                <div style={{
                  background: colors.primaryLight, borderRadius: radius.lg,
                  padding: "10px 14px", marginBottom: 14,
                  border: `1px solid ${colors.primary}33`,
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <StarRating value={myRating.stars} size={16} />
                  <span style={{ fontSize: font.size.sm, color: colors.primaryDark }}>
                    Vous avez déjà noté ce produit
                  </span>
                </div>
              )}

              {!token && (
                <p style={{ fontSize: font.size.sm, color: colors.gray400, marginBottom: 14 }}>
                  Connectez-vous pour laisser un avis.
                </p>
              )}

              {/* ── Review list ── */}
              {loadingRevs && <p style={{ color: colors.gray400, fontSize: font.size.sm }}>Chargement…</p>}

              {!loadingRevs && reviews.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 16px", color: colors.gray400 }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>💬</div>
                  <p style={{ margin: 0, fontSize: font.size.sm }}>Aucun avis pour le moment. Soyez le premier !</p>
                </div>
              )}

              {!loadingRevs && reviews.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {reviews.map((review, i) => <ReviewCard key={i} review={review} isOwn={user?.name === review.author} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ReviewCard({ review, isOwn }) {
  const initial = (review.author?.[0] || "?").toUpperCase();
  const date    = new Date(review.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{
      padding: "12px 14px",
      background: isOwn ? colors.primaryLight : colors.gray50,
      borderRadius: radius.lg,
      border: `1px solid ${isOwn ? colors.primary + "33" : colors.gray100}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: review.comment ? 8 : 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: radius.full, flexShrink: 0,
          background: isOwn ? colors.primary : colors.gray300,
          color: colors.white,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: font.weight.bold, fontSize: font.size.base,
        }}>
          {initial}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: font.weight.semibold, fontSize: font.size.sm, color: colors.gray800, margin: 0 }}>
            {review.author} {isOwn && <span style={{ color: colors.primary, fontSize: font.size.xs }}>(vous)</span>}
          </p>
          <p style={{ fontSize: 11, color: colors.gray400, margin: 0 }}>{date}</p>
        </div>

        <StarRating value={review.stars} size={15} />
      </div>

      {review.comment && (
        <p style={{ fontSize: font.size.sm, color: colors.gray600, lineHeight: 1.65, margin: 0, paddingLeft: 44 }}>
          {review.comment}
        </p>
      )}
    </div>
  );
}
