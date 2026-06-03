import { useRef, useState, useEffect } from "react";
import { useAuth } from "../useAuth.jsx";
import { useLanguage } from "../LanguageContext.jsx";
import { isImageFile } from "../utils/validate.js";
import { colors, font, radius, shadow, makeBtn } from "../theme.js";

const ROLE_COLOR = {
  admin: colors.danger, vendeur: colors.info,
  livreur: colors.accent, client: colors.primary,
};

function Section({ title, icon, children }) {
  return (
    <div style={{
      background: colors.white, borderRadius: radius.xl,
      border: `1px solid ${colors.gray200}`,
      boxShadow: shadow.sm,
      marginBottom: 16, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${colors.gray100}`, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontWeight: font.weight.bold, fontSize: font.size.lg, color: colors.gray900 }}>{title}</span>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function Feedback({ msg }) {
  if (!msg) return null;
  const ok = msg.startsWith("✅");
  return (
    <p style={{
      margin: "12px 0 0", padding: "10px 14px", borderRadius: radius.md,
      background: ok ? colors.primaryLight : colors.dangerLight,
      color: ok ? colors.primaryDark : colors.dangerDark,
      borderLeft: `3px solid ${ok ? colors.primary : colors.danger}`,
      fontSize: font.size.sm,
    }}>{msg}</p>
  );
}

const inp = {
  padding: "10px 12px", fontSize: font.size.base, borderRadius: radius.md,
  border: `1.5px solid ${colors.gray200}`, outline: "none",
  fontFamily: font.family, width: "100%", boxSizing: "border-box",
  transition: "border-color .15s",
};

export default function ProfilPage() {
  const { user, token, avatar, updateAvatar } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);

  // ── Avatar ──
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarMsg,     setAvatarMsg]     = useState("");

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileError = isImageFile()(file);
    if (fileError) { setAvatarMsg(`❌ ${fileError}`); e.target.value = ""; return; }
    setAvatarMsg(""); setAvatarLoading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await fetch("http://localhost:5000/users/avatar", {
        method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      updateAvatar(data.avatar);
      setAvatarMsg("✅ Photo de profil mise à jour");
    } catch (err) { setAvatarMsg(`❌ ${err.message}`); }
    finally { setAvatarLoading(false); }
  };

  // ── Change password ──
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew,     setPwNew]     = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwMsg,     setPwMsg]     = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg("");
    if (pwNew !== pwConfirm) { setPwMsg("❌ Les mots de passe ne correspondent pas"); return; }
    if (pwNew.length < 6) { setPwMsg("❌ Minimum 6 caractères"); return; }
    setPwLoading(true);
    try {
      const res = await fetch("http://localhost:5000/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      });
      if (!res.ok) throw new Error(await res.text());
      setPwMsg("✅ Mot de passe mis à jour");
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } catch (err) { setPwMsg(`❌ ${err.message}`); }
    finally { setPwLoading(false); }
  };

  // ── Default address ──
  const [address,     setAddress]     = useState("");
  const [addrMsg,     setAddrMsg]     = useState("");
  const [addrLoading, setAddrLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.default_address) setAddress(data.default_address); })
      .catch(() => {});
  }, [token]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddrMsg(""); setAddrLoading(true);
    try {
      const res = await fetch("http://localhost:5000/users/default-address", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address }),
      });
      if (!res.ok) throw new Error(await res.text());
      setAddrMsg("✅ Adresse enregistrée");
    } catch (err) { setAddrMsg(`❌ ${err.message}`); }
    finally { setAddrLoading(false); }
  };

  // ── Role request ──
  const [selectedRole, setSelectedRole] = useState("vendeur");
  const [roleMsg,      setRoleMsg]      = useState("");
  const [roleLoading,  setRoleLoading]  = useState(false);

  const handleRequestRole = async (e) => {
    e.preventDefault(); setRoleMsg(""); setRoleLoading(true);
    try {
      const res = await fetch("http://localhost:5000/users/request-role", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requested_role: selectedRole }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setRoleMsg("✅ Demande envoyée — en attente de validation");
    } catch (err) { setRoleMsg(`❌ ${err.message}`); }
    finally { setRoleLoading(false); }
  };

  const color = ROLE_COLOR[user?.role] || colors.primary;

  return (
    <div style={{ maxWidth: 560, margin: "32px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: font.size["3xl"], fontWeight: font.weight.extrabold, color: colors.gray900, marginBottom: 24 }}>
        Mon profil
      </h1>

      {/* ── Avatar card ── */}
      <Section title="Photo de profil" icon="📷">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 88, height: 88, borderRadius: radius.full,
              overflow: "hidden", border: `3px solid ${color}`,
              background: avatar ? "transparent" : color,
              cursor: "pointer", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 0 4px ${color}22`,
            }}
          >
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ color: "white", fontSize: 34, fontWeight: "bold" }}>{(user?.name?.[0] || "?").toUpperCase()}</span>
            }
          </div>

          <div>
            <p style={{ margin: "0 0 4px", fontWeight: font.weight.bold, fontSize: font.size.xl, color: colors.gray900 }}>
              {user?.name}
            </p>
            <p style={{ margin: "0 0 10px", fontSize: font.size.sm, color: colors.gray500 }}>
              {user?.email}
            </p>
            <span style={{
              display: "inline-block", padding: "3px 12px", borderRadius: radius.full,
              background: color + "22", color, fontWeight: font.weight.bold,
              fontSize: font.size.sm, textTransform: "capitalize",
            }}>
              {user?.role}
            </span>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handleAvatarChange} />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={avatarLoading}
          style={{ ...makeBtn("ghost", "sm"), marginTop: 14 }}
        >
          {avatarLoading ? "Envoi en cours…" : "Changer la photo"}
        </button>
        <Feedback msg={avatarMsg} />
      </Section>

      {/* ── Password ── */}
      <Section title="Mot de passe" icon="🔒">
        <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Mot de passe actuel", val: pwCurrent, set: setPwCurrent },
            { label: "Nouveau mot de passe", val: pwNew,     set: setPwNew     },
            { label: "Confirmer le nouveau", val: pwConfirm, set: setPwConfirm },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label style={{ fontSize: font.size.sm, fontWeight: font.weight.semibold, color: colors.gray700, display: "block", marginBottom: 4 }}>
                {label}
              </label>
              <input
                type="password"
                value={val}
                onChange={(e) => set(e.target.value)}
                style={inp}
                onFocus={(e) => e.target.style.borderColor = colors.primary}
                onBlur={(e)  => e.target.style.borderColor = colors.gray200}
              />
            </div>
          ))}
          <button type="submit" disabled={pwLoading} style={{ ...makeBtn("primary", "sm"), alignSelf: "flex-start" }}>
            {pwLoading ? "Mise à jour…" : "Mettre à jour"}
          </button>
        </form>
        <Feedback msg={pwMsg} />
      </Section>

      {/* ── Default address ── */}
      <Section title="Adresse de livraison par défaut" icon="📍">
        <p style={{ fontSize: font.size.sm, color: colors.gray500, margin: "0 0 12px" }}>
          Cette adresse sera pré-remplie lors de vos prochaines demandes de livraison.
        </p>
        <form onSubmit={handleSaveAddress} style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="ex : 12 rue de la République, Tunis"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ ...inp, flex: 1 }}
            onFocus={(e) => e.target.style.borderColor = colors.primary}
            onBlur={(e)  => e.target.style.borderColor = colors.gray200}
          />
          <button type="submit" disabled={addrLoading} style={{ ...makeBtn("primary", "sm"), whiteSpace: "nowrap" }}>
            {addrLoading ? "…" : "Enregistrer"}
          </button>
        </form>
        <Feedback msg={addrMsg} />
      </Section>

      {/* ── Role request (clients only) ── */}
      {user?.role === "client" && (
        <div id="role-request">
        <Section title="Devenir Vendeur ou Livreur" icon="🚀">
          <div style={{
            background: colors.primaryLight, borderRadius: radius.lg,
            border: `1px solid ${colors.primary}44`,
            padding: "12px 16px", marginBottom: 16,
          }}>
            <p style={{ margin: 0, fontWeight: font.weight.semibold, fontSize: font.size.sm, color: colors.primaryDark }}>
              Comment ça marche ?
            </p>
            <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: font.size.sm, color: colors.primaryDark, lineHeight: 1.7 }}>
              <li>Choisissez le rôle souhaité ci-dessous.</li>
              <li>Envoyez votre demande — elle sera examinée par un administrateur.</li>
              <li>Une fois approuvée, vous accéderez à l'espace correspondant.</li>
            </ul>
          </div>
          <form onSubmit={handleRequestRole} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 20 }}>
              {["vendeur", "livreur"].map((role) => (
                <label key={role} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: font.size.base }}>
                  <input
                    type="radio" value={role}
                    checked={selectedRole === role}
                    onChange={() => setSelectedRole(role)}
                    style={{ accentColor: colors.primary }}
                  />
                  {role === "vendeur" ? "🏪 Vendeur" : "🚚 Livreur"}
                </label>
              ))}
            </div>
            <button type="submit" disabled={roleLoading} style={{ ...makeBtn("primary", "sm"), alignSelf: "flex-start" }}>
              {roleLoading ? "Envoi…" : "Envoyer la demande"}
            </button>
          </form>
          <Feedback msg={roleMsg} />
        </Section>
        </div>
      )}
    </div>
  );
}
