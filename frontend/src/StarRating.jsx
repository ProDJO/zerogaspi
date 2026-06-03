import { useState } from "react";

/**
 * Props:
 *   value       number  — current rating (0 = none)
 *   onChange    fn      — if provided, stars are clickable (input mode)
 *   size        number  — font size in px (default 22)
 *   showCount   bool    — show (n avis) label
 *   count       number  — number of reviews
 */
export default function StarRating({ value = 0, onChange, size = 22, showCount = false, count = 0 }) {
  const [hovered, setHovered] = useState(0);
  const interactive = !!onChange;
  const display = interactive ? (hovered || value) : value;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={interactive ? () => onChange(star) : undefined}
          onMouseEnter={interactive ? () => setHovered(star) : undefined}
          onMouseLeave={interactive ? () => setHovered(0)   : undefined}
          style={{
            fontSize: size,
            cursor: interactive ? "pointer" : "default",
            color: star <= display ? "#f59e0b" : "#d1d5db",
            transition: "color .1s",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          ★
        </span>
      ))}
      {showCount && count > 0 && (
        <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 4 }}>
          ({count})
        </span>
      )}
    </span>
  );
}
