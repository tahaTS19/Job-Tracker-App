// ============================================================
// context/AuthContext.jsx — Global Authentication State
// Provides: user, token, login(), register(), logout()
//
// Security measures:
// 1. Auto-logout after 30 minutes of inactivity
// 2. JWT expiry check on every app load
// 3. Global 401 handler — skips auth routes (login/register)
// ============================================================

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

// ─── Backend URL ──────────────────────────────────────────────
// In development, Vite proxy handles /api → localhost:5000
// In production, calls go directly to the Vercel backend URL
const BASE_URL = import.meta.env.VITE_API_URL || "";

let onUnauthorized = null;

const api = {
  async request(method, path, body) {
    const token = localStorage.getItem("jf_token");

    const res = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const isAuthRoute = path.startsWith("/auth/");
    if (res.status === 401 && onUnauthorized && !isAuthRoute) {
      onUnauthorized();
    }

    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message || "Request failed");
      err.response = { data, status: res.status };
      throw err;
    }

    return { data };
  },

  get(path)        { return this.request("GET",    path);       },
  post(path, body) { return this.request("POST",   path, body); },
  put(path, body)  { return this.request("PUT",    path, body); },
  delete(path)     { return this.request("DELETE", path);       },
};

function decodeTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef(null);

  const logout = useCallback((reason) => {
    localStorage.removeItem("jf_token");
    localStorage.removeItem("jf_user");
    setToken(null);
    setUser(null);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

    if (reason === "inactivity") {
      toast.error("You were logged out due to inactivity");
    } else if (reason === "expired") {
      toast.error("Session expired — please log in again");
    } else {
      toast.success("Logged out successfully");
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      logout("inactivity");
    }, INACTIVITY_LIMIT);
  }, [logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem("jf_token");
    const storedUser = localStorage.getItem("jf_user");

    if (storedToken && storedUser) {
      const expiry = decodeTokenExpiry(storedToken);
      if (expiry && Date.now() > expiry) {
        localStorage.removeItem("jf_token");
        localStorage.removeItem("jf_user");
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));
    resetInactivityTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [token, resetInactivityTimer]);

  useEffect(() => {
    onUnauthorized = () => logout("expired");
    return () => { onUnauthorized = null; };
  }, [logout]);

  const persistAuth = (newToken, newUser) => {
    localStorage.setItem("jf_token", newToken);
    localStorage.setItem("jf_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    persistAuth(data.token, data.user);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persistAuth(data.token, data.user);
    return data;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    api,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export { api };
