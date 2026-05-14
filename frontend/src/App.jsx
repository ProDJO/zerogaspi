import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MesReservationsPage from "./pages/MesReservationsPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <div style={{ padding: "20px" }}>

      {/* Barre de navigation */}
      <nav style={navStyle}>
        <Link to="/" style={linkStyle}>🏠 Accueil</Link>
        <Link to="/login" style={linkStyle}>🔐 Connexion</Link>
        <Link to="/mes-reservations" style={linkStyle}>📋 Mes Réservations</Link>
        <Link to="/admin" style={linkStyle}>🛠️ Admin</Link>
      </nav>

      {/* Zone d'affichage de la page courante */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mes-reservations" element={<MesReservationsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

    </div>
  );
}

// Petit composant pour les URL inconnues
function NotFound() {
  return (
    <div>
      <h1>404 — Page introuvable</h1>
      <p>Cette URL n'existe pas. Retour à <Link to="/">l'accueil</Link>.</p>
    </div>
  );
}

// Styles inline simples (on améliorera plus tard avec du CSS)
const navStyle = {
  display: "flex",
  gap: "20px",
  padding: "15px",
  background: "#f0f0f0",
  borderRadius: "8px",
  marginBottom: "30px"
};

const linkStyle = {
  textDecoration: "none",
  color: "#333",
  fontWeight: "bold"
};

export default App;