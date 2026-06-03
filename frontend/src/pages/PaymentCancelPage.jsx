import { useNavigate } from "react-router-dom";
import { colors, font, makeBtn } from "../theme.js";

export default function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 480, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>↩️</div>
      <h1 style={{ fontSize: font.size["3xl"], fontWeight: font.weight.extrabold, color: colors.gray800, marginBottom: 8 }}>
        Paiement annulé
      </h1>
      <p style={{ color: colors.gray500, fontSize: font.size.lg, marginBottom: 32, lineHeight: 1.7 }}>
        Votre paiement a été annulé. Votre panier est toujours intact — vous pouvez reprendre à tout moment.
      </p>
      <button onClick={() => navigate("/panier")} style={makeBtn("primary", "lg")}>
        ← Retour au panier
      </button>
    </div>
  );
}
