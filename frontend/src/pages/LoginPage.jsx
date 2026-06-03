import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../useAuth.jsx";
import { colors, radius, font, shadow, makeBtn, makeInput } from "../theme.js";

const rules = {
  email:    (v) => !v.trim() ? "L'email est requis" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Adresse email invalide" : "",
  password: (v) => !v ? "Le mot de passe est requis" : "",
};

export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [values,   setValues]   = useState({ email: "", password: "" });
  const [touched,  setTouched]  = useState({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);

  const err = (f) => touched[f] ? rules[f](values[f]) : "";
  const onChange = (f) => (e) => setValues((p) => ({ ...p, [f]: e.target.value }));
  const onBlur   = (f) => () => setTouched((p) => ({ ...p, [f]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setTouched({ email: true, password: true });
    if (Object.keys(rules).some((f) => rules[f](values[f]))) return;
    setLoading(true);
    try { await login(values.email, values.password); navigate("/"); }
    catch (e) { setApiError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>

      {/* ── Panneau gauche : brand ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 60%, ${colors.primaryMid} 100%)`,
        padding: 48, color: colors.white,
      }}>
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🌿</div>
          <h1 style={{ fontSize: 36, fontWeight: font.weight.extrabold, color: colors.white, marginBottom: 12, lineHeight: 1.1 }}>
            ZeroGaspi
          </h1>
          <p style={{ fontSize: font.size.lg, color: "rgba(255,255,255,.85)", lineHeight: 1.7, marginBottom: 32 }}>
            Réservez des produits frais à prix réduit et contribuez à la lutte contre le gaspillage alimentaire.
          </p>

          {/* Stats / features */}
          {[
            { icon: "🛒", text: "Des centaines de produits frais" },
            { icon: "💚", text: "Anti-gaspillage alimentaire" },
            { icon: "🚚", text: "Livraison rapide et fiable" },
          ].map((f) => (
            <div key={f.text} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(255,255,255,.12)", borderRadius: radius.lg,
              padding: "12px 16px", marginBottom: 10, textAlign: "left",
            }}>
              <span style={{ fontSize: 22 }}>{f.icon}</span>
              <span style={{ fontSize: font.size.base, color: "rgba(255,255,255,.9)" }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panneau droit : form ── */}
      <div style={{
        width: 480, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px 56px", background: colors.white,
        boxShadow: `-8px 0 32px rgba(0,0,0,.06)`,
      }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: font.size["3xl"], fontWeight: font.weight.bold, color: colors.gray900, marginBottom: 8 }}>
            Bon retour 👋
          </h2>
          <p style={{ color: colors.gray500, fontSize: font.size.base }}>
            Connectez-vous à votre compte ZeroGaspi.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <Field label="Adresse email" error={err("email")}>
            <input type="email" placeholder="ahmed@email.com" value={values.email}
              onChange={onChange("email")} onBlur={onBlur("email")}
              style={makeInput(!!err("email"))} />
          </Field>

          <Field label="Mot de passe" error={err("password")}>
            <input type="password" placeholder="••••••••" value={values.password}
              onChange={onChange("password")} onBlur={onBlur("password")}
              style={makeInput(!!err("password"))} />
          </Field>

          {apiError && (
            <div style={{
              padding: "12px 14px", borderRadius: radius.md,
              background: colors.dangerLight, color: colors.dangerDark,
              fontSize: font.size.sm, borderLeft: `3px solid ${colors.danger}`,
            }}>
              ⚠ {apiError}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary"
            style={{ ...makeBtn("primary", "lg"), width: "100%", marginTop: 4 }}>
            {loading ? "Connexion…" : "Se connecter →"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: font.size.sm, color: colors.gray500 }}>
          Pas encore de compte ?{" "}
          <Link to="/register" style={{ color: colors.primary, fontWeight: font.weight.semibold }}>
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontWeight: font.weight.semibold, fontSize: font.size.sm, color: colors.gray700 }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: font.size.xs, color: colors.danger }}>⚠ {error}</span>}
    </div>
  );
}
