import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import MesReservations from "./MesReservations";
import AdminDashboard from "./AdminDashboard";

function App() {
  const { token, user, login, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

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
    } catch (err) {
      setMessage(`❌ Erreur : ${err.message}`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      {/* Zone login / logout */}
      {!token ? (
        <form onSubmit={handleLogin} style={{ marginBottom: "20px" }}>
          <h2>Connexion</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />{" "}
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />{" "}
          <button type="submit">Se connecter</button>
        </form>
      ) : (
        <div style={{ marginBottom: "20px" }}>
          ✅ Connecté (role: {user.role}){" "}
          <button onClick={logout}>Se déconnecter</button>
        </div>
      )}

      {/* Message feedback réservation */}
      {message && (
        <p style={{
          padding: "10px",
          background: message.startsWith("✅") ? "#d4edda" : "#f8d7da",
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          {message}
        </p>
      )}

      {/* Liste des produits */}
      <h1>Produits</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {products.map(p => (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "10px" }}>
            {p.image && <img src={p.image} width="100%" />}
            <h3>{p.name}</h3>
            <p>{p.price}</p>
            <button
              onClick={() => handleReserve(p.id)}
              disabled={!token}
              style={{
                marginTop: "10px",
                cursor: token ? "pointer" : "not-allowed",
                opacity: token ? 1 : 0.5
              }}
            >
              {token ? "Réserver" : "Connectez-vous pour réserver"}
            </button>
          </div>
        ))}
      </div>

      {/* Mes réservations */}
      {token && <MesReservations token={token} />}

      {/* ✅ Dashboard Admin */}
      {token && user.role === "admin" && (
        <AdminDashboard
          token={token}
          products={products}
          onProductAdded={() => {
            fetch("http://localhost:5000/products")
              .then(res => res.json())
              .then(data => setProducts(data));
          }}
        />
      )}

    </div>  
  );
}

export default App;