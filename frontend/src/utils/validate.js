// ── Règles de validation atomiques ──
// Chaque règle retourne un message d'erreur (string) ou null si OK.

export const required = (label = "Ce champ") =>
  (v) => (!v && v !== 0) || String(v).trim() === ""
    ? `${label} est requis(e)`
    : null;

export const minLen = (min, label = "Ce champ") =>
  (v) => String(v).trim().length < min
    ? `${label} doit contenir au moins ${min} caractères`
    : null;

export const maxLen = (max, label = "Ce champ") =>
  (v) => String(v).trim().length > max
    ? `${label} ne doit pas dépasser ${max} caractères`
    : null;

export const isEmail = () =>
  (v) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())
    ? "Adresse email invalide"
    : null;

export const isPositive = (label = "Le prix") =>
  (v) => isNaN(Number(v)) || Number(v) <= 0
    ? `${label} doit être supérieur à 0`
    : null;

export const isNonNegative = (label = "La quantité") =>
  (v) => isNaN(Number(v)) || Number(v) < 0
    ? `${label} doit être un nombre positif ou nul`
    : null;

export const isInteger = (label = "La quantité") =>
  (v) => !Number.isInteger(Number(v))
    ? `${label} doit être un nombre entier`
    : null;

export const isImageFile = () =>
  (file) => {
    if (!file) return null;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type))
      return "Format accepté : JPEG, PNG ou WebP";
    if (file.size > 5 * 1024 * 1024)
      return "Taille maximum : 5 Mo";
    return null;
  };

// ── Fonction principale ──
// validateForm({ name: [value, rule1, rule2, ...], ... })
// Retourne un objet { field: "message" } pour chaque champ en erreur.
export function validateForm(fields) {
  const errors = {};
  for (const [key, [value, ...rules]] of Object.entries(fields)) {
    for (const rule of rules) {
      const msg = rule(value);
      if (msg) { errors[key] = msg; break; }
    }
  }
  return errors;
}

// ── Style inline pour un input en erreur / normal ──
export function inputBorder(errors, field, base = "#ccc") {
  return errors[field] ? "#dc3545" : base;
}
