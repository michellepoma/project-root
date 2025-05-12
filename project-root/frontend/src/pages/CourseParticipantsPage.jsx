// frontend/src/pages/CourseParticipantsPage.jsx
import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { capitalizeFullName } from "../utils/format";
import "@/styles/CourseParticipantsPage.css";

function CourseParticipantsPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await api.get(`/courses/participants/?course=${id}`);
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.results || [];
        setParticipants(data);
      } catch (error) {
        console.error("Error al cargar participantes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [id]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  if (authLoading || loading || !user) {
    return <div className="text-center mt-5">Cargando participantes...</div>;
  }

  if (!user) {
    return <Navigate to="/unauthorized" />;
  }

  const isTeacher =
    participants.some((p) => p.user === user.id && p.role === "teacher");

  const teachers = participants.filter((p) => p.role === "teacher");
  const students = participants.filter((p) => p.role === "student");

  const renderParticipant = (p) => (
    <li key={p.id} className="list-group-item participant-item">
      <div className="participant-info">
        <div className="participant-avatar">
          {p.user_name.charAt(0)?.toUpperCase() || "U"}
        </div>
        <span className="participant-name">
          {p.first_name && p.last_name
            ? capitalizeFullName(`${p.first_name} ${p.last_name}`)
            : "Usuario"}
        </span>
      </div>
      <i className="bi bi-check2-square check-icon"></i>
    </li>
  );

  const handleAddStudent = async () => {
    try {
      setErrorMsg("");
      setSuccessMsg("");
      await api.post("/courses/participants/add-by-email/", {
        email: studentEmail,
        course_id: parseInt(id),
      });
      const updated = await api.get(`/courses/participants/?course=${id}`);
      const updatedList = Array.isArray(updated.data)
        ? updated.data
        : updated.data.results || [];
      setParticipants(updatedList);
      setSuccessMsg("Estudiante agregado exitosamente.");
      setShowModal(false);
      setStudentEmail("");
    } catch (error) {
      console.error("Error al agregar estudiante:", error);
      if (error.response?.status === 404) {
        setErrorMsg("Usuario no encontrado.");
      } else if (error.response?.data?.detail) {
        setErrorMsg(error.response.data.detail);
      } else {
        setErrorMsg("No se pudo agregar al estudiante.");
      }
    }
  };

  return (
    <div className="course-participants-container">
      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show">
          {successMsg}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMsg("")}
            aria-label="Close"
          />
        </div>
      )}

      {isTeacher && (
        <div className="add-student-wrapper">
          <button
            className="btn add-student-btn"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-person-plus me-2"></i>
            Agregar estudiante
          </button>
        </div>
      )}

      {teachers.length > 0 && (
        <section className="mb-4">
          <h6 className="section-title">Docente del Curso</h6>
          <ul className="list-group">{teachers.map(renderParticipant)}</ul>
        </section>
      )}

      <section>
        <h6 className="section-title">Estudiantes</h6>
        {students.length > 0 ? (
          <ul className="list-group">{students.map(renderParticipant)}</ul>
        ) : (
          <p className="text-muted">No hay estudiantes registrados aún.</p>
        )}
      </section>

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content rounded-4 p-4">
              <div className="modal-header border-0">
                <h5 className="modal-title">Agregar Estudiante</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Correo electrónico del estudiante"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />
                {errorMsg && <p className="text-danger small">{errorMsg}</p>}
                <div className="text-center">
                  <button
                    className="btn btn-danger rounded-pill px-5 py-2"
                    onClick={handleAddStudent}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseParticipantsPage;
