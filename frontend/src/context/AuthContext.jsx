import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

// Create the context
const AuthContext = createContext(null);

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

    const data = await res.json();

    // Throw with server message so catch blocks work the same way
    if (!res.ok) {
      const err = new Error(data.message || "Request failed");
      err.response = { data, status: res.status };
      throw err;
    }

    return { data };
  },

  get(path)          { return this.request("GET",    path);       },
  post(path, body)   { return this.request("POST",   path, body); },
  put(path, body)    { return this.request("PUT",    path, body); },
  delete(path)       { return this.request("DELETE", path);       },
};

//Provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Check stored auth on mount

  //Restore session from localStorage on app load
  useEffect(() => {
    const storedToken = localStorage.getItem("jf_token");
    const storedUser = localStorage.getItem("jf_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  //Save auth state to localStorage
  const persistAuth = (token, user) => {
    localStorage.setItem("jf_token", token);
    localStorage.setItem("jf_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  //Register
  const register = async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    persistAuth(data.token, data.user);
    return data;
  };

  //Login
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persistAuth(data.token, data.user);
    return data;
  };

  //Logout
  const logout = () => {
    localStorage.removeItem("jf_token");
    localStorage.removeItem("jf_user");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    api, // Expose configured axios instance for job calls
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export { api };
