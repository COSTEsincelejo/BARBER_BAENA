import React, { createContext, useContext, useMemo, useState } from "react";
import { loginAdmin } from "../api.js";

const TOKEN_KEY = "barberia_admin_token";
const INFO_KEY = "barberia_admin_info";

const AuthContext = createContext(null);

function leerAdminGuardado() {
  try {
    const raw = localStorage.getItem(INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState(leerAdminGuardado);

  async function login(username, password) {
    const data = await loginAdmin(username, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(INFO_KEY, JSON.stringify(data.admin));
    setToken(data.token);
    setAdmin(data.admin);
    return data;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(INFO_KEY);
    setToken(null);
    setAdmin(null);
  }

  const value = useMemo(
    () => ({
      admin,
      token,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [admin, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
