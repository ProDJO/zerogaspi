import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useAuth } from "../useAuth.jsx";
import { useCart } from "../CartContext.jsx";
import MapPicker from "../MapPicker.jsx";
import StarRating from "../StarRating.jsx";
import { colors, font, radius, shadow, makeBtn, makeBadge } from "../theme.js";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const livreurIcon = new L.DivIcon({
  html: '<div style="font-size:26px;line-height:1">🚚</div>',
  className: "", iconAnchor: [13, 13],
});

// ── Status stepper config ──
const STEPS = [
  { key: null,              label: "Commande passée"       },
  { key: "awaiting_vendeur",label: "En attente vendeur"    },
  { key: "pending",         label: "Approuvée"             },
  { key: "accepted",        label: "Livreur assigné"       },
  { key: "in_progress",     label: "En cours de livraison" },
  { key: "delivered",       label: "Livrée"                },
];

function getStepIndex(status) {
  if (!status) return 0;
  const idx = STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

// ── Delivery label / color ──
const D_LABEL = {
  awaiting_vendeur: "En attente vendeur",
  pending:          "Approuvée",
  rejected:         "Refusée",
  accepted:         "Livreur assigné",
  in_progress:      "En cours",
  delivered:        "Livrée",
};
const D_COLOR = {
  awaiting_vendeur: colors.accent,
  pending:          colors.info,
  rejected:         colors.danger,
  accepted:         "#6f42c1",
  in_progress:      colors.accent,
  delivered:        colors.primary,
};

export default function MesReservations() {
  const { token } = useAuth();
  const { addItem, openCart } = useCart();

  const [tab,          setTab]          = useState("en-cours");
  const [reservations, setReservations] = useState([]);
  const [deliveries,   setDeliveries]   = useState([]);
  const [myRatings,    setMyRatings]    = useState({});   // delivery_id → rating
  const [loading,      setLoading]      = useState(true);
  const [message,      setMessage]      = useState("");

  // Map picker state
  const [mapFor,  setMapFor]  = useState(null);
  const [mapPos,  setMapPos]  = useState(null);
  const [sending, setSending] = useState(false);

  // Rating form state per delivery
  const [ratingFor,    setRatingFor]    = useState(null); // delivery_id
  const [ratingStars,  setRatingStars]  = useState(0);
  const [ratingText,   setRatingText]   = useState("");
  const [ratingLoading,setRatingLoading]= useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const h = { Authorization: `Bearer ${token}` };
      const [resR, resD, resRat] = await Promise.all([
        fetch("http://localhost:5000/reservations/me",  { headers: h }),
        fetch("http://localhost:5000/deliveries/client", { headers: h }),
        fetch("http://localhost:5000/ratings/mine",      { headers: h }),
      ]);
      const [dataR, dataD, dataRat] = await Promise.all([
        resR.ok  ? resR.json()  : [],
        resD.ok  ? resD.json()  : [],
        resRat.ok? resRat.json(): [],
      ]);
      setReservations(Array.isArray(dataR) ? dataR : []);
      setDeliveries(Array.isArray(dataD)   ? dataD : []);
      // Index ratings by delivery_id
      const rMap = {};
      (Array.isArray(dataRat) ? dataRat : []).forEach((r) => { rMap[r.delivery_id] = r; });
      setMyRatings(rMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchAll(); }, [token]);

  // Map delivery by reservation_id
  const deliveryByRes = deliveries.reduce((acc, d) => { acc[d.reservation_id] = d; return acc; }, {});

  // Partition: active vs completed
  const activeReservations    = reservations.filter((r) => {
    const d = deliveryByRes[r.id];
    return !d || d.status !== "delivered";
  });
  const completedDeliveries = deliveries.filter((d) => d.status === "delivered");

  // ── Handlers ──

  const handleCancel = async (id) => {
    setMessage("");
    try {
      const res = await fetch(`http://localhost:5000/reservations/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Réservation annulée");
      fetchAll();
    } catch (err) { setMessage(`Erreur : ${err.message}`); }
  };

  const handleConfirmLocation = async () => {
    if (!mapPos || !mapFor) return;
    setSending(true);
    try {
      const res = await fetch("http://localhost:5000/deliveries/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reservation_id: mapFor, lat: mapPos.lat, lng: mapPos.lng }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Demande de livraison envoyée au vendeur");
      setMapFor(null); setMapPos(null);
      fetchAll();
    } catch (err) { setMessage(`Erreur : ${err.message}`); }
    finally { setSending(false); }
  };

  const handleSubmitRating = async (deliveryId, productId) => {
    if (!ratingStars) return;
    setRatingLoading(true);
    try {
      const res = await fetch("http://localhost:5000/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ delivery_id: deliveryId, product_id: productId, stars: ratingStars, comment: ratingText }),
      });
      if (!res.ok) throw new Error(await res.text());
      setRatingFor(null); setRatingStars(0); setRatingText("");
      fetchAll();
    } catch (err) { setMessage(`Erreur notation : ${err.message}`); }
    finally { setRatingLoading(false); }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>

      <h1 style={{ fontSize: font.size["3xl"], fontWeight: font.weight.extrabold, color: colors.gray900, marginBottom: 4 }}>
        Mes commandes
      </h1>

      {message && (
        <div style={{
          padding: "10px 14px", borderRadius: radius.md, marginBottom: 16,
          background: message.startsWith("Erreur") ? colors.dangerLight : colors.primaryLight,
          color:      message.startsWith("Erreur") ? colors.dangerDark  : colors.primaryDark,
          borderLeft: `4px solid ${message.startsWith("Erreur") ? colors.danger : colors.primary}`,
          fontSize: font.size.base,
        }}>
          {message}
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `2px solid ${colors.gray200}` }}>
        {[
          { id: "en-cours",   label: `En cours (${activeReservations.length})`       },
          { id: "historique", label: `Historique (${completedDeliveries.length})`    },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 20px", border: "none", cursor: "pointer",
            background: "none", fontFamily: font.family,
            fontSize: font.size.base, fontWeight: font.weight.semibold,
            color: tab === t.id ? colors.primary : colors.gray500,
            borderBottom: `2px solid ${tab === t.id ? colors.primary : "transparent"}`,
            marginBottom: -2, transition: "color .15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: colors.gray400 }}>Chargement…</p>}

      {/* ════ TAB : EN COURS ════ */}
      {!loading && tab === "en-cours" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {activeReservations.length === 0 && (
            <p style={{ color: colors.gray500 }}>Aucune commande en cours.</p>
          )}
          {activeReservations.map((r) => {
            const delivery = deliveryByRes[r.id];
            return (
              <ActiveCard
                key={r.id}
                reservation={r}
                delivery={delivery}
                onCancel={() => handleCancel(r.id)}
                onRequestDelivery={() => { setMapFor(r.id); setMapPos(null); }}
              />
            );
          })}
        </div>
      )}

      {/* ════ TAB : HISTORIQUE ════ */}
      {!loading && tab === "historique" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {completedDeliveries.length === 0 && (
            <p style={{ color: colors.gray500 }}>Aucune commande terminée.</p>
          )}
          {completedDeliveries.map((d) => {
            const existing = myRatings[d.id];
            return (
              <HistoryCard
                key={d.id}
                delivery={d}
                token={token}
                existingRating={existing}
                isRating={ratingFor === d.id}
                ratingStars={ratingStars}
                ratingText={ratingText}
                onOpenRating={() => { setRatingFor(d.id); setRatingStars(0); setRatingText(""); }}
                onCancelRating={() => setRatingFor(null)}
                onStarChange={setRatingStars}
                onTextChange={setRatingText}
                onSubmitRating={() => handleSubmitRating(d.id, d.product_id)}
                ratingLoading={ratingLoading}
                onReorder={(product) => { addItem(product); openCart(); }}
              />
            );
          })}
        </div>
      )}

      {/* Map picker modal */}
      {mapFor && (
        <MapPicker
          position={mapPos}
          onSelect={(ll) => setMapPos({ lat: ll.lat, lng: ll.lng })}
          onConfirm={handleConfirmLocation}
          onCancel={() => { setMapFor(null); setMapPos(null); }}
        />
      )}
    </div>
  );
}

// ── Active reservation card ──
function ActiveCard({ reservation: r, delivery, onCancel, onRequestDelivery }) {
  const [showMap, setShowMap] = useState(false);
  const hasLivreurGPS = delivery?.current_lat && delivery?.current_lng;
  const hasClientGPS  = delivery?.client_lat  && delivery?.client_lng;
  const stepIdx = delivery ? getStepIndex(delivery.status) : 0;

  return (
    <div style={{ background: colors.white, borderRadius: radius.xl, boxShadow: shadow.card, border: `1px solid ${colors.gray100}`, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${colors.gray100}` }}>
        <div>
          <p style={{ fontWeight: font.weight.bold, fontSize: font.size.lg, color: colors.gray900, margin: 0 }}>
            {r.name}
          </p>
          <p style={{ color: colors.gray500, fontSize: font.size.sm, margin: "2px 0 0" }}>
            Qté : {r.quantity}
          </p>
        </div>
        {delivery ? (
          <span style={{
            ...makeBadge(delivery.status === "delivered" ? "green" : delivery.status === "rejected" ? "red" : "orange"),
            fontSize: font.size.xs,
          }}>
            {D_LABEL[delivery.status] || delivery.status}
          </span>
        ) : (
          <span style={{ ...makeBadge("gray"), fontSize: font.size.xs }}>Pas de livraison</span>
        )}
      </div>

      {/* Status stepper */}
      {delivery && delivery.status !== "rejected" && (
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.gray100}` }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {STEPS.map((step, i) => {
              const done    = i < stepIdx;
              const current = i === stepIdx;
              const last    = i === STEPS.length - 1;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: last ? 0 : 1 }}>
                  {/* Circle */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: radius.full,
                      background: done ? colors.primary : current ? colors.primaryMid : colors.gray200,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, color: done || current ? colors.white : colors.gray400,
                      border: current ? `2px solid ${colors.primary}` : "none",
                      flexShrink: 0,
                      boxShadow: current ? `0 0 0 4px ${colors.primaryLight}` : "none",
                    }}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: 9, color: current ? colors.primary : colors.gray400, fontWeight: current ? font.weight.semibold : font.weight.normal, textAlign: "center", maxWidth: 60, lineHeight: 1.2 }}>
                      {step.label}
                    </span>
                  </div>
                  {/* Connector line */}
                  {!last && (
                    <div style={{ flex: 1, height: 2, background: done ? colors.primary : colors.gray200, margin: "0 4px", marginBottom: 20 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracking map — visible when in_progress */}
      {delivery?.status === "in_progress" && (hasClientGPS || hasLivreurGPS) && (
        <div style={{ borderBottom: `1px solid ${colors.gray100}` }}>
          <button
            onClick={() => setShowMap((v) => !v)}
            style={{ ...makeBtn("ghost", "sm"), margin: "12px 20px", fontSize: font.size.sm }}
          >
            {showMap ? "Masquer la carte" : "📍 Voir la carte de suivi"}
          </button>
          {showMap && (
            <div style={{ height: 260 }}>
              <MapContainer
                center={
                  hasLivreurGPS
                    ? [delivery.current_lat, delivery.current_lng]
                    : [delivery.client_lat, delivery.client_lng]
                }
                zoom={13}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                {hasClientGPS && (
                  <Marker position={[delivery.client_lat, delivery.client_lng]}>
                    <Popup>Votre adresse de livraison</Popup>
                  </Marker>
                )}
                {hasLivreurGPS && (
                  <Marker position={[delivery.current_lat, delivery.current_lng]} icon={livreurIcon}>
                    <Popup>Livreur en route</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: "12px 20px", display: "flex", gap: 10 }}>
        {!delivery && (
          <>
            <button onClick={onCancel} style={{ ...makeBtn("danger", "sm") }}>
              Annuler
            </button>
            <button onClick={onRequestDelivery} style={{ ...makeBtn("primary", "sm") }}>
              Demander livraison
            </button>
          </>
        )}
        {delivery?.status === "rejected" && (
          <p style={{ color: colors.danger, fontSize: font.size.sm, margin: 0 }}>
            La livraison a été refusée par le vendeur.
          </p>
        )}
      </div>
    </div>
  );
}

// ── History card ──
function HistoryCard({ delivery: d, token, existingRating, isRating, ratingStars, ratingText,
  onOpenRating, onCancelRating, onStarChange, onTextChange, onSubmitRating, ratingLoading, onReorder }) {
  const total = (Number(d.product_price) * d.quantity).toFixed(2);

  const [reorderState, setReorderState] = useState("idle"); // idle | loading | outofstock

  const handleReorder = async () => {
    setReorderState("loading");
    try {
      const res = await fetch(`http://localhost:5000/products/${d.product_id}`);
      if (!res.ok) throw new Error();
      const product = await res.json();
      if (!product || product.quantity === 0) {
        setReorderState("outofstock");
        setTimeout(() => setReorderState("idle"), 3000);
        return;
      }
      onReorder(product);
      setReorderState("idle");
    } catch {
      setReorderState("outofstock");
      setTimeout(() => setReorderState("idle"), 3000);
    }
  };

  return (
    <div style={{ background: colors.white, borderRadius: radius.xl, boxShadow: shadow.card, border: `1px solid ${colors.gray100}`, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", gap: 16, alignItems: "center" }}>
        {/* Thumbnail */}
        <div style={{ width: 60, height: 60, flexShrink: 0, borderRadius: radius.lg, overflow: "hidden", background: colors.gray100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
          {d.product_image
            ? <img src={d.product_image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : "🥗"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: font.weight.bold, fontSize: font.size.lg, color: colors.gray900, margin: 0 }}>
            {d.product_name}
          </p>
          <p style={{ color: colors.gray500, fontSize: font.size.sm, margin: "2px 0 0" }}>
            {d.quantity} unité{d.quantity > 1 ? "s" : ""} · {new Date(d.updated_at).toLocaleDateString("fr-FR")}
          </p>
          {existingRating && (
            <StarRating value={existingRating.stars} size={16} />
          )}
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontWeight: font.weight.extrabold, fontSize: font.size.xl, color: colors.primary, margin: "0 0 4px" }}>
            {total} DT
          </p>
          <span style={{ ...makeBadge("green"), fontSize: 11 }}>Livrée ✓</span>
          <div style={{ marginTop: 8 }}>
            {reorderState === "outofstock" ? (
              <span style={{ fontSize: 11, color: colors.danger, fontWeight: font.weight.semibold }}>
                Rupture de stock
              </span>
            ) : (
              <button
                onClick={handleReorder}
                disabled={reorderState === "loading"}
                style={{
                  ...makeBtn("outline", "sm"),
                  fontSize: 11, padding: "4px 10px",
                  opacity: reorderState === "loading" ? 0.7 : 1,
                  cursor: reorderState === "loading" ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {reorderState === "loading" ? "…" : "🔁 Commander à nouveau"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rating section */}
      <div style={{ padding: "0 20px 16px" }}>
        {existingRating ? (
          <div style={{ padding: "10px 14px", background: colors.gray50, borderRadius: radius.md }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: existingRating.comment ? 4 : 0 }}>
              <StarRating value={existingRating.stars} size={18} />
              <span style={{ fontSize: font.size.sm, color: colors.gray500 }}>Votre note</span>
            </div>
            {existingRating.comment && (
              <p style={{ fontSize: font.size.sm, color: colors.gray600, margin: 0, fontStyle: "italic" }}>
                "{existingRating.comment}"
              </p>
            )}
          </div>
        ) : isRating ? (
          <div style={{ padding: "14px", background: colors.gray50, borderRadius: radius.md }}>
            <p style={{ fontWeight: font.weight.semibold, fontSize: font.size.base, color: colors.gray800, margin: "0 0 10px" }}>
              Notez ce produit
            </p>
            <StarRating value={ratingStars} onChange={onStarChange} size={28} />
            <textarea
              placeholder="Commentaire optionnel…"
              value={ratingText}
              onChange={(e) => onTextChange(e.target.value)}
              rows={3}
              style={{
                width: "100%", marginTop: 10, padding: "8px 10px",
                border: `1.5px solid ${colors.gray300}`, borderRadius: radius.md,
                fontSize: font.size.sm, fontFamily: font.family,
                resize: "vertical", boxSizing: "border-box", outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button
                onClick={onSubmitRating}
                disabled={!ratingStars || ratingLoading}
                style={{ ...makeBtn("primary", "sm"), opacity: !ratingStars ? 0.5 : 1, cursor: !ratingStars ? "not-allowed" : "pointer" }}
              >
                {ratingLoading ? "Envoi…" : "Soumettre"}
              </button>
              <button onClick={onCancelRating} style={makeBtn("ghost", "sm")}>
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button onClick={onOpenRating} style={{ ...makeBtn("outline", "sm"), fontSize: font.size.xs }}>
            ★ Laisser un avis
          </button>
        )}
      </div>
    </div>
  );
}
