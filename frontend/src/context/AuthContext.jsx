import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

// How long a user can be inactive before being auto logged out (ms)
const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes

let onUnauthorized = null;

const api = {
  async request(method, path, body) {
    const token = localStorage.getItem("jf_token");

    const res = await fetch(`/api${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    // Server rejected the token = force logout immediately
    if (res.status === 401 && onUnauthorized) {
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
    return payload.exp ? payload.exp * 1000 : null; // exp is in seconds
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tracks the inactivity timer so it can be cleared/reset
  const inactivityTimer = useRef(null);

  //Logout
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

  //Reset the inactivity timer
  // Called on every user interaction (click, keypress, scroll)
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      logout("inactivity");
    }, INACTIVITY_LIMIT);
  }, [logout]);

  //Restore session from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem("jf_token");
    const storedUser = localStorage.getItem("jf_user");

    if (storedToken && storedUser) {
      // Check if the token has already expired before trusting it
      const expiry = decodeTokenExpiry(storedToken);
      if (expiry && Date.now() > expiry) {
        // Token expired while the app was closed = force logout
        localStorage.removeItem("jf_token");
        localStorage.removeItem("jf_user");
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
    setLoading(false);
  }, []);

  //Set up activity listeners for auto-logout
  useEffect(() => {
    if (!token) return; // only track activity while logged in

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));
    resetInactivityTimer(); // start the timer immediately on login

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [token, resetInactivityTimer]);

  //Wire up global 401 handler
  // When any API call gets a 401, force logout with "expired" reason
  useEffect(() => {
    onUnauthorized = () => logout("expired");
    return () => { onUnauthorized = null; };
  }, [logout]);

  //Save auth state to localStorage
  const persistAuth = (newToken, newUser) => {
    localStorage.setItem("jf_token", newToken);
    localStorage.setItem("jf_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // Register
  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    persistAuth(data.token, data.user);
    return data;
  };

  // Login
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
