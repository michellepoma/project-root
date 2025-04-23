//frontend/src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    <div className="bg-light d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "400px" }}>
        <div className="text-center mb-4">
          <h3 className="text-primary fw-bold">Iniciar Sesión</h3>
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}

        <form onSubmit={handleLogin}>
          {/* Correo */}
          <div className="form-floating mb-3">
            <input
              type="email"
              name="email"
              id="email"
              className="form-control"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Correo Electrónico</label>
          </div>

          {/* Contraseña */}
          <div className="form-floating mb-4 position-relative">
            <input
              type={show ? "text" : "password"}
              name="password"
              id="password"
              className="form-control"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Contraseña</label>

            <i
              className={`bi ${show ? "bi-eye-slash" : "bi-eye"} position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer`}
              style={{ cursor: "pointer" }}
              onClick={() => setShow(!show)}
            ></i>
          </div>

          {/* Botón */}
          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-primary">
              <i className="bi bi-box-arrow-in-right"></i> Iniciar Sesión
            </button>
          </div>

          {/* Enlaces */}
          <div className="text-center">
            <a href="#" className="d-block mb-2 text-decoration-none">¿Olvidaste tu contraseña?</a>
            <span>¿No tienes una cuenta?</span>
            <a href="/register" className="text-decoration-none ms-1">Regístrate</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
