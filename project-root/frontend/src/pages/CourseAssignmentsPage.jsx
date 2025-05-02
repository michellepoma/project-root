// frontend/src/pages/CourseAssignmentsPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useProfile from "../hooks/useProfile";
import api from "../api/axiosConfig";

function CourseAssignmentsPage() {
  const user = useProfile();
  const { id } = useParams();

  const [assignments, setAssignments] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [uploadType, setUploadType] = useState("file");

  const [showMainModal, setShowMainModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "", due_date: "" });

  const [openTaskId, setOpenTaskId] = useState(null);

  useEffect(() => {
    if (id) {
      api.get(`/assignments/?course=${id}`)
        .then((res) => setAssignments(res.data))
        .catch((err) => console.error("Error cargando tareas:", err));
    }
  }, [id]);

  const handleCreateAssignment = async () => {
    try {
      const payload = {
        ...newAssignment,
        course: id
      };
      await api.post("/assignments/", payload);
      setShowMainModal(false);
      setNewAssignment({ title: "", description: "", due_date: "" });
      const res = await api.get(`/assignments/?course=${id}`);
      setAssignments(res.data);
    } catch (error) {
      console.error("Error creando tarea:", error);
    }
  };

  // VISTA STUDENT
  if (user?.role === "student") {
    return (
      <div className="row">
        <div className="col-md-3 bg-light p-3">
          <h6 className="mb-3">Tareas Pendientes</h6>
          <ul className="list-group border-0">
            {assignments.map((tarea) => (
              <li
                key={tarea.id}
                className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-2"
                style={{ borderRadius: "0.5rem", border: "none",wordWrap: "break-word",}}
              >
                <div className="d-flex align-items-start w-100">
                  <i className="bi bi-folder me-2 mt-1 text-primary"></i>
                  <span
                    className="text-truncate"
                    style={{maxWidth: "100%", whiteSpace: "normal", fontWeight: 500,}}
                  >
                    {tarea.title}
                  </span>
                </div>
                <small className="text-muted text-end w-100 w-md-auto">
                  {tarea.due_date}
                </small>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-9 py-3">
          {assignments.map((task) => {
            const isOpen = openTaskId === task.id;
            return (
              <div key={task.id} className="bg-light p-4 rounded-4 mb-3 shadow-sm">
                {/* Encabezado */}
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{task.title}</strong>
                    <p className="text-muted mb-1">{task.description}</p>
                  </div>
                  <button
                    className="btn btn-outline-secondary btn-sm rounded-pill"
                    onClick={() => setOpenTaskId(isOpen ? null : task.id)}
                  >
                    {isOpen ? "Ocultar" : "Ver tarea"}
                  </button>
                </div>

                {/* Contenido expandido */}
                {isOpen && (
                  <div className="mt-3">
                    {/* Recursos */}
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <i className="bi bi-file-earmark fs-4"></i>
                      <i className="bi bi-filetype-pdf fs-4"></i>
                      <i className="bi bi-film fs-4"></i>
                    </div>

                    {/* Fecha entrega */}
                    <p className="text-muted mb-3">
                      <i className="bi bi-calendar-event me-2"></i>
                      Fecha de entrega: <strong>{task.due_date}</strong>
                    </p>

                    {/* Botón entregar tarea */}
                    <button
                      className="btn btn-danger rounded-pill px-4"
                      onClick={() => setShowStudentModal(true)}
                    >
                      Agregar tarea
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showStudentModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content rounded-4 p-4">
                <div className="modal-header border-0">
                  <h5 className="modal-title">Agregar tarea</h5>
                  <button className="btn-close" onClick={() => setShowStudentModal(false)}></button>
                </div>
                <div className="modal-body">
                  <p className="mb-2">Subir archivo / enlace:</p>

                  <div className="btn-group mb-3 rounded-pill overflow-hidden">
                    <button
                      className={`btn ${uploadType === "link" ? "btn-danger" : "btn-light"}`}
                      onClick={() => setUploadType("link")}
                    >
                      enlace
                    </button>
                    <button
                      className={`btn ${uploadType === "file" ? "btn-danger" : "btn-light"}`}
                      onClick={() => setUploadType("file")}
                    >
                      archivo
                    </button>
                  </div>

                  {uploadType === "link" ? (
                    <input
                      className="form-control rounded-pill mb-3"
                      placeholder="Copy enlace / poner enlace"
                    />
                  ) : (
                    <div className="bg-light rounded-4 p-4 d-flex flex-column align-items-center">
                      <i className="bi bi-file-earmark-text fs-1 mb-2"></i>
                      <label className="btn btn-outline-dark rounded-pill">
                        Agregar / buscar
                        <input type="file" hidden />
                      </label>
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <button
                      className="btn btn-danger rounded-pill px-4"
                      onClick={() => setShowStudentModal(false)}
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

  // VISTA TEACHER
  if (user?.role === "teacher") {
    return (
      <div className="row">
        <div className="col-md-3 bg-light p-3">
          <h6 className="mb-3">Tareas Pendientes</h6>
          <ul className="list-group border-0">
            {assignments.map((tarea) => (
              <li
                key={tarea.id}
                className="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-2"
                style={{ borderRadius: "0.5rem", border: "none",wordWrap: "break-word",}}
              >
                <div className="d-flex align-items-start w-100">
                  <i className="bi bi-folder me-2 mt-1 text-primary"></i>
                  <span
                    className="text-truncate"
                    style={{maxWidth: "100%", whiteSpace: "normal", fontWeight: 500,}}
                  >
                    {tarea.title}
                  </span>
                </div>
                <small className="text-muted text-end w-100 w-md-auto">
                  {tarea.due_date}
                </small>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-9 py-3">
          <div className="d-flex justify-content-end mb-4">
            <button
              className="btn btn-danger rounded-pill d-flex align-items-center gap-2 px-4"
              onClick={() => setShowMainModal(true)}
            >
              <i className="bi bi-plus-lg"></i> Agregar tarea
            </button>
          </div>

          {assignments.map((task) => (
            <div
              key={task.id}
              className="bg-light p-4 rounded-pill mb-3 d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{task.title}</strong>
                <p className="mb-0 text-muted">{task.description}</p>
              </div>
              <button
                className="btn btn-danger rounded-pill"
                onClick={() => setShowMainModal(true)}
              >
                Editar tarea
              </button>
            </div>
          ))}
        </div>

        {/* Modal para crear tarea */}
        {showMainModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content rounded-4 p-4">
                <div className="modal-header border-0">
                  <h5 className="modal-title">Agregar Tarea</h5>
                  <button className="btn-close" onClick={() => setShowMainModal(false)}></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-3 rounded-pill"
                    placeholder="Título"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  />
                  <textarea
                    className="form-control mb-3 rounded-pill"
                    placeholder="Descripción"
                    rows={2}
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  ></textarea>
                  <input
                    type="date"
                    className="form-control mb-3 rounded-pill"
                    value={newAssignment.due_date}
                    onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                  />
                  <div className="mb-3">
                    <strong className="d-block mb-2">Agregar recurso</strong>
                    <div className="btn-group rounded-pill overflow-hidden mb-2">
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
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setNewAssignment({ ...newAssignment, file: e.target.files[0] })}
                      />
                    ) : (
                      <input
                        type="text"
                        className="form-control"
                        placeholder="https://..."
                        value={newAssignment.link || ""}
                        onChange={(e) => setNewAssignment({ ...newAssignment, link: e.target.value })}
                      />
                    )}
                  </div>


                  <div className="text-center">
                    <button className="btn btn-danger rounded-pill px-4" onClick={handleCreateAssignment}>Guardar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default CourseAssignmentsPage;
