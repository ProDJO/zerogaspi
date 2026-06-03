// ══════════════════════════════════════════════
//  ZeroGaspi Design System — Theme Factory
// ══════════════════════════════════════════════

// ── Palette ──
export const colors = {
  // Brand — Fresh green (anti-gaspillage)
  primary:      "#16a34a",
  primaryDark:  "#15803d",
  primaryLight: "#dcfce7",
  primaryMid:   "#22c55e",

  // Accent — Warm amber
  accent:       "#f59e0b",
  accentLight:  "#fef3c7",
  accentDark:   "#d97706",

  // Semantic
  danger:       "#ef4444",
  dangerLight:  "#fee2e2",
  dangerDark:   "#dc2626",
  warning:      "#f59e0b",
  warningLight: "#fef3c7",
  info:         "#3b82f6",
  infoLight:    "#dbeafe",
  success:      "#16a34a",
  successLight: "#dcfce7",

  // Neutrals
  white:   "#ffffff",
  gray50:  "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",

  // Backoffice — Slate dark
  bo900: "#0f172a",
  bo800: "#1e293b",
  bo700: "#334155",
  bo600: "#475569",
  boAccent:  "#3b82f6",
  boAccentL: "#60a5fa",
  boText:    "#f1f5f9",
  boMuted:   "#94a3b8",
  boBorder:  "#334155",
};

// ── Shadows ──
export const shadow = {
  xs:  "0 1px 2px rgba(0,0,0,.05)",
  sm:  "0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)",
  md:  "0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.06)",
  lg:  "0 10px 15px rgba(0,0,0,.08), 0 4px 6px rgba(0,0,0,.05)",
  xl:  "0 20px 25px rgba(0,0,0,.1),  0 10px 10px rgba(0,0,0,.04)",
  card:"0 2px 8px rgba(0,0,0,.08)",
  nav: "0 1px 4px rgba(0,0,0,.08)",
};

// ── Border radius ──
export const radius = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  "2xl":20,
  full: 9999,
};

// ── Typography ──
export const font = {
  family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  size: { xs:11, sm:12, base:14, md:15, lg:16, xl:18, "2xl":20, "3xl":24, "4xl":28, "5xl":32 },
  weight: { normal:400, medium:500, semibold:600, bold:700, extrabold:800 },
  line: { tight:1.25, normal:1.5, relaxed:1.75 },
};

// ── Spacing ──
export const space = { 1:4, 2:8, 3:12, 4:16, 5:20, 6:24, 8:32, 10:40, 12:48 };

// ══════════════════════════════════════════════
//  Component style factories
// ══════════════════════════════════════════════

// ── Buttons ──
export const btn = {
  base: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 6, fontFamily: font.family, fontWeight: font.weight.semibold,
    fontSize: font.size.base, lineHeight: 1, cursor: "pointer",
    border: "none", transition: "all .15s ease",
  },
  sizes: {
    sm:  { padding: "7px 14px",  fontSize: font.size.sm,  borderRadius: radius.md },
    md:  { padding: "10px 20px", fontSize: font.size.base, borderRadius: radius.md },
    lg:  { padding: "13px 26px", fontSize: font.size.md,  borderRadius: radius.lg },
    xl:  { padding: "15px 32px", fontSize: font.size.lg,  borderRadius: radius.lg },
  },
  variants: {
    primary:   { background: colors.primary,  color: colors.white,   boxShadow: `0 1px 3px rgba(22,163,74,.4)` },
    secondary: { background: colors.gray100,  color: colors.gray700, border: `1px solid ${colors.gray200}` },
    danger:    { background: colors.danger,   color: colors.white,   boxShadow: `0 1px 3px rgba(239,68,68,.4)` },
    ghost:     { background: "transparent",   color: colors.gray600, border: `1px solid ${colors.gray300}` },
    accent:    { background: colors.accent,   color: colors.white,   boxShadow: `0 1px 3px rgba(245,158,11,.4)` },
    success:   { background: colors.success,  color: colors.white },
    outline:   { background: "transparent",   color: colors.primary, border: `1.5px solid ${colors.primary}` },
    // Backoffice variants
    boBlue:    { background: colors.boAccent, color: colors.white },
    boGhost:   { background: "transparent",   color: colors.boMuted, border: `1px solid ${colors.bo700}` },
  },
};

