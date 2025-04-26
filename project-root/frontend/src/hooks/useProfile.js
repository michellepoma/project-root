//forntend/src/hooks/useProfile.js
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function useProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile/");
        setUser(response.data);
      } catch (err) {
        console.error("Error al obtener perfil:", err);
      }
    };

    fetchProfile();
  }, []);

  return user;
}