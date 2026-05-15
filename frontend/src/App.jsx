import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./useAuth.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MesReservationsPage from "./pages/MesReservationsPage";
import AdminPage from "./pages/AdminPage";

function App() {
  const { token, user, logout } = useAuth();

  return (
    <div style={{ padding: "20px" }}>

      {/* Barre de navigation */}
      <nav style={navStyle}>
        <Link to="/" style={linkStyle}>🏠 Accueil</Link>

        {!token && (
          <Link to="/login" style={linkStyle}>🔐 Connexion</Link>
        )}

        {token && (
          <>
            <Link to="/mes-reservations" style={linkStyle}>📋 Mes Réservations</Link>
            {user?.role === "admin" && (
              <Link to="/admin" style={linkStyle}>🛠️ Admin</Link>
            )}
            <span style={{ marginLeft: "auto", color: "#555" }}>
              Connecté ({user?.role})
            </span>
            <button onClick={logout} style={logoutStyle}>Déconnexion</button>
          </>
        )}
      </nav>

      {/* Zone d'affichage de la page courante */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mes-reservations" element={<MesReservationsPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

    </div>
  );
}

function NotFound() {
  return (
    <div>
      <h1>404 — Page introuvable</h1>
      <p>Cette URL n'existe pas. Retour à <Link to="/">l'accueil</Link>.</p>
    </div>
  );
}

const navStyle = {
  display: "flex",
  gap: "20px",
  alignItems: "center",
  padding: "15px",
  background: "#f0f0f0",
  borderRadius: "8px",
  marginBottom: "30px",
};

const linkStyle = {
  textDecoration: "none",
  color: "#333",
  fontWeight: "bold",
};

const logoutStyle = {
  padding: "5px 12px",
  background: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default App;