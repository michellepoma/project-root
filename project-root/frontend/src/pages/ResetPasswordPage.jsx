import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axiosConfig";
import "@/styles/ResetPasswordPage.css"; // Asegúrate de tener este archivo

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await api.post("/password-reset/confirm/", {
        token,
        password: form.password,
        password_confirm: form.confirm,
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError("El enlace es inválido o ha expirado.");
    }
  };

  return (
    <div className="reset-container">
      <form onSubmit={handleSubmit} className="reset-card">
        <h4 className="reset-title">Restablecer Contraseña</h4>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">Contraseña actualizada. Redirigiendo...</div>}

        <div className="mb-3">
          <label className="form-label">Nueva contraseña</label>
          <input
            type="password"
            className="form-control reset-input"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirmar contraseña</label>
          <input
            type="password"
            className="form-control reset-input"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="reset-btn">Guardar nueva contraseña</button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
