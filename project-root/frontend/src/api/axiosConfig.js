//frontend/src/api/axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Interceptor de respuestas
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login"; // redirige directamente
    }
    return Promise.reject(error);
  }
);

export default api;
