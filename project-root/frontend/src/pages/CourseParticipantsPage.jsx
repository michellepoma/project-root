import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

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
        setParticipants(response.data);
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
      const timer = setTimeout(() => {
        setSuccessMsg("");
      }, 4000); // Desaparece a los 4 segundos
  
      return () => clearTimeout(timer); // Limpieza si el componente cambia antes
    }
  }, [successMsg]);
  

  if (authLoading || loading || !user) {
    return <div className="text-center mt-5">Cargando participantes...</div>;
  }

  const isTeacher = participants.some(
    (p) => p.user === user.id && p.role === "teacher"
  );
  const teachers = participants.filter((p) => p.role === "teacher");
  const students = participants.filter((p) => p.role === "student");

  const renderParticipant = (participant) => (
    <li
      key={participant.id}
      className="list-group-item d-flex align-items-center justify-content-between"
    >
      <div className="d-flex align-items-center gap-3">
        <div
          className="rounded-circle bg-light d-flex justify-content-center align-items-center"
          style={{ width: 40, height: 40 }}
        >
          <span className="text-uppercase fw-bold">
            {participant.user_name?.charAt(0) || "U"}
          </span>
        </div>
        <span>{participant.user_name || "Usuario"}</span>
      </div>
      <i className="bi bi-check2-square"></i>
    </li>
  );

  const handleAddStudent = async () => {
    try {
      setErrorMsg("");
      setSuccessMsg(""); // limpia antes

      await api.post("/courses/participants/add-by-email/", {
        email: studentEmail,
        course_id: parseInt(id),
      });

      const updated = await api.get(`/courses/participants/?course=${id}`);
      setParticipants(updated.data);

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
        <div className="alert alert-success alert-dismissible fade show mt-3" role="alert">
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

      {/* Profesor */}
      {teachers.length > 0 && (
        <div className="mb-4">
          <h6 className="text-muted">👨‍🏫 Profesor del Curso</h6>
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

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div
              className="modal-content rounded-4 p-4"
              style={{ background: "#fdf4f6" }}
            >
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
