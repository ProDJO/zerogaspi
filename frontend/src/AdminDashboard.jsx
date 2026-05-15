import { useEffect, useState } from "react";
import { useAuth } from "./useAuth.jsx";

function AdminDashboard() {
  const { token } = useAuth();

  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  // Charger les produits
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Erreur chargement produits :", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Créer un produit
  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("quantity", quantity);
      if (image) formData.append("image", image);

      const res = await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      setMessage("✅ Produit créé");
      setName(""); setDescription(""); setPrice(""); setQuantity(""); setImage(null);
      fetchProducts();
    } catch (err) {
      setMessage(`❌ Erreur : ${err.message}`);
    }
  };

  // Supprimer un produit
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;

    try {
      const res = await fetch(`http://localhost:5000/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erreur suppression");

      setMessage("✅ Produit supprimé");
      fetchProducts();
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div>
      {/* Message feedback */}
      {message && (
        <p style={{
          padding: "10px",
          background: message.startsWith("✅") ? "#d4edda" : "#f8d7da",
          color: message.startsWith("✅") ? "#155724" : "#721c24",
          borderRadius: "5px",
          marginBottom: "20px",
        }}>
          {message}
        </p>
      )}

      {/* Formulaire création produit */}
      <h3>Ajouter un produit</h3>
      <form onSubmit={handleCreate} style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
          <input placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} required />
          <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input placeholder="Prix" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
          <input placeholder="Quantité" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          <button type="submit">Créer le produit</button>
        </div>
      </form>

      {/* Liste produits */}
      <h3>Gérer les produits</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={th}>Nom</th>
            <th style={th}>Prix</th>
            <th style={th}>Quantité</th>
            <th style={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td style={td}>{p.name}</td>
              <td style={td}>{p.price}</td>
              <td style={td}>{p.quantity}</td>
              <td style={td}>
                <button onClick={() => handleDelete(p.id)} style={deleteButtonStyle}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { padding: "10px", textAlign: "left", borderBottom: "1px solid #ccc" };
const td = { padding: "10px", borderBottom: "1px solid #eee" };
const deleteButtonStyle = {
  padding: "5px 10px",
  background: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default AdminDashboard;