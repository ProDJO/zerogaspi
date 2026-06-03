import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { colors, radius, font, makeBtn, makeInput } from "../theme.js";

const rules = {
  name:     (v) => !v.trim() ? "Le nom est requis" : v.trim().length < 2 ? "Minimum 2 caractères" : v.trim().length > 50 ? "Maximum 50 caractères" : "",
  email:    (v) => !v.trim() ? "L'email est requis" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Adresse email invalide" : "",
  password: (v) => !v ? "Le mot de passe est requis" : v.length < 6 ? "Minimum 6 caractères" : "",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [values,   setValues]   = useState({ name: "", email: "", password: "" });
  const [touched,  setTouched]  = useState({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);

  const err = (f) => touched[f] ? rules[f](values[f]) : "";
  const onChange = (f) => (e) => setValues((p) => ({ ...p, [f]: e.target.value }));
  const onBlur   = (f) => () => setTouched((p) => ({ ...p, [f]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setTouched({ name: true, email: true, password: true });
    if (Object.keys(rules).some((f) => rules[f](values[f]))) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/users", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error(await res.text());
      navigate("/login");
    } catch (e) { setApiError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>

      {/* ── Panneau gauche : form ── */}
      <div style={{
        width: 520, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "48px 56px", background: colors.white,
        boxShadow: `8px 0 32px rgba(0,0,0,.06)`,
      }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: font.size["3xl"], fontWeight: font.weight.bold, color: colors.gray900, marginBottom: 8 }}>
            Rejoignez-nous 🌿
          </h2>
          <p style={{ color: colors.gray500, fontSize: font.size.base }}>
            Créez votre compte et commencez à réserver des produits frais.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          <Field label="Nom complet" error={err("name")}>
            <input type="text" placeholder="Ahmed Ben Ali" value={values.name}
              onChange={onChange("name")} onBlur={onBlur("name")}
              style={makeInput(!!err("name"))} />
          </Field>

          <Field label="Adresse email" error={err("email")}>
            <input type="email" placeholder="ahmed@email.com" value={values.email}
              onChange={onChange("email")} onBlur={onBlur("email")}
              style={makeInput(!!err("email"))} />
          </Field>

          <Field label="Mot de passe" error={err("password")} hint="Minimum 6 caractères">
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
            {loading ? "Création…" : "Créer mon compte →"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", fontSize: font.size.sm, color: colors.gray500 }}>
          Déjà un compte ?{" "}
          <Link to="/login" style={{ color: colors.primary, fontWeight: font.weight.semibold }}>
            Se connecter
          </Link>
        </p>
      </div>

      {/* ── Panneau droit : brand ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.primary} 100%)`,
        padding: 48, color: colors.white,
      }}>
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>♻️</div>
          <h2 style={{ fontSize: 30, fontWeight: font.weight.extrabold, color: colors.white, marginBottom: 12 }}>
            Ensemble contre le gaspillage
          </h2>
          <p style={{ fontSize: font.size.lg, color: "rgba(255,255,255,.85)", lineHeight: 1.7, marginBottom: 32 }}>
            Rejoignez notre communauté de consommateurs responsables et faites la différence chaque jour.
          </p>

          {[
            { icon: "✅", text: "Inscription gratuite et rapide" },
            { icon: "🔒", text: "Données sécurisées" },
            { icon: "🌍", text: "Impact environnemental positif" },
          ].map((f) => (
            <div key={f.text} style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "rgba(255,255,255,.15)", borderRadius: radius.lg,
              padding: "12px 16px", marginBottom: 10, textAlign: "left",
            }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ fontSize: font.size.base, color: "rgba(255,255,255,.9)" }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontWeight: font.weight.semibold, fontSize: font.size.sm, color: colors.gray700 }}>
        {label}
      </label>
      {children}
      {error
        ? <span style={{ fontSize: font.size.xs, color: colors.danger }}>⚠ {error}</span>
        : hint && <span style={{ fontSize: font.size.xs, color: colors.gray400 }}>{hint}</span>}
    </div>
  );
}
