import { useEffect, useState } from "react";
import { useAuth } from "../useAuth.jsx";
import { colors, font, radius, shadow, makeBtn, makeBadge } from "../theme.js";

const STATUS_LABEL = {
  pending:     "En attente",
  accepted:    "Acceptée",
  in_progress: "En cours",
  delivered:   "Livrée",
};

const STATUS_COLOR = {
  pending:     colors.gray500,
  accepted:    colors.info,
  in_progress: colors.accent,
  delivered:   colors.primary,
};

const Card = ({ children, style }) => (
  <div style={{
    background: colors.white, borderRadius: radius.xl,
    border: `1px solid ${colors.gray200}`, boxShadow: shadow.sm,
    ...style,
  }}>
    {children}
  </div>
);

const Th = ({ children }) => (
  <th style={{
    padding: "10px 14px", textAlign: "left",
    fontSize: 11, fontWeight: 700, color: colors.gray500,
    textTransform: "uppercase", letterSpacing: "0.06em",
    background: colors.gray50, borderBottom: `1px solid ${colors.gray200}`,
  }}>{children}</th>
);
const Td = ({ children, style }) => (
  <td style={{ padding: "12px 14px", fontSize: 14, color: colors.gray700, borderBottom: `1px solid ${colors.gray100}`, verticalAlign: "middle", ...style }}>{children}</td>
);

