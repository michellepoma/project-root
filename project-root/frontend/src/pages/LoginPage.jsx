//✅login 

// frontend/src/pages/LoginPage.jsx
import { useState } from "react";
import "@/styles/login.css";
//import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "../api/axiosConfig";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/token/", {
        email,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      const profileRes = await api.get("/auth/profile/");
      const { role, is_superuser } = profileRes.data;

      if (is_superuser) {
        window.location.href = "/admin";
      } else if (role === "student") {
        window.location.href = "/student";
      } else if (role === "teacher") {
        window.location.href = "/teacher";
      } else {
        window.location.href = "/unauthorized";
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Credenciales inválidas.");
        setShowToast(true); // ← muestra el toast
      } else {
        setError("Ocurrió un error. Intenta más tarde.");
      }
      console.error("Error al iniciar sesión:", err);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <h3 className="login-title">Iniciar Sesión</h3>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="login-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-group">
            <label htmlFor="password">Contraseña</label>
            <div className="password-wrapper">
              <input
                type={show ? "text" : "password"}
                id="password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="toggle-password" onClick={() => setShow(!show)}>
                <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`}></i>
              </span>
            </div>
          </div>

          <button type="submit" className="custom-btn">
            Iniciar Sesión
          </button>

          <div className="login-links">
            <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
            <br />
          </div>
        </form>
      </div>
      {showToast && (
        <div
          className="toast show position-fixed bottom-0 end-0 m-4 text-bg-dark"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ zIndex: 1055 }}
        >
          <div className="toast-header bg-danger text-white">
            <strong className="me-auto">¿Primera vez?</strong>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setShowToast(false)}
            ></button>
          </div>
          <div className="toast-body">
            Si es tu primer inicio de sesión, tu contraseña es tu CI seguido de
            tus nombres.
            <br />
            Ejemplo: <code>12345678MarcoEsteban</code>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
