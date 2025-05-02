// frontend/src/pages/CourseGradesPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import useProfile from "../hooks/useProfile";

function GradesPage() {
  const { id } = useParams();
  const user = useProfile();

  const [assignments, setAssignments] = useState([]);
  const [grades, setGrades] = useState({});
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [uploadType, setUploadType] = useState("file");

  useEffect(() => {
    if (!id) return;
    const fetchAssignments = async () => {
      const res = await api.get(`/assignments/?course=${id}`);
      setAssignments(res.data);
    };
    fetchAssignments();
  }, [id]);

  const fetchGrades = async (assignmentId) => {
    const res = await api.get(`/grades/?assignment=${assignmentId}`);
    setGrades((prev) => ({ ...prev, [assignmentId]: res.data }));
  };

  const openGradeModal = (grade) => {
    setSelectedGrade(grade);
    setScore(grade.score || 0);
  };

  const saveGrade = async () => {
    await api.patch(`/grades/${selectedGrade.id}/`, { score });
    setSelectedGrade(null);
    fetchGrades(selectedGrade.assignment);
  };

  if (!user) return <div className="text-center mt-5">Cargando usuario...</div>;

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
                className="btn btn-outline-primary"
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
                        className="btn btn-sm btn-danger"
                        onClick={() => openGradeModal(g)}
                      >
                        Calificar/editar
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

        {selectedGrade && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content p-4">
                <div className="modal-header">
                  <h5 className="modal-title">Calificar tarea</h5>
                  <button className="btn-close" onClick={() => setSelectedGrade(null)}></button>
                </div>

                <div className="modal-body">
                  <p><strong>Estudiante:</strong> {selectedGrade.student_name}</p>
                  <p><strong>Entrega:</strong></p>

                  {selectedGrade.link ? (
                    <div className="d-flex align-items-center gap-2">
                      <input className="form-control" value={selectedGrade.link} disabled />
                      <a
                        href={selectedGrade.link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-secondary"
                      >
                        Ir
                      </a>
                    </div>
                  ) : selectedGrade.file ? (
                    <div className="text-center">
                      <i className="bi bi-file-earmark-text fs-1"></i>
                      <p className="small">{selectedGrade.file_name}</p>
                    </div>
                  ) : (
                    <p className="text-muted">No hay entrega registrada.</p>
                  )}

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
                  <button className="btn btn-danger" onClick={saveGrade}>Guardar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // STUDENT VIEW
  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center">Mis Tareas</h3>

      {assignments.map((task) => (
        <div key={task.id} className="bg-light p-3 mb-3 rounded shadow-sm">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5>{task.title}</h5>
              <p className="text-muted">{task.description}</p>
            </div>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
            >
              {expandedTaskId === task.id ? "Ocultar" : "Ver tarea"}
            </button>
          </div>

          {expandedTaskId === task.id && (
            <div className="mt-3">
              <p><strong>Fecha de entrega:</strong> {task.due_date}</p>

              <div className="mb-3">
                <p><strong>Recursos:</strong></p>
                <div className="d-flex gap-3">
                  <i className="bi bi-file-earmark fs-3"></i>
                  <i className="bi bi-filetype-pdf fs-3"></i>
                  <i className="bi bi-film fs-3"></i>
                </div>
              </div>

              <button
                className="btn btn-danger rounded-pill px-4"
                onClick={() => setShowModal(true)}
              >
                Agregar entrega
              </button>
            </div>
          )}
        </div>
      ))}

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content p-4">
              <div className="modal-header border-0">
                <h5 className="modal-title">Agregar Entrega</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body text-center">
                <div className="btn-group mb-3 rounded-pill">
                  <button
                    className={`btn ${uploadType === "file" ? "btn-danger" : "btn-light"}`}
                    onClick={() => setUploadType("file")}
                  >
                    Archivo
                  </button>
                  <button
                    className={`btn ${uploadType === "link" ? "btn-danger" : "btn-light"}`}
                    onClick={() => setUploadType("link")}
                  >
                    Enlace
                  </button>
                </div>

                {uploadType === "file" ? (
                  <>
                    <label className="btn btn-outline-dark rounded-pill">
                      Seleccionar archivo
                      <input type="file" hidden />
                    </label>
                  </>
                ) : (
                  <>
                    <input
                      className="form-control rounded-pill mb-3"
                      placeholder="Pegar enlace"
                    />
                    <button className="btn btn-outline-dark rounded-pill">
                      <i className="bi bi-clipboard"></i>
                    </button>
                  </>
                )}

                <div className="mt-4">
                  <button
                    className="btn btn-danger rounded-pill px-4"
                    onClick={() => setShowModal(false)}
                  >
                    Guardar entrega
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

export default GradesPage;
