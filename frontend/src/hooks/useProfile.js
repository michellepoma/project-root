//forntend/src/hooks/useProfile.js
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
//import axios from "axios";

export default function useProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access");
      if (!token) return;

      try {
        const response = await api.get("/api/users/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        console.error("Error al obtener perfil:", err);
        setUser(null);
      }
    };

    fetchProfile();
  }, []);

  return user;
}
