import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

/**
 * Lit et valide le token stocké dans localStorage.
 * Retourne { token, user } si valide et non expiré, null sinon.
 */
function parseStoredToken() {
  try {
    const t = localStorage.getItem("token");
    if (!t) return null;

    const payload = JSON.parse(atob(t.split(".")[1]));

    if (Date.now() / 1000 >= payload.exp) {
      localStorage.removeItem("token");
      localStorage.removeItem("avatar");
      return null;
    }

    return { token: t, user: { id: payload.id, role: payload.role } };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("avatar");
    return null;
  }
}

export function AuthProvider({ children }) {
  const stored = parseStoredToken();

  const [token, setToken] = useState(stored?.token ?? null);
  const [user,  setUser]  = useState(stored?.user  ?? null);
  // Avatar stocké en localStorage pour persister entre les rechargements
  const [avatar, setAvatarState] = useState(() => localStorage.getItem("avatar") || null);

  // Récupère le profil complet depuis /users/me (nom, avatar…)
  const fetchMe = async (currentToken) => {
    try {
      const res = await fetch("http://localhost:5000/users/me", {
        headers: { "Authorization": `Bearer ${currentToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();

      // Persister l'avatar en localStorage et dans le state
      if (data.avatar) {
        localStorage.setItem("avatar", data.avatar);
        setAvatarState(data.avatar);
      } else {
        localStorage.removeItem("avatar");
        setAvatarState(null);
      }

      // Enrichir le user avec le nom récupéré depuis la BDD
      setUser((prev) => ({ ...prev, name: data.name }));
    } catch (err) {
      console.error("fetchMe error:", err);
    }
  };

  // Au montage : si token valide, charger le profil
  useEffect(() => {
    if (token) fetchMe(token);
  }, []);

  const login = async (email, password) => {
    const res = await fetch("http://localhost:5000/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Identifiants invalides");

    const data = await res.json();
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    const newUser = { id: payload.id, role: payload.role };

    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(newUser);

    // Charger le profil (nom + avatar) juste après login
    await fetchMe(data.token);

    return data.token;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("avatar");
    setToken(null);
    setUser(null);
    setAvatarState(null);
  };

  // Appelé depuis ProfilPage après un upload réussi
  const updateAvatar = (url) => {
    localStorage.setItem("avatar", url);
    setAvatarState(url);
  };

  return (
    <AuthContext.Provider value={{ token, user, avatar, login, logout, updateAvatar, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  }
  return context;
}
