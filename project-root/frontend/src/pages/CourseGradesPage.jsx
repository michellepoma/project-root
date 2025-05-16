// ✅ CourseGradesPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { DateTime } from "luxon";
import { formatToLocal, getTimeRemaining } from "../utils/time";
import GradeModal from "../components/GradeModal";
import "@/styles/CourseGradesPage.css";

function CourseGradesPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Carga inicial de tareas
  useEffect(() => {
    if (!id || !user) return;
    const fetchAssignments = async () => {
      try {
        const res = await api.get(`/assignments/assignments/?course=${id}`);
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
        setAssignments(data);
      } catch (err) {
        console.error("Error al cargar tareas:", err);
      }
    };
    fetchAssignments();
  }, [id, user]);

  if (authLoading || !user) {
    return <div className="text-center mt-5">Cargando usuario...</div>;
  }

  // === VISTA PROFESOR ===
  if (user.role === "teacher") {
    return (
      <div className="container py-4">
        <h3 className="mb-4 text-center">Calificaciones</h3>

        {assignments.map((a) => {
          const isOpen = expandedTaskId === a.id;

          return (
            <div key={a.id} className="bg-light p-3 mb-3 rounded shadow-sm">
              <div className="d-flex justify-content-between">
                <div>
                  <h5>{a.title}</h5>
                  <p className="text-muted">{a.description}</p>
                </div>
                <button
                  className="btn-orange"
                  onClick={() => setExpandedTaskId(isOpen ? null : a.id)}
                >
                  {isOpen ? "Ocultar entregas" : "Ver entregas"}
                </button>
              </div>

              {isOpen && (
                <div className="mt-3">
                  {Array.isArray(a.submissions) && a.submissions.length > 0 ? (
                    a.submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="d-flex justify-content-between align-items-center p-2 border rounded mb-2"
                      >
                        <div>
                          <strong>Estudiante:</strong> {submission.student_name} <br />
                          <strong>Contenido:</strong> {submission.content || "Sin contenido"} <br />
                          {submission.file && (
                            <a
                              href={submission.file}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Ver archivo
                            </a>
                          )}
                        </div>
                        <button
                          className="btn-orange btn-sm"
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowModal(true);
                          }}
                        >
                          Calificar
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No hay entregas para esta tarea.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Modal de Calificación */}
        {showModal && selectedSubmission && (
          <GradeModal
            show={showModal}
            onClose={() => setShowModal(false)}
            submission={selectedSubmission}
          />
        )}
      </div>
    );
  }


  // === VISTA ESTUDIANTE ===
  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center">Mis Tareas y Calificaciones</h3>

      {assignments.map((task) => {
        const isOpen = expandedTaskId === task.id;
        const myGrade = task.grades?.find((g) => g.student === user.id);

        return (
          <div key={task.id} className="bg-light p-3 mb-3 rounded shadow-sm">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5>{task.title}</h5>
                <p className="text-muted">{task.description}</p>
              </div>
              <button
                className="btn-orange btn-sm"
                onClick={() => setExpandedTaskId(isOpen ? null : task.id)}
              >
                {isOpen ? "Ocultar detalles" : "Ver detalles"}
              </button>
            </div>

            {isOpen && (
              <div className="mt-3">
                <p>
                  <strong>Fecha de entrega:</strong> {formatToLocal(task.due_date)}
                  <br />
                  <span className="text-muted">
                    {getTimeRemaining(task.due_date) || "⏱️ Plazo vencido"}
                  </span>
                </p>

                {myGrade ? (
                  <p>
                    <strong>Tu nota:</strong> {myGrade.score}/100 <br />
                    <strong>Feedback:</strong> {myGrade.feedback || "Sin comentarios"}
                  </p>
                ) : (
                  <p className="text-muted">Aún no has recibido una calificación para esta tarea.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

}

export default CourseGradesPage;
