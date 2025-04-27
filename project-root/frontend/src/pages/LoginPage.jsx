// frontend/src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import "@/styles/login.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/api/token/", {
        email,
        password,
      });

      const { access, refresh } = response.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      navigate("/main");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Credenciales inválidas.");
      } else {
        setError("Ocurrió un error. Intenta más tarde.");
        console.error("Error al iniciar sesión:", err);
      }
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
              <span
                className="toggle-password"
                onClick={() => setShow(!show)}
              >
                <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`}></i>
              </span>
            </div>
          </div>

          <button type="submit" className="custom-btn">Iniciar Sesión</button>

          <div className="login-links">
            <Link to="#">¿Olvidaste tu contraseña?</Link>
            <br />
            <span>¿No tienes una cuenta? <Link to="/register">Regístrate</Link></span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
