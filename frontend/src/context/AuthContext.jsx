/**
 * Global auth state — user object, login/logout helpers, loading flag.
 * Token is persisted in localStorage as "optivest_token".
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking stored token

  // On mount, verify any stored token and hydrate user
  useEffect(() => {
    const token = localStorage.getItem("optivest_token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getProfile()
      .then(setUser)
      .catch(() => localStorage.removeItem("optivest_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((token, userData) => {
    localStorage.setItem("optivest_token", token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("optivest_token");
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const updated = await authApi.getProfile();
    setUser(updated);
    return updated;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