export default function LivreurPage() {
  const { token } = useAuth();

  const [tab,          setTab]          = useState("active");
  const [available,    setAvailable]    = useState([]);
  const [myActive,     setMyActive]     = useState([]);
  const [myHistory,    setMyHistory]    = useState([]);
  const [message,      setMessage]      = useState("");
  const [gpsLoading,   setGpsLoading]   = useState(null);
  const [available_status, setAvailableStatus] = useState(true); // livreur availability
  const [toggling,     setToggling]     = useState(false);
  const [loading,      setLoading]      = useState(true);

  const h = { Authorization: `Bearer ${token}` };

  // Fetch livreur availability from profile
  const fetchMe = async () => {
    const res = await fetch("http://localhost:5000/users/me", { headers: h });
    if (res.ok) {
      const data = await res.json();
      setAvailableStatus(data.available ?? true);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resAvail, resMine] = await Promise.all([
        fetch("http://localhost:5000/deliveries/available", { headers: h }),
        fetch("http://localhost:5000/deliveries/mine",      { headers: h }),
      ]);
      const [avail, mine] = await Promise.all([resAvail.json(), resMine.json()]);
      setAvailable(Array.isArray(avail) ? avail : []);

      const all = Array.isArray(mine) ? mine : [];
      setMyActive(all.filter((d) => d.status !== "delivered"));
      setMyHistory(all.filter((d) => d.status === "delivered"));
    } catch (err) {
      console.error("Erreur chargement livraisons :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
    fetchData();
  }, []);

  const handleToggleAvailability = async () => {
    setToggling(true);
    try {
      const res = await fetch("http://localhost:5000/users/availability", {
        method: "PATCH", headers: h,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAvailableStatus(data.available);
      setMessage(data.available ? "Vous êtes maintenant disponible" : "Vous êtes maintenant indisponible");
    } catch (err) {
      setMessage(`Erreur : ${err.message}`);
    } finally {
      setToggling(false);
    }
  };

  const handleAccept = async (id) => {
    setMessage("");
    try {
      const res = await fetch(`http://localhost:5000/deliveries/${id}/accept`, {
        method: "PUT", headers: h,
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage("Livraison acceptée");
      fetchData();
    } catch (err) {
      setMessage(`Erreur : ${err.message}`);
    }
  };

  const handleStatus = async (id, status) => {
    setMessage("");
    try {
      const res = await fetch(`http://localhost:5000/deliveries/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...h },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage(`Statut mis à jour : ${STATUS_LABEL[status]}`);
      fetchData();
    } catch (err) {
      setMessage(`Erreur : ${err.message}`);
    }
  };

  const handleGPS = (id) => {
    if (!navigator.geolocation) { setMessage("Erreur : géolocalisation non supportée"); return; }
    setGpsLoading(id);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`http://localhost:5000/deliveries/${id}/position`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...h },
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          if (!res.ok) throw new Error(await res.text());
          setMessage("Position GPS envoyée — le client peut vous suivre");
        } catch (err) { setMessage(`Erreur : ${err.message}`); }
        finally { setGpsLoading(null); }
      },
      () => { setMessage("Erreur : GPS indisponible"); setGpsLoading(null); }
    );
  };

  const mapsLink = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`;

  const TABS = [
    { id: "active",    label: `En cours (${myActive.length + available.length})` },
    { id: "historique",label: `Historique (${myHistory.length})` },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px", fontFamily: font.family }}>
      <h1 style={{ fontSize: font.size["3xl"], fontWeight: font.weight.extrabold, color: colors.gray900, marginBottom: 4 }}>
        Espace Livreur
      </h1>

      {message && (
        <div style={{
          padding: "10px 14px", borderRadius: radius.md, marginBottom: 16, fontSize: font.size.sm,
          background: message.startsWith("Erreur") ? colors.dangerLight : colors.primaryLight,
          color: message.startsWith("Erreur") ? colors.dangerDark : colors.primaryDark,
          borderLeft: `3px solid ${message.startsWith("Erreur") ? colors.danger : colors.primary}`,
        }}>{message}</div>
      )}

      {/* ── Availability toggle ── */}
      <Card style={{ padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <p style={{ margin: 0, fontWeight: font.weight.bold, fontSize: font.size.base, color: colors.gray900 }}>
            Statut de disponibilité
          </p>
          <p style={{ margin: "3px 0 0", fontSize: font.size.sm, color: colors.gray500 }}>
            {available_status
              ? "Vous êtes disponible et pouvez accepter des livraisons."
              : "Vous êtes indisponible — vous ne recevrez pas de nouvelles livraisons."}
          </p>
        </div>
        <button
          onClick={handleToggleAvailability}
          disabled={toggling}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 18px", borderRadius: radius.full, border: "none",
            cursor: toggling ? "not-allowed" : "pointer", fontFamily: font.family,
            fontWeight: font.weight.bold, fontSize: font.size.base,
            background: available_status ? colors.primary : colors.gray300,
            color: colors.white,
            transition: "background .2s",
            opacity: toggling ? 0.7 : 1,
          }}
        >
          <span style={{
            width: 20, height: 20, borderRadius: "50%",
            background: colors.white,
            display: "inline-block", flexShrink: 0,
          }} />
          {available_status ? "Disponible" : "Indisponible"}
        </button>
      </Card>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: colors.gray400 }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
          <p style={{ margin: 0, fontSize: font.size.sm }}>Chargement des livraisons…</p>
        </div>
      )}

      {/* Tabs */}
      {!loading && <div style={{ display: "flex", gap: 4, borderBottom: `2px solid ${colors.gray200}`, marginBottom: 24 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 20px", border: "none", cursor: "pointer",
            background: "none", fontFamily: font.family,
            fontSize: font.size.base, fontWeight: font.weight.semibold,
            color: tab === t.id ? colors.primary : colors.gray500,
            borderBottom: `2px solid ${tab === t.id ? colors.primary : "transparent"}`,
            marginBottom: -2, transition: "color .15s",
          }}>{t.label}</button>
        ))}
      </div>}

      {/* ════ TAB : EN COURS ════ */}
      {!loading && tab === "active" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Available deliveries */}
          <div>
            <h2 style={{ fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.gray800, margin: "0 0 12px" }}>
              Livraisons disponibles ({available.length})
            </h2>

            {!available_status && (
              <div style={{ padding: "12px 16px", background: colors.gray100, borderRadius: radius.lg, marginBottom: 12, fontSize: font.size.sm, color: colors.gray600 }}>
                Vous êtes indisponible — activez votre disponibilité pour accepter des livraisons.
              </div>
            )}

            {available.length === 0 ? (
              <Card style={{ padding: "32px", textAlign: "center" }}>
                <p style={{ color: colors.gray400, margin: 0 }}>Aucune livraison disponible pour le moment.</p>
              </Card>
            ) : (
              <Card>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr><Th>Produit</Th><Th>Client</Th><Th>Qté</Th><Th>Adresse client</Th><Th>Date</Th><Th>Action</Th></tr></thead>
                  <tbody>
                    {available.map((d) => (
                      <tr key={d.id}
                        onMouseEnter={(e) => e.currentTarget.style.background = colors.gray50}
                        onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                        <Td style={{ fontWeight: 600 }}>{d.product_name}</Td>
                        <Td>{d.client_name}</Td>
                        <Td>{d.quantity}</Td>
                        <Td>
                          {d.client_lat && d.client_lng ? (
                            <a href={mapsLink(d.client_lat, d.client_lng)} target="_blank" rel="noreferrer"
                              style={{ color: colors.info, fontSize: 13 }}>📍 Voir sur Maps</a>
                          ) : <span style={{ color: colors.gray300 }}>—</span>}
                        </Td>
                        <Td style={{ fontSize: 12, color: colors.gray500 }}>{new Date(d.created_at).toLocaleDateString("fr-FR")}</Td>
                        <Td>
                          {available_status ? (
                            <button onClick={() => handleAccept(d.id)} style={{ ...makeBtn("primary", "sm"), fontSize: 12 }}>
                              Accepter
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: colors.gray400 }}>Indisponible</span>
                          )}
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>

          {/* My active deliveries */}
          <div>
            <h2 style={{ fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.gray800, margin: "0 0 12px" }}>
              Mes livraisons actives ({myActive.length})
            </h2>
            {myActive.length === 0 ? (
              <Card style={{ padding: "32px", textAlign: "center" }}>
                <p style={{ color: colors.gray400, margin: 0 }}>Aucune livraison en cours.</p>
              </Card>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myActive.map((d) => (
                  <Card key={d.id} style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <p style={{ margin: 0, fontWeight: font.weight.bold, fontSize: font.size.base, color: colors.gray900 }}>
                          {d.product_name}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: font.size.sm, color: colors.gray500 }}>
                          {d.client_name} · {d.quantity} unité{d.quantity > 1 ? "s" : ""}
                        </p>
                      </div>

                      {d.client_lat && d.client_lng && (
                        <a href={mapsLink(d.client_lat, d.client_lng)} target="_blank" rel="noreferrer"
                          style={{ fontSize: 13, color: colors.info }}>📍 Voir l'adresse</a>
                      )}

                      <span style={{
                        padding: "3px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                        background: (STATUS_COLOR[d.status] || colors.gray400) + "22",
                        color: STATUS_COLOR[d.status] || colors.gray400,
                      }}>
                        {STATUS_LABEL[d.status] || d.status}
                      </span>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {d.status === "accepted" && (
                          <button onClick={() => handleStatus(d.id, "in_progress")} style={{ ...makeBtn("accent", "sm"), fontSize: 12 }}>
                            Démarrer
                          </button>
                        )}
                        {d.status === "in_progress" && (
                          <>
                            <button onClick={() => handleStatus(d.id, "delivered")} style={{ ...makeBtn("primary", "sm"), fontSize: 12 }}>
                              Marquer livré
                            </button>
                            <button
                              onClick={() => handleGPS(d.id)}
                              disabled={gpsLoading === d.id}
                              style={{ ...makeBtn("ghost", "sm"), fontSize: 12, opacity: gpsLoading === d.id ? 0.7 : 1 }}
                            >
                              {gpsLoading === d.id ? "GPS…" : "📍 Ma position"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════ TAB : HISTORIQUE ════ */}
      {!loading && tab === "historique" && (
        <div>
          <h2 style={{ fontSize: font.size.xl, fontWeight: font.weight.bold, color: colors.gray800, margin: "0 0 12px" }}>
            Livraisons effectuées ({myHistory.length})
          </h2>

          {myHistory.length === 0 ? (
            <Card style={{ padding: "48px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📦</div>
              <p style={{ color: colors.gray400, margin: 0 }}>Aucune livraison effectuée pour le moment.</p>
            </Card>
          ) : (
            <Card>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Produit</Th>
                    <Th>Client</Th>
                    <Th>Quantité</Th>
                    <Th>Date de livraison</Th>
                    <Th>Statut</Th>
                  </tr>
                </thead>
                <tbody>
                  {myHistory.map((d) => (
                    <tr key={d.id}
                      onMouseEnter={(e) => e.currentTarget.style.background = colors.gray50}
                      onMouseLeave={(e) => e.currentTarget.style.background = ""}>
                      <Td style={{ color: colors.gray400, fontSize: 12 }}>#{d.id}</Td>
                      <Td style={{ fontWeight: 600 }}>{d.product_name}</Td>
                      <Td>{d.client_name}</Td>
                      <Td>{d.quantity}</Td>
                      <Td style={{ fontSize: 12, color: colors.gray500 }}>
                        {d.updated_at ? new Date(d.updated_at).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" }) : "—"}
                      </Td>
                      <Td>
                        <span style={{ ...makeBadge("green"), fontSize: 11 }}>Livrée ✓</span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
