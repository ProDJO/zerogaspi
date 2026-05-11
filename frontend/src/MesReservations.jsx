import { useEffect, useState } from "react";

function MesReservations({ token }) {
  const [reservations, setReservations] = useState([]);
  const [message, setMessage] = useState("");

  // Charger les réservations au montage du composant
  const fetchReservations = async () => {
    const res = await fetch("http://localhost:5000/reservations/me", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setReservations(data);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Annuler une réservation
  const handleCancel = async (id) => {
    setMessage("");
    const res = await fetch(`http://localhost:5000/reservations/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setMessage("✅ Réservation annulée");
      fetchReservations(); // rafraîchir la liste
    } else {
      setMessage("❌ Erreur lors de l'annulation");
    }
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <h2>Mes Réservations</h2>

      {message && (
        <p style={{
          padding: "10px",
          background: message.startsWith("✅") ? "#d4edda" : "#f8d7da",
          borderRadius: "5px",
          marginBottom: "10px"
        }}>
          {message}
        </p>
      )}

      {reservations.length === 0 ? (
        <p>Aucune réservation pour le moment.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={th}>Produit</th>
              <th style={th}>Quantité</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id}>
                <td style={td}>{r.name}</td>
                <td style={td}>{r.quantity}</td>
                <td style={td}>
                  <button
                    onClick={() => handleCancel(r.id)}
                    style={{ color: "red", cursor: "pointer" }}
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

// Styles inline simples
const th = { padding: "10px", textAlign: "left", borderBottom: "1px solid #ccc" };
const td = { padding: "10px", borderBottom: "1px solid #eee" };

export default MesReservations;