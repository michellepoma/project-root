//frontend/src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    ci: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePassword = (field) => {
    if (field === "password") setShowPassword(!showPassword);
    if (field === "password_confirm") setShowConfirm(!showConfirm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (form.password !== form.password_confirm) {
      setErrors({ password_confirm: ["Las contraseñas no coinciden."] });
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/users/register/", form);

      const { tokens } = response.data;
      localStorage.setItem("access", tokens.access);
      localStorage.setItem("refresh", tokens.refresh);

      navigate("/main");
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ global: ["Ocurrió un error inesperado."] });
        console.error(err);
      }
    }
  };

  return (
    <div className="bg-light d-flex align-items-center justify-content-center vh-100">
      <div className="card shadow p-4" style={{ width: "100%", maxWidth: "500px" }}>
        <div className="text-center mb-4">
          <h3 className="text-primary fw-bold">Crear una Cuenta</h3>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="alert alert-danger">
            {errors.global ? (
              <p>{errors.global[0]}</p>
            ) : (
              <ul className="mb-0">
                {Object.entries(errors).map(([field, msgs]) =>
                  msgs.map((msg, i) => (
                    <li key={`${field}-${i}`}>
                      <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {msg}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="form-floating mb-3">
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="Nombre Completo"
              value={form.name}
              onChange={handleChange}
              required
            />
            <label htmlFor="name">Nombre Completo</label>
          </div>

          {/* CI */}
          <div className="input-group mb-3">
            <span className="input-group-text">
              <i className="bi bi-person-vcard"></i>
            </span>
            <input
              type="text"
              id="ci"
              name="ci"
              className="form-control"
              placeholder="Carnet de Identidad"
              value={form.ci}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="form-floating mb-3">
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="email">Correo electrónico</label>
          </div>

          {/* Password */}
          <div className="form-floating mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="form-control"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="password">Contraseña</label>
            <i
              className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} position-absolute top-50 end-0 translate-middle-y me-3`}
              style={{ cursor: "pointer" }}
              onClick={() => togglePassword("password")}
            ></i>
          </div>

          {/* Confirm password */}
          <div className="form-floating mb-4 position-relative">
            <input
              type={showConfirm ? "text" : "password"}
              id="password_confirm"
              name="password_confirm"
              className="form-control"
              placeholder="Confirmar Contraseña"
              value={form.password_confirm}
              onChange={handleChange}
              required
            />
            <label htmlFor="password_confirm">Confirmar Contraseña</label>
            <i
              className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"} position-absolute top-50 end-0 translate-middle-y me-3`}
              style={{ cursor: "pointer" }}
              onClick={() => togglePassword("password_confirm")}
            ></i>
          </div>

          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-success">
              <i className="bi bi-person-plus"></i> Registrarse
            </button>
          </div>

          <div className="text-center">
            <small>
              ¿Ya tienes una cuenta?{" "}
              <a href="/login" className="text-decoration-none">
                Inicia sesión
              </a>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
