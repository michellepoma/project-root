// ✅ Tareas de cursos
// frontend/src/pages/CourseAssignmentsPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { formatToLocal, getTimeRemaining } from "../utils/time";
import SubmissionModal from "../components/SubmissionModal";
import { DateTime } from "luxon";
import "@/styles/CourseAssignmentsPage.css";

function CourseAssignmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { id } = useParams();

  const [assignments, setAssignments] = useState([]);
  const [openTaskId, setOpenTaskId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [editingTask, setEditingTask] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [submissions, setSubmissions] = useState({});

  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [currentAssignmentId, setCurrentAssignmentId] = useState(null);
  const [isEditingSubmission, setIsEditingSubmission] = useState(false);


  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    due_date: "",
    attachment: null,
    link: "",
  });

  const fetchAssignments = useCallback(async () => {
    try {
      const response = await api.get(
        `/assignments/assignments/?course=${id}`
      );
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setAssignments(data);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchAssignments();
  }, [id, fetchAssignments]);

  const isDue = (dueDate) => {
    const now = DateTime.now().setZone("America/La_Paz");
    const due = DateTime.fromISO(dueDate, { zone: "utc" }).setZone(
      "America/La_Paz"
    );
    return now < due;
  };

  const ResourceBlock = ({ task }) =>
    (task.attachment || task.link) && (
      <div className="mt-2 d-flex flex-column gap-2">
        {task.attachment && (
          <a
            href={task.attachment}
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none d-flex align-items-center gap-2"
          >
            <i className="bi bi-file-earmark-text-fill fs-5"></i>
            <span className="text-truncate small" style={{ maxWidth: 250 }}>
              Ver archivo adjunto
            </span>
          </a>
        )}
        {task.link && task.link.trim() !== "" && (
          <a
            href={task.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none d-flex align-items-center gap-2"
          >
            <i className="bi bi-link-45deg fs-5"></i>
            <span className="text-truncate small" style={{ maxWidth: 250 }}>
              {task.link}
            </span>
          </a>
        )}
      </div>
    );

  const handleCreateOrEditAssignment = async () => {
    try {
      const formData = new FormData();
      formData.append("title", newAssignment.title || "");
      formData.append("description", newAssignment.description || "");
      formData.append("due_date", newAssignment.due_date);
      formData.append("course", id);

      if (newAssignment.attachment) {
        formData.append("attachment", newAssignment.attachment);
      }
      if (newAssignment.link && newAssignment.link.trim() !== "") {
        formData.append("link", newAssignment.link);
      }

      if (editingTask) {
        await api.patch(
          `/assignments/assignments/${editingTask.id}/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        await api.post("/assignments/assignments/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setShowModal(false);
      setEditingTask(null);
      setNewAssignment({
        title: "",
        description: "",
        due_date: "",
        attachment: null,
        link: "",
      });
      fetchAssignments();
    } catch (error) {
      console.error("Error guardando tarea:", error);
    }
  };

  const handleDeleteAssignment = async (taskId) => {
    try {
      await api.delete(`/assignments/assignments/${taskId}/`);
      fetchAssignments();
    } catch (err) {
      console.error("Error eliminando tarea:", err);
    }
  };
  //Funciones de Estudiante
  
  const fetchSubmissions = async (assignmentId) => {
    try {
      const res = await api.get(`/assignments/submissions/?assignment=${assignmentId}`);
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setSubmissions((prev) => ({ ...prev, [assignmentId]: data }));
    } catch (err) {
      console.error("Error al cargar entregas:", err);
    }
  };

  
  if (authLoading)
    return <div className="text-center mt-5">Cargando usuario...</div>;

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setNewAssignment({
      title: "",
      description: "",
      due_date: "",
      attachment: null,
      link: "",
    });
  };

  // ===== Estudiante =====
  if (user?.role === "student") {
    return (
      <div className="container py-4">
      <h4>Tareas del curso</h4>
      {assignments.map((task) => {
        const isOpen = openTaskId === task.id;
        const stillOpen = isDue(task.due_date);
        const submissionList = submissions[task.id] || [];
        const hasSubmitted = Array.isArray(submissionList) && submissionList.some((s) => s.student === user.id);

        return (
          <div key={task.id} className="assignment-card">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <strong>{task.title}</strong>
                <p>{task.description}</p>
              </div>
              <button
                className="btn-orange btn-toggle"
                onClick={() => {
                  setOpenTaskId(isOpen ? null : task.id);
                  fetchSubmissions(task.id);
                }}
              >
                {isOpen ? "Ocultar" : "Ver tarea"}
              </button>
            </div>

            {isOpen && (
              <div className="mt-3">
                <p>
                  <i className="bi bi-calendar-event me-2"></i>
                  Fecha límite: <strong>{formatToLocal(task.due_date)}</strong>
                  <br />
                  <span className="text-muted">{getTimeRemaining(task.due_date)}</span>
                </p>
                {stillOpen ? (
                  hasSubmitted ? (
                    <button
                      className="btn-orange btn-upload"
                      onClick={() => {
                        setIsEditingSubmission(true);
                        setCurrentAssignmentId(task.id);
                        setShowSubmissionModal(true);
                      }}
                    >
                      Modificar entrega
                    </button>
                  ) : (
                    <button
                      className="btn-orange btn-upload"
                      onClick={() => {
                        setIsEditingSubmission(false);
                        setCurrentAssignmentId(task.id);
                        setShowSubmissionModal(true);
                      }}
                    >
                      Subir entrega
                    </button>
                  )
                ) : (
                  <p className="text-danger">Plazo vencido. Ya no puedes entregar.</p>
                )}
              </div>
            )}
          </div>
        );
      })}

      <SubmissionModal
        show={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        isEditing={isEditingSubmission}
        currentAssignmentId={currentAssignmentId}
        submissions={submissions}
        user={user}
        fetchSubmissions={fetchSubmissions}
      />
    </div>
    );

  
  }
    

  // ===== Profesor =====
  if (user?.role === "teacher") {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Tareas del curso</h4>
          <button
            className="btn-orange btn-new"
            onClick={() => setShowModal(true)}
          >
            + Nueva tarea
          </button>
        </div>

        {assignments.map((task) => (
          <div
            key={task.id}
            className="assignment-card d-flex justify-content-between align-items-start"
          >
            <div>
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <ResourceBlock task={task} />
              <small className="text-muted">
                Entrega: {formatToLocal(task.due_date)}
              </small>
            </div>
            <div className="d-flex gap-2">
              <button
                className="icon-btn edit"
                onClick={() => {
                  setEditingTask(task);
                  setNewAssignment({
                    title: task.title || "",
                    description: task.description || "",
                    due_date: (task.due_date || "").slice(0, 16),
                    attachment: null,
                    link: task.link || "",
                  });
                  setShowModal(true);
                }}
              >
                <i className="bi bi-pencil-fill"></i>
              </button>
              <button
                className="icon-btn delete"
                onClick={() => {
                  setTaskToDelete(task);
                  setShowDeleteConfirm(true);
                }}
              >
                <i className="bi bi-trash-fill"></i>
              </button>
            </div>
          </div>
        ))}

        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content rounded-4 p-4">
                <div className="modal-header border-0">
                  <h5 className="modal-title">
                    {editingTask ? "Editar Tarea" : "Nueva Tarea"}
                  </h5>
                  <button
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-3"
                    placeholder="Título"
                    value={newAssignment.title}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        title: e.target.value,
                      })
                    }
                  />
                  <textarea
                    className="form-control mb-3"
                    placeholder="Descripción"
                    value={newAssignment.description}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        description: e.target.value,
                      })
                    }
                  ></textarea>
                  <input
                    type="datetime-local"
                    className="form-control mb-3"
                    value={newAssignment.due_date}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        due_date: e.target.value,
                      })
                    }
                  />

                  <label className="form-label mt-3">Archivo (opcional)</label>
                  <input
                    type="file"
                    className="form-control mb-3"
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        attachment: e.target.files[0],
                      })
                    }
                  />

                  <label className="form-label">Enlace (opcional)</label>
                  <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="https://..."
                    value={newAssignment.link}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        link: e.target.value,
                      })
                    }
                  />

                  <div className="text-center">
                    <button
                      className="btn-orange btn-save"
                      onClick={handleCreateOrEditAssignment}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && taskToDelete && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 p-4">
                <div className="modal-header">
                  <h5 className="modal-title">¿Eliminar tarea?</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowDeleteConfirm(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    ¿Estás seguro de que deseas eliminar la tarea{" "}
                    <strong>{taskToDelete.title}</strong>? Esta acción no se
                    puede deshacer.
                  </p>
                </div>
                <div className="modal-footer d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-orange btn-delete-confirm"
                    onClick={async () => {
                      await handleDeleteAssignment(taskToDelete.id);
                      setShowDeleteConfirm(false);
                      setTaskToDelete(null);
                    }}
                  >
                    Eliminar
                  </button>
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
