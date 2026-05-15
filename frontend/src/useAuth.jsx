import { createContext, useContext, useState } from "react";

// 1. Création du contexte (la "radio")
const AuthContext = createContext(null);

// 2. Le provider : composant qui diffuse les valeurs à toute l'app
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    const res = await fetch("http://localhost:5000/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Identifiants invalides");

    const data = await res.json();
    setToken(data.token);

    // Décoder le payload du JWT pour récupérer { id, role }
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    setUser({ id: payload.id, role: payload.role });

    return data.token;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // 3. On expose les valeurs à tous les enfants
  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 4. Hook personnalisé : raccourci pour lire le contexte
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  }
  return context;
}