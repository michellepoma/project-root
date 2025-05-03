import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function useProfile() {
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
        const response = await api.get("/auth/profile/");
        setUser(response.data);
      } catch (err) {
        setError(err);
        console.error("Error al obtener perfil:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { user, loading, error };
}