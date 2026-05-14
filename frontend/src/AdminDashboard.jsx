import { useState } from "react";

function AdminDashboard({ token, products, onProductAdded }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  // Créer un produit
  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("quantity", quantity);
    if (image) formData.append("image", image);
    try {
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

      setMessage("Produit créé avec succès !");
      setName("");
      setDescription("");
      setPrice("");
      setQuantity("");
      setImage(null);
      onProductAdded();
    } catch (err) {
      setMessage(`Erreur : ${err.message}`);
    }
  };

  // Supprimer un produit
  const handleDelete = async (productId) => {
    setMessage("");
    try {
      const res = await fetch(`http://localhost:5000/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erreur suppression");

      setMessage("Produit supprimé !");
      onProductAdded();
    } catch (err) {
      setMessage(`Erreur : ${err.message}`);
    }
  };

  return (
    <div style={{ marginTop: "40px", borderTop: "2px solid #ccc", paddingTop: "20px" }}>
      <h2>🛠️ Dashboard Admin</h2>

      {/* Message feedback */}
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

      {/* Formulaire création produit */}
      <form onSubmit={handleCreate} style={{ marginBottom: "30px" }}>
        <h3>Ajouter un produit</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px" }}>
          <input
            placeholder="Nom"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <input
            placeholder="Prix"
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
          />
          <input
            placeholder="Quantité"
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files[0])}
          />
          <button type="submit">Créer le produit</button>
        </div>
      </form>

      {/* Liste produits avec bouton supprimer */}
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
          {products.map(p => (
            <tr key={p.id}>
              <td style={td}>{p.name}</td>
              <td style={td}>{p.price}</td>
              <td style={td}>{p.quantity}</td>
              <td style={td}>
                <button
                  onClick={() => handleDelete(p.id)}
                  style={{ color: "red", cursor: "pointer" }}
                >
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

export default AdminDashboard;