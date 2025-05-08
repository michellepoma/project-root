import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { formatToLocal } from "../utils/time";
import { DateTime } from "luxon";

function CourseSchedulePage() {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [scheduledClasses, setScheduledClasses] = useState([]);
  const [dateTime, setDateTime] = useState("");
  const [link, setLink] = useState("");
  const [courseId, setCourseId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editClassId, setEditClassId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const filteredClasses = Array.isArray(scheduledClasses)
  ? scheduledClasses.filter((cls) => {
      const classDate = DateTime.fromISO(cls.datetime).startOf("day");
      const today = DateTime.now().setZone("America/La_Paz").startOf("day");
      return classDate >= today;
    })
  : [];


  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/courses/");
        setCourses(res.data);
      } catch (error) {
        console.error("Error al cargar cursos:", error);
      }
    };

    const fetchScheduled = async () => {
      try {
        const res = await api.get("/courses/scheduled-classes/");
        const data = Array.isArray(res.data) ? res.data : res.data.results || [];
setScheduledClasses(data);
      } catch (error) {
        console.error("Error al cargar clases:", error);
      }
    };

    if (user) {
      fetchCourses();
      fetchScheduled();
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const payload = {
        course_id: parseInt(courseId),
        datetime: new Date(dateTime).toISOString(),
        link,
      };
      console.log("Payload que se envía:", payload);

      if (isEditing) {
        await api.patch(`/courses/scheduled-classes/${editClassId}/`, payload);
        setSuccessMsg("Clase editada exitosamente.");
      } else {
        await api.post("/courses/scheduled-classes/", payload);
        setSuccessMsg("Clase programada exitosamente.");
      }

      const res = await api.get("/courses/scheduled-classes/");
      setScheduledClasses(res.data);

      resetForm();
    } catch (error) {
      console.error("Error guardando clase:", error);
    }
  };

  const resetForm = () => {
    setDateTime("");
    setLink("");
    setCourseId("");
    setIsEditing(false);
    setEditClassId(null);
    setModalOpen(false);
  };

  const handleEdit = (cls) => {
    setDateTime(cls.datetime.slice(0, 16));
    setLink(cls.link);
    setCourseId(cls.course_id.toString());
    setIsEditing(true);
    setEditClassId(cls.id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/courses/scheduled-classes/${id}/`);
      setScheduledClasses((prev) => prev.filter((cls) => cls.id !== id));
      setSuccessMsg("Clase eliminada exitosamente.");
    } catch (error) {
      console.error("Error eliminando clase:", error);
    }
    setDeleteConfirmOpen(false);
  };

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  if (loading) return <p className="text-center mt-4">Cargando usuario...</p>;
  if (!user) return <Navigate to="/unauthorized" />;
  if (user.role !== "student" && user.role !== "teacher")
    return <Navigate to="/unauthorized" />;

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center">
        {user.role === "teacher" ? "Programar Clases" : "Clases Programadas"}
      </h3>

      {successMsg && (
        <div className="alert alert-success text-center">{successMsg}</div>
      )}

      {user.role === "teacher" && (
        <>
          <div className="text-end mb-3">
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => setModalOpen(true)}
            >
              <i className="bi bi-plus-lg"></i> Programar clase
            </button>
          </div>

          <div className="d-flex flex-column align-items-center gap-3">
            {filteredClasses.map((cls) => (
              <div key={cls.id} className="p-4 rounded-4 shadow-sm bg-white bg-opacity-75 w-100" style={{ maxWidth: "600px" }}>
                <h5>{cls.className}</h5>
                <p><i className="bi bi-calendar-event me-2"></i>Fecha y hora: {formatToLocal(cls.datetime)}</p>
                <p className="d-flex align-items-center gap-2">
                  <i className="bi bi-link-45deg"></i>
                  Link:
                  <a href={cls.link} target="_blank" rel="noopener noreferrer" className="text-break">
                    {cls.link}
                  </a>
                  <button
                    className="btn btn-sm btn-outline-secondary ms-2"
                    onClick={() => navigator.clipboard.writeText(cls.link)}
                    title="Copiar enlace"
                    style={{ borderRadius: "50%" }}
                  >
                    <i className="bi bi-copy"></i>
                  </button>
                </p>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button className="btn btn-outline-secondary" onClick={() => handleEdit(cls)}>Editar</button>
                  <button className="btn btn-outline-danger" onClick={() => {
                      setEditClassId(cls.id);
                      setDeleteConfirmOpen(true);
                    }}>Eliminar</button>
                </div>
              </div>
            ))}
            {filteredClasses.length === 0 && (
              <p className="text-muted text-center mt-3">
                No hay clases programadas próximas.
              </p>
            )}
          </div>
        </>
      )}

      {user.role === "student" && (
        <div className="d-flex flex-column align-items-center gap-3">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="p-4 rounded-4 shadow-sm bg-white bg-opacity-75 w-100" style={{ maxWidth: "600px" }}>
              <h5>{cls.className}</h5>
              <p><i className="bi bi-calendar-event me-2"></i>Fecha y hora: {formatToLocal(cls.datetime)}</p>
              <p className="d-flex align-items-center gap-2">
                <i className="bi bi-link-45deg"></i>
                Link:
                <a href={cls.link} target="_blank" rel="noopener noreferrer" className="text-break">
                  {cls.link}
                </a>
                <button
                  className="btn btn-sm btn-outline-secondary ms-2"
                  onClick={() => navigator.clipboard.writeText(cls.link)}
                  title="Copiar enlace"
                  style={{ borderRadius: "50%" }}
                >
                  <i className="bi bi-copy"></i>
                </button>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-4">
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  {isEditing ? "Editar Clase" : "Programar Clase"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="form-select mb-3"
                >
                  <option value="">Selecciona una clase</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name}
                    </option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="form-control mb-3"
                />
                <input
                  type="text"
                  placeholder="Link de la clase"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="form-control mb-3"
                />
                <button className="btn btn-primary w-100" onClick={handleSave}>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {deleteConfirmOpen && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-4">
              <div className="modal-header border-0">
                <h5 className="modal-title">Eliminar clase programada</h5>
                <button
                  className="btn-close"
                  onClick={() => setDeleteConfirmOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar esta clase?</p>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setDeleteConfirmOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(editClassId)}
                  >
                    Eliminar
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

export default CourseSchedulePage;
