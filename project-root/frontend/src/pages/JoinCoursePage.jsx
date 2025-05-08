import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { capitalizeFullName } from "../utils/format";
import "@/styles/JoinCoursePage.css";

function JoinCoursePage() {
  const [code, setCode] = useState("");
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-4">Cargando...</p>;
  if (!user || user.role !== "student") return <Navigate to="/unauthorized" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setAlert({ type: "danger", message: "El código no puede estar vacío." });
      return;
    }

    const codePattern = /^[A-Z0-9]{6}$/;
    if (!codePattern.test(trimmedCode)) {
      setAlert({
        type: "danger",
        message:
          "El código debe tener exactamente 6 caracteres (mayúsculas y números).",
      });
      return;
    }

    try {
      const res = await api.post("/courses/courses/join_by_code/", {
        code: trimmedCode,
      });
      const courseId = res.data.course;

      setAlert({ type: "success", message: "¡Te uniste correctamente!" });
      setCode("");

      setTimeout(() => {
        const basePath = user.role === "student" ? "/student" : "/teacher";
        navigate(`${basePath}/courses/${courseId}`);
      }, 1200);
    } catch (err) {
      let msg = "Error al unirse al curso.";

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 404) {
          msg = data.detail || "No se encontró ningún curso con este código.";
        } else if (
          status === 400 &&
          data.detail === "Ya estás inscrito en este curso."
        ) {
          msg = "Ya estás inscrito en este curso.";
        } else if (data.detail) {
          msg = data.detail;
        }
      }

      setAlert({ type: "danger", message: msg });
    }
  };

  return (
    <div className="join-course-container">
      <div className="join-course-card">
        {alert && (
          <div
            className={`alert alert-${alert.type} alert-dismissible fade show`}
            role="alert"
          >
            {alert.message}
            <button
              type="button"
              className="btn-close"
              onClick={() => setAlert(null)}
            ></button>
          </div>
        )}

        {/* Usuario */}
        <div className="user-info mb-4">
          <div className="user-avatar">
            <img
              src={user.profile_picture || "/default_avatar.png"}
              alt="Avatar"
              className="rounded-circle"
              style={{ width: "50px", height: "50px", objectFit: "cover" }}
            />
          </div>
          <div className="user-details">
            <div className="text-capitalize">
              {" "}
              {capitalizeFullName(
                `${user?.first_name || ""} ${user?.last_name || ""}`
              )}
            </div>
            <strong>{user.email}</strong>
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
            onChange={(e) => setCode(e.target.value.toUpperCase())} // fuerza mayúsculas
            maxLength={6}
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
