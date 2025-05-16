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

  // Carga inicial de participantes
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

  // Limpia mensaje de éxito tras 4s
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => setSuccessMsg(""), 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  if (authLoading || loading) {
    return <div className="text-center mt-5">Cargando participantes...</div>;
  }
  if (!user) return <Navigate to="/unauthorized" />;

  const isTeacher = participants.some(
    (p) => p.user === user.id && p.role === "teacher"
  );
  const teachers = participants.filter((p) => p.role === "teacher");
  const students = participants.filter((p) => p.role === "student");

  const renderParticipant = (participant) => (
    <li
      key={participant.id}
      className="list-group-item d-flex align-items-center gap-3"
    >
      <div
        className="rounded-circle bg-light d-flex justify-content-center align-items-center"
        style={{ width: 40, height: 40 }}
      >
        <span className="text-uppercase fw-bold">
          {participant.user_name.charAt(0) || "U"}
        </span>
      </div>
      <span>
        {participant.first_name && participant.last_name
          ? capitalizeFullName(
              `${participant.first_name} ${participant.last_name}`
            )
          : "Usuario"}
      </span>
    </li>
  );

  const handleAddStudent = async () => {
    try {
      setErrorMsg("");
      await api.post("/courses/participants/add-by-email/", {
        email: studentEmail,
        course_id: parseInt(id),
      });
      // recarga
      const updated = await api.get(`/courses/participants/?course=${id}`);
      const updatedList = Array.isArray(updated.data)
        ? updated.data
        : updated.data.results || [];
      setParticipants(updatedList);

      setSuccessMsg("✅ Estudiante agregado exitosamente.");
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
    <div className="position-relative">
      {successMsg && (
        <div
          className="alert alert-success alert-dismissible fade show mt-3"
          role="alert"
        >
          {successMsg}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMsg("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {isTeacher && (
        <div className="d-flex justify-content-end mt-4">
          <button
            className="add-student-btn"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-person-plus"></i>
            Agregar estudiante
          </button>
        </div>
      )}

      {/* Docentes */}
      {teachers.length > 0 && (
        <div className="mb-4 mt-4">
          <h6 className="text-muted">👨‍🏫 Docente del Curso</h6>
          <ul className="list-group">{teachers.map(renderParticipant)}</ul>
        </div>
      )}

      {/* Estudiantes */}
      <div>
        <h6 className="text-muted">👨‍🎓 Estudiantes</h6>
        {students.length > 0 ? (
          <ul className="list-group">{students.map(renderParticipant)}</ul>
        ) : (
          <p className="text-muted">No hay estudiantes registrados aún.</p>
        )}
      </div>

      {/* Modal Añadir Estudiante */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content rounded-4 p-4">
              <div className="modal-header border-0">
                <h5 className="modal-title">Agregar Estudiante</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  className="form-control rounded-pill mb-3"
                  placeholder="Correo electrónico del estudiante"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />
                {errorMsg && <p className="text-danger small">{errorMsg}</p>}
                <div className="text-center">
                  <button
                    className="add-student-btn"
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
