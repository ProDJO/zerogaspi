import { useState } from "react";

export function useAuth() {
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

    // Décoder le payload du JWT (sans librairie)
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    setUser({ id: payload.id, role: payload.role });

    return data.token;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return { token, user, login, logout };
}