import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix leaflet's default marker icons (broken with bundlers)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Captures clicks on the map and moves the marker
function ClickHandler({ onSelect }) {
  useMapEvents({ click: (e) => onSelect(e.latlng) });
  return null;
}

/**
 * Props:
 *   position   { lat, lng } | null  — current marker position
 *   onSelect   ({ lat, lng }) => void
 *   onConfirm  () => void
 *   onCancel   () => void
 */
export default function MapPicker({ position, onSelect, onConfirm, onCancel }) {
  // Default center: Tunis
  const center = position
    ? [position.lat, position.lng]
    : [36.8065, 10.1815];

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3 style={{ margin: "0 0 10px", fontSize: 16 }}>
          Choisissez votre adresse de livraison
        </h3>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#555" }}>
          Cliquez sur la carte pour placer le point de livraison.
        </p>

        <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #ddd" }}>
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: 380, width: "100%" }}
            key={position ? "has-pos" : "no-pos"}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onSelect={onSelect} />
            {position && (
              <Marker position={[position.lat, position.lng]} />
            )}
          </MapContainer>
        </div>

        {position && (
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#28a745" }}>
            Position sélectionnée : {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </p>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={btnGray}>Annuler</button>
          <button
            onClick={onConfirm}
            disabled={!position}
            style={position ? btnGreen : btnDisabled}
          >
            Confirmer la localisation
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 9999,
};

const modal = {
  background: "#fff",
  borderRadius: 10,
  padding: 24,
  width: "min(600px, 95vw)",
  boxShadow: "0 8px 32px rgba(0,0,0,.25)",
};

const btnGreen    = { padding: "8px 18px", background: "#28a745", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 600 };
const btnGray     = { padding: "8px 18px", background: "#6c757d", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" };
const btnDisabled = { padding: "8px 18px", background: "#ccc",    color: "#fff", border: "none", borderRadius: 5, cursor: "not-allowed", fontWeight: 600 };
