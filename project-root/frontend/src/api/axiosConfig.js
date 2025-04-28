// frontend/src/api/axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// INTERCEPTOR para AGREGAR token a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// INTERCEPTOR para MANEJAR ERRORES de respuesta (como token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      window.location.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
