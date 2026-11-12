import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API = "/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("cc_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((u) => { setUser(u); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem("cc_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (form) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem("cc_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("cc_token");
    setToken(null);
    setUser(null);
  };

  const apiFetch = async (path, options = {}) => {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Request failed"); }
    return res.json();
  };

  const updateUser = (updates) => setUser((u) => ({ ...u, ...updates }));

  return <AuthContext.Provider value={{ user, token, loading, login, register, logout, apiFetch, updateUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
