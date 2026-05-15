import { useEffect, useState } from "react";
import { useAuth } from "../useAuth.jsx";

function HomePage() {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Charger les produits au montage de la page
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Erreur chargement produits :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Réserver un produit
  const handleReserve = async (productId) => {
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      await res.json();
      setMessage(`✅ Réservation confirmée pour le produit #${productId}`);

      // Recharger la liste pour voir le stock à jour
      fetchProducts();
    } catch (err) {
      setMessage(`❌ Erreur : ${err.message}`);
    }
  };

  return (
    <div>
      <h1>🏠 Produits disponibles</h1>

      {/* Feedback réservation */}
      {message && (
        <p style={{
          padding: "10px",
          background: message.startsWith("✅") ? "#d4edda" : "#f8d7da",
          color: message.startsWith("✅") ? "#155724" : "#721c24",
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          {message}
        </p>
      )}

      {/* État de chargement */}
      {loading && <p>Chargement...</p>}

      {/* Aucun produit */}
      {!loading && products.length === 0 && (
        <p>Aucun produit disponible pour le moment.</p>
      )}

      {/* Liste des produits */}
      {!loading && products.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {products.map((p) => (
            <div key={p.id} style={cardStyle}>
              {p.image && (
                <img
                  src={`http://localhost:5000${p.image}`}
                  alt={p.name}
                  style={{ width: "100%", borderRadius: "5px" }}
                />
              )}
              <h3>{p.name}</h3>
              <p>Prix : {p.price} DT</p>
              <p>Stock : {p.quantity}</p>

              <button
                onClick={() => handleReserve(p.id)}
                disabled={!token || p.quantity === 0}
                style={{
                  ...buttonStyle,
                  cursor: token && p.quantity > 0 ? "pointer" : "not-allowed",
                  opacity: token && p.quantity > 0 ? 1 : 0.5,
                }}
              >
                {!token
                  ? "🔐 Connectez-vous pour réserver"
                  : p.quantity === 0
                  ? "Rupture de stock"
                  : "Réserver"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ddd",
  padding: "15px",
  borderRadius: "10px",
  background: "white",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const buttonStyle = {
  marginTop: "10px",
  padding: "10px",
  width: "100%",
  background: "#28a745",
  color: "white",
  border: "none",
  borderRadius: "5px",
  fontSize: "14px",
};

export default HomePage;