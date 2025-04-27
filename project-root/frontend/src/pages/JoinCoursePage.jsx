// frontend/src/pages/JoinCoursePage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import useProfile from "../hooks/useProfile";
import "@/styles/JoinCoursePage.css"; // 🎨 Importamos el nuevo CSS

function JoinCoursePage() {
  const [code, setCode] = useState("");
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  const user = useProfile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    try {
      const res = await api.post("/courses/join_by_code/", { code });
      const courseId = res.data.course;

      setAlert({ type: "success", message: "¡Te uniste correctamente!" });
      setCode("");

      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.detail || "Error al unirse al curso.";
      setAlert({ type: "danger", message: msg });
    }
  };

  return (
    <div className="join-course-container">
      <div className="join-course-card">

        {alert && (
          <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
            {alert.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => setAlert(null)}
            ></button>
          </div>
        )}

        {/* Información del usuario */}
        <div className="user-info mb-4">
          <div className="user-avatar"></div>
          <div className="user-details">
            <div className="text-capitalize">{user?.name}</div>
            <strong>{user?.email}</strong>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <label htmlFor="codigo" className="form-label mb-2">
            Código del curso:
          </label>
          <input
            type="text"
            id="codigo"
            className="join-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <button type="submit" className="join-btn mt-3">
            Unirse
          </button>
        </form>

      </div>
    </div>
  );
}

export default JoinCoursePage;
