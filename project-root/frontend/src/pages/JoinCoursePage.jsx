// frontend/src/pages/JoinCoursePage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import useProfile from "../hooks/useProfile";

function JoinCoursePage() {
  const [code, setCode] = useState("");
  const [alert, setAlert] = useState(null); // { type: "success" | "danger", message: string }
  const navigate = useNavigate();
  const user = useProfile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    try {
      const res = await api.post("/courses/join_by_code/", { code });
      const courseId = res.data.course; // << aquí tomamos el ID del curso desde CourseParticipant

      setAlert({ type: "success", message: "¡Te uniste correctamente!" });
      setCode("");

      // Redirigir después de 1s
      setTimeout(() => {
        navigate(`/courses/${courseId}`);
      }, 1000);
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Error al unirse al curso.";
      setAlert({ type: "danger", message: msg });
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <p className="fs-5 mb-4">Unirse a la clase con:</p>

          <div className="p-4 rounded shadow-sm bg-white mb-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <div
                    className="rounded-circle bg-secondary"
                    style={{ width: 40, height: 40 }}
                  ></div>
                </div>
                <div>
                  <div className="text-capitalize">{user?.name}</div>
                  <strong>{user?.email}</strong>
                </div>
              </div>
              <a href="/login" className="text-decoration-none text-primary">
                Usar otra cuenta
              </a>
            </div>
          </div>

          <div className="p-4 rounded shadow-sm bg-white">
            {alert && (
              <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
                {alert.message}
                <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label htmlFor="codigo" className="form-label">
                Código del curso:
              </label>
              <input
                type="text"
                id="codigo"
                className="form-control mb-3"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <button className="btn btn-primary w-100" type="submit">
                Unirse
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinCoursePage;
