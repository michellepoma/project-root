// frontend/src/pages/ForgotPasswordPage.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import "@/styles/ForgotPasswordPage.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Solicitud de recuperación enviada a: ${email}`);
  };

  return (
    <div className="forgot-page-container">
      <div className="background-img"></div>

      <div className="forgot-card animate-pop">
        <Link to="/login" className="forgot-back">
          <i className="bi bi-arrow-left-circle-fill"></i>

        </Link>
        <h4 className="text-center mb-4">Recuperar Contraseña</h4>
        <form onSubmit={handleSubmit}>
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control forgot-input mb-4"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="forgot-btn">Enviar enlace</button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
