import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth.jsx";

/**
 * requiredRole : string OU tableau de strings
 * Ex: requiredRole="admin"  ou  requiredRole={["admin", "livreur"]}
 */
function ProtectedRoute({ children, requiredRole }) {
  const { token, user } = useAuth();

  // Cas 1 : utilisateur non connecté → redirige vers /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Cas 2 : utilisateur connecté mais rôle non autorisé → page d'accès refusé
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowed.includes(user?.role)) {
      return (
        <div>
          <h1>🚫 Accès refusé</h1>
          <p>Vous n'avez pas les droits pour accéder à cette page.</p>
          <p>Rôle(s) requis : <strong>{allowed.join(" ou ")}</strong> — votre rôle : <strong>{user?.role}</strong></p>
        </div>
      );
    }
  }

  // Cas 3 : tout est OK, on affiche le contenu protégé
  return children;
}

export default ProtectedRoute;