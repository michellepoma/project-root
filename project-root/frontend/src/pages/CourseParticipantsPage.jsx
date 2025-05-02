// frontend/src/pages/CourseParticipantsPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import useProfile from "../hooks/useProfile";

function CourseParticipantsPage() {
  const { id } = useParams();
  const user = useProfile();

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [courseCode, setCourseCode] = useState("");

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await api.get(`/courses/${id}/participants/`);
        setParticipants(response.data);
      } catch (error) {
        console.error("Error al cargar participantes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [id]);

  if (loading || !user) {
    return <div className="text-center mt-5">Cargando participantes...</div>;
  }

  const isTeacher = participants.find(p => p.user === user.id && p.role === "teacher");

  const teachers = participants.filter(p => p.role === "teacher");
  const students = participants.filter(p => p.role === "student");

  const renderParticipant = (participant) => (
    <li key={participant.id} className="list-group-item d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-3">
        <div
          className="rounded-circle bg-light d-flex justify-content-center align-items-center"
          style={{ width: 40, height: 40 }}
        >
          <span className="text-uppercase fw-bold">{participant.user_name ? participant.user_name.charAt(0) : "U"}</span>
        </div>
        <span>{participant.user_name || "Usuario"}</span>
      </div>
      <i className="bi bi-check2-square"></i>
    </li>
  );

  return (
    <div className="position-relative">
      {/* Botón para teacher */}
      {isTeacher && (
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-danger rounded-pill d-flex align-items-center gap-2"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-person-plus"></i>
            Agregar estudiante
          </button>
        </div>
      )}

      {/* Encargado del Curso */}
      {teachers.length > 0 && (
        <div className="mb-4">
          <h6 className="text-muted">Encargado del curso</h6>
          <ul className="list-group">
            {teachers.map((participant) => renderParticipant(participant))}
          </ul>
        </div>
      )}

      {/* Estudiantes */}
      {students.length > 0 && (
        <div>
          <h6 className="text-muted">Estudiantes</h6>
          <ul className="list-group">
            {students.map((participant) => renderParticipant(participant))}
          </ul>
        </div>
      )}

      {/* Modal para agregar estudiante */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content rounded-4 p-4" style={{ background: "#fdf4f6" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title">Agregar Estudiante</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body">
                <input
                  className="form-control rounded-pill mb-3"
                  placeholder="Correo electrónico del estudiante"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                />
                <input
                  className="form-control rounded-pill mb-4"
                  placeholder="Código del curso"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                />

                <div className="text-center">
                  <button
                    className="btn btn-danger rounded-pill px-5 py-2"
                    onClick={() => {
                      // Por ahora solo cerrar y limpiar
                      console.log("Estudiante agregado:", studentEmail, courseCode);
                      setShowModal(false);
                      setStudentEmail("");
                      setCourseCode("");
                    }}
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
