import { useState } from "react";
import { useTheme } from "../ThemeContext.jsx";
import { useLanguage } from "../LanguageContext.jsx";

function ParametresPage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { langue, setLangue, t } = useLanguage();

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush,  setNotifPush]  = useState(false);

  return (
    <div style={{ maxWidth: "560px", margin: "20px auto", textAlign: "left" }}>
      <h1 style={{ marginBottom: "8px" }}>{t("settings_title")}</h1>
      <p style={{ color: "#888", marginBottom: "30px", fontSize: "14px" }}>
        {t("settings_subtitle")}
      </p>

      {/* ── Apparence ── */}
      <Section title={t("settings_appearance")}>
        <SettingRow label={t("settings_darkmode")} description={t("settings_darkmode_desc")}>
          <Toggle checked={darkMode} onChange={toggleDarkMode} />
        </SettingRow>
      </Section>

      {/* ── Notifications ── */}
      <Section title={t("settings_notif")}>
        <SettingRow label={t("settings_notif_email")} description={t("settings_notif_email_desc")}>
          <Toggle checked={notifEmail} onChange={() => setNotifEmail((v) => !v)} />
        </SettingRow>
        <SettingRow label={t("settings_notif_push")} description={t("settings_notif_push_desc")} last>
          <Toggle checked={notifPush} onChange={() => setNotifPush((v) => !v)} />
        </SettingRow>
      </Section>

      {/* ── Langue ── */}
      <Section title={t("settings_langue")}>
        <SettingRow label={t("settings_langue_label")} description={t("settings_langue_desc")} last>
          <select
            value={langue}
            onChange={(e) => setLangue(e.target.value)}
            style={selectStyle}
          >
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
            <option value="ar">🇹🇳 العربية</option>
          </select>
        </SettingRow>
      </Section>

      {/* ── Confidentialité ── */}
      <Section title={t("settings_privacy")}>
        <SettingRow label={t("settings_privacy_data")} description={t("settings_privacy_desc")} last>
          <Toggle checked={true} onChange={() => {}} />
        </SettingRow>
      </Section>

      {/* ── Zone danger ── */}
      <Section title={t("settings_danger")} danger>
        <div style={{ padding: "4px 0" }}>
          <p style={{ fontSize: "14px", color: "#888", marginBottom: "14px" }}>
            {t("settings_danger_desc")}
          </p>
          <button style={dangerBtn} onClick={() => alert("Fonctionnalité à venir.")}>
            {t("settings_delete_btn")}
          </button>
        </div>
      </Section>
    </div>
  );
}

/* ── Composants internes ── */

function Section({ title, children, danger }) {
  return (
    <div style={{
      marginBottom: "24px",
      border: `1px solid ${danger ? "#f5c6cb" : "#dee2e6"}`,
      borderRadius: "10px",
      overflow: "hidden",
    }}>
      <div style={{
        padding: "12px 20px",
        background: danger ? "#fff5f5" : "#f8f9fa",
        borderBottom: `1px solid ${danger ? "#f5c6cb" : "#dee2e6"}`,
        fontWeight: "bold",
        fontSize: "14px",
        color: danger ? "#dc3545" : "#555",
      }}>
        {title}
      </div>
      <div style={{ padding: "4px 20px 12px" }}>{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children, last }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      padding: "14px 0",
      borderBottom: last ? "none" : "1px solid #f0f0f0",
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ margin: "0 0 3px", fontWeight: "600", fontSize: "14px" }}>{label}</p>
        <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{description}</p>
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      style={{
        width: "48px",
        height: "26px",
        borderRadius: "13px",
        border: "none",
        cursor: "pointer",
        background: checked ? "#007bff" : "#ccc",
        position: "relative",
        transition: "background 0.2s",
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: "3px",
        left: checked ? "25px" : "3px",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        transition: "left 0.2s",
        display: "block",
      }} />
    </button>
  );
}

const selectStyle = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px",
  cursor: "pointer",
};

const dangerBtn = {
  padding: "8px 18px",
  background: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "bold",
};

export default ParametresPage;
