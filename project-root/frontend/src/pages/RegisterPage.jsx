// frontend/src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "@/styles/RegisterPage.css"; // Importa tu CSS

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
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  

  const togglePassword = (field) => {
    if (field === "password") setShowPassword(!showPassword);
    if (field === "password_confirm") setShowConfirm(!showConfirm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
  
    const ciRegex = /^[0-9]+(-[a-zA-Z0-9]+)?$/;
    if (!ciRegex.test(form.ci)) {
      setErrors({ ci: ["El C.I. debe ser un número o número seguido de complemento alfanumérico (ej. 123456 o 123456-1H)."] });
      return;
    }
  
    if (form.password !== form.password_confirm) {
      setErrors({ password_confirm: ["Las contraseñas no coinciden."] });
      return;
    }
  
    try {
      await axios.post("http://localhost:8000/api/users/register/", form);
      navigate("/login");
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
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Crear una Cuenta</h2>

        {Object.keys(errors).length > 0 && (
          <div className="register-error">
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
          <input
            type="text"
            id="name"
            name="name"
            className="register-input"
            placeholder="Nombre Completo"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            id="ci"
            name="ci"
            className="register-input"
            placeholder="Carnet de Identidad"
            value={form.ci}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            id="email"
            name="email"
            className="register-input"
            placeholder="Correo Electrónico"
            value={form.email}
            onChange={handleChange}
            required
          />

          <div className="position-relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              className="register-input"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required
            />
            <i
              className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} toggle-password`}
              onClick={() => togglePassword("password")}
            ></i>
          </div>

          <div className="position-relative">
            <input
              type={showConfirm ? "text" : "password"}
              id="password_confirm"
              name="password_confirm"
              className="register-input"
              placeholder="Confirmar Contraseña"
              value={form.password_confirm}
              onChange={handleChange}
              required
            />
            <i
              className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"} toggle-password`}
              onClick={() => togglePassword("password_confirm")}
            ></i>
          </div>

          <button type="submit" className="register-button">
            Registrarse
          </button>

          <div className="register-footer">
            <small>
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="text-decoration-none">
                Inicia sesión
              </Link>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
