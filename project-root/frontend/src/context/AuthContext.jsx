import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
        try {
          const res = await api.get("/auth/profile/");
          const userData = res.data;
          userData.role = userData.role?.trim().toLowerCase();
          setUser(userData);
          // En AuthContext.jsx
          console.log("🧠 Rol cargado:", res.data.role);

        } catch (err) {
          setError(err);
          console.error("Error al obtener perfil:", err.response?.data || err.message);
        } finally {
          setLoading(false);
        }
      };      

    fetchProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
