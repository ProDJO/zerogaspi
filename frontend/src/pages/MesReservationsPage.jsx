import { useEffect, useState } from "react";
import { useAuth } from "../useAuth.jsx";

function MesReservations() {
  const { token } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Charger les réservations
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/reservations/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur de chargement");

      const data = await res.json();
      setReservations(data);
    } catch (err) {
      console.error("Erreur chargement réservations :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReservations();
    }
  }, [token]);

  // Annuler une réservation
  const handleCancel = async (id) => {
    setMessage("");
    try {
      const res = await fetch(`http://localhost:5000/reservations/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur lors de l'annulation");

      setMessage("✅ Réservation annulée");
      fetchReservations();
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div>
      {message && (
        <p style={{
          padding: "10px",
          background: message.startsWith("✅") ? "#d4edda" : "#f8d7da",
          color: message.startsWith("✅") ? "#155724" : "#721c24",
          borderRadius: "5px",
          marginBottom: "15px",
        }}>
          {message}
        </p>
      )}

      {loading && <p>Chargement...</p>}

      {!loading && reservations.length === 0 && (
        <p>Aucune réservation pour le moment.</p>
      )}

      {!loading && reservations.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={th}>Produit</th>
              <th style={th}>Quantité</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.name}</td>
                <td style={td}>{r.quantity}</td>
                <td style={td}>
                  <button
                    onClick={() => handleCancel(r.id)}
                    style={cancelButtonStyle}
                  >
                    Annuler
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { padding: "10px", textAlign: "left", borderBottom: "1px solid #ccc" };
const td = { padding: "10px", borderBottom: "1px solid #eee" };
const cancelButtonStyle = {
  padding: "5px 10px",
  background: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default MesReservations;