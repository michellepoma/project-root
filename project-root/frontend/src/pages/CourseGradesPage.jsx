// ✅CAlificaciones 

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import { DateTime } from "luxon";
import { formatToLocal, getTimeRemaining } from "../utils/time";
import "@/styles/CourseGradesPage.css";

function CourseGradesPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState({});
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [uploadType, setUploadType] = useState("file");

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

  // Carga de calificaciones para una tarea concreta
  const fetchGrades = async (assignmentId) => {
    try {
      const res = await api.get(`/grades/?assignment=${assignmentId}`);
      setGrades((prev) => ({ ...prev, [assignmentId]: res.data }));
    } catch (err) {
      console.error("Error al cargar calificaciones:", err);
    }
  };

  const openGradeModal = (grade) => {
    setSelectedGrade(grade);
    setScore(grade.score || 0);
  };

  const saveGrade = async () => {
    try {
      await api.patch(`/grades/${selectedGrade.id}/`, { score });
      setSelectedGrade(null);
      fetchGrades(selectedGrade.assignment);
    } catch (err) {
      console.error("Error al guardar calificación:", err);
    }
  };

  if (authLoading || !user) {
    return <div className="text-center mt-5">Cargando usuario...</div>;
  }

  // === VISTA PROFESOR ===
  if (user.role === "teacher") {
    return (
      <div className="container py-4">
        <h3 className="mb-4 text-center">Calificaciones</h3>
        {assignments.map((a) => (
          <div key={a.id} className="bg-light p-3 mb-3 rounded shadow-sm">
            <div className="d-flex justify-content-between">
              <div>
                <h5>{a.title}</h5>
                <p className="text-muted">{a.description}</p>
              </div>
              <button
                className="btn-orange"
                onClick={() => {
                  setExpandedTaskId(a.id);
                  fetchGrades(a.id);
                }}
              >
                Ver entregas
              </button>
            </div>

            {expandedTaskId === a.id && (
              <div className="mt-3">
                {grades[a.id]?.length > 0 ? (
                  grades[a.id].map((g) => (
                    <div
                      key={g.id}
                      className="d-flex justify-content-between align-items-center p-2 border rounded mb-2"
                    >
                      <span>{g.student_name}</span>
                      <span>{g.score || 0}/100</span>
                      <button
                        className="btn-orange btn-sm"
                        onClick={() => openGradeModal(g)}
                      >
                        Calificar / Editar
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No hay entregas para esta tarea.</p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Modal de Calificar */}
        {selectedGrade && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content p-4">
                <div className="modal-header">
                  <h5 className="modal-title">Calificar tarea</h5>
                  <button
                    className="btn-close"
                    onClick={() => setSelectedGrade(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Estudiante:</strong> {selectedGrade.student_name}
                  </p>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="form-control mt-3"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn-orange" onClick={saveGrade}>
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
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
        const isDue = DateTime.now().toUTC() < DateTime.fromISO(task.due_date);
        return (
          <div key={task.id} className="bg-light p-3 mb-3 rounded shadow-sm">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h5>{task.title}</h5>
                <p className="text-muted">{task.description}</p>
              </div>
              <button
                className="btn-orange btn-sm"
                onClick={() => {
                  setExpandedTaskId(isOpen ? null : task.id);
                  fetchGrades(task.id);
                }}
              >
                {isOpen ? "Ocultar" : "Ver tarea"}
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

                {grades[task.id]?.length > 0 ? (
                  grades[task.id]
                    .filter((g) => g.student === user.id)
                    .map((g) => (
                      <p key={g.id}>
                        <strong>Tu nota:</strong> {g.score}/100
                        <br />
                        <strong>Feedback:</strong> {g.feedback || "Sin comentarios"}
                      </p>
                    ))
                ) : !isDue ? (
                  <button className="btn-orange">Subir entrega</button>
                ) : (
                  <p className="text-danger">
                    Plazo vencido. Ya no puedes entregar.
                  </p>
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
