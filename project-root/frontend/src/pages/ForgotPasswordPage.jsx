// frontend/src/pages/ForgotPasswordPage.jsx

import { useState } from "react";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Por ahora solo simular
    alert(`Solicitud de recuperación enviada a: ${email}`);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <form onSubmit={handleSubmit} className="p-4 shadow rounded bg-white" style={{ maxWidth: 400, width: "100%" }}>
        <h4 className="mb-4 text-center">Recuperar Contraseña</h4>
        <div className="mb-3">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email"
            className="form-control"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Enviar enlace</button>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
