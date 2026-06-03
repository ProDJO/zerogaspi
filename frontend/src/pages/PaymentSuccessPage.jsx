import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../useAuth.jsx";
import { useCart } from "../CartContext.jsx";
import { colors, font, makeBtn } from "../theme.js";

export default function PaymentSuccessPage() {
  const [params]      = useSearchParams();
  const { token }     = useAuth();
  const { clearCart } = useCart();
  const navigate      = useNavigate();

  const [status,  setStatus]  = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const paymentId = params.get("payment_id");
    if (!paymentId || !token) {
      setStatus("error");
      setMessage("Paramètre payment_id manquant.");
      return;
    }

    fetch("http://localhost:5000/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ payment_id: paymentId }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(() => {
        clearCart();
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message);
      });
  }, [token]);

  return (
    <div style={{ maxWidth: 520, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      {status === "loading" && (
        <>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⏳</div>
          <h2 style={{ color: colors.gray800 }}>Vérification du paiement…</h2>
          <p style={{ color: colors.gray500 }}>Merci de patienter quelques secondes.</p>
        </>
      )}

      {status === "success" && (
        <>
          <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
          <h1 style={{ fontSize: font.size["4xl"], fontWeight: font.weight.extrabold, color: colors.primary, marginBottom: 8 }}>
            Paiement confirmé !
          </h1>
          <p style={{ color: colors.gray600, fontSize: font.size.lg, marginBottom: 32, lineHeight: 1.7 }}>
            Vos réservations ont été créées. Vous pouvez maintenant demander la livraison depuis votre espace.
          </p>
          <button onClick={() => navigate("/mes-reservations")} style={makeBtn("primary", "lg")}>
            Voir mes réservations →
          </button>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
          <h2 style={{ color: colors.dangerDark, marginBottom: 8 }}>Une erreur est survenue</h2>
          <p style={{ color: colors.gray500, marginBottom: 28 }}>{message}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => navigate("/panier")} style={makeBtn("ghost", "md")}>
              ← Retour au panier
            </button>
            <button onClick={() => navigate("/mes-reservations")} style={makeBtn("primary", "md")}>
              Mes réservations
            </button>
          </div>
        </>
      )}
    </div>
  );
}
