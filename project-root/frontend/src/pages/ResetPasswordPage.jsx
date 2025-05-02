// frontend/src/pages/ResetPasswordPage.jsx

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/axiosConfig"; // o usa axios directamente si prefieres

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
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white" style={{ maxWidth: 400, width: "100%" }}>
        <h4 className="mb-4 text-center">Restablecer Contraseña</h4>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">Contraseña actualizada. Redirigiendo...</div>}

        <div className="mb-3">
          <label className="form-label">Nueva contraseña</label>
          <input
            type="password"
            className="form-control"
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
            className="form-control"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">Guardar nueva contraseña</button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