// ── Compose a button style ──
export function makeBtn(variant = "primary", size = "md", extra = {}) {
  return { ...btn.base, ...btn.sizes[size], ...btn.variants[variant], ...extra };
}

// ── Input ──
export function makeInput(hasError = false, extra = {}) {
  return {
    fontFamily: font.family,
    fontSize: font.size.base,
    padding: "10px 14px",
    borderRadius: radius.md,
    border: `1.5px solid ${hasError ? colors.danger : colors.gray300}`,
    outline: "none",
    background: colors.white,
    color: colors.gray900,
    boxShadow: hasError ? `0 0 0 3px rgba(239,68,68,.12)` : "none",
    transition: "border-color .15s, box-shadow .15s",
    width: "100%",
    boxSizing: "border-box",
    ...extra,
  };
}

// ── Card ──
export function makeCard(extra = {}) {
  return {
    background: colors.white,
    borderRadius: radius.xl,
    boxShadow: shadow.card,
    border: `1px solid ${colors.gray100}`,
    overflow: "hidden",
    ...extra,
  };
}

// ── Badge ──
export function makeBadge(color = "gray", extra = {}) {
  const map = {
    green:  { bg: colors.primaryLight, text: colors.primaryDark },
    red:    { bg: colors.dangerLight,  text: colors.dangerDark  },
    orange: { bg: colors.accentLight,  text: colors.accentDark  },
    blue:   { bg: colors.infoLight,    text: "#1d4ed8"          },
    gray:   { bg: colors.gray100,      text: colors.gray600     },
  };
  const { bg, text } = map[color] || map.gray;
  return {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: radius.full,
    fontSize: font.size.xs, fontWeight: font.weight.semibold,
    background: bg, color: text, ...extra,
  };
}

// ── Table ──
export const table = {
  wrapper: { width: "100%", borderCollapse: "collapse", borderSpacing: 0 },
  th: {
    padding: "12px 16px", textAlign: "left",
    fontSize: font.size.xs, fontWeight: font.weight.semibold,
    color: colors.gray500, textTransform: "uppercase", letterSpacing: "0.05em",
    background: colors.gray50, borderBottom: `1px solid ${colors.gray200}`,
  },
  td: {
    padding: "14px 16px", fontSize: font.size.base, color: colors.gray700,
    borderBottom: `1px solid ${colors.gray100}`, verticalAlign: "middle",
  },
};

// ── Alert / Feedback ──
export function makeAlert(type = "success") {
  const map = {
    success: { bg: colors.primaryLight, color: colors.primaryDark, border: colors.primary },
    error:   { bg: colors.dangerLight,  color: colors.dangerDark,  border: colors.danger  },
    warning: { bg: colors.accentLight,  color: colors.accentDark,  border: colors.accent  },
    info:    { bg: colors.infoLight,    color: "#1d4ed8",          border: colors.info    },
  };
  const { bg, color, border } = map[type] || map.info;
  return {
    padding: "12px 16px", borderRadius: radius.md,
    background: bg, color, fontSize: font.size.base,
    borderLeft: `4px solid ${border}`, marginBottom: 16,
  };
}

// ── Role colors ──
export const roleColor = {
  admin:   colors.danger,
  vendeur: colors.info,
  livreur: colors.accent,
  client:  colors.primary,
};

// ── Status badges for reservations / deliveries ──
export const statusBadge = {
  // Reservations
  pending:   { color: "orange", label: "En attente" },
  confirmed: { color: "blue",   label: "Confirmée"  },
  cancelled: { color: "red",    label: "Annulée"    },
  delivered: { color: "green",  label: "Livrée"     },
  // Deliveries
  accepted:    { color: "blue",   label: "Acceptée"   },
  in_progress: { color: "orange", label: "En cours"   },
  // Products
  approved:  { color: "green",  label: "Approuvé"   },
  rejected:  { color: "red",    label: "Refusé"     },
};
