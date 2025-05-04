import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";

function CourseSchedulePage() {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [scheduledClasses, setScheduledClasses] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [link, setLink] = useState("");
  const [time, setTime] = useState("");
  const [className, setClassName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editClassId, setEditClassId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    setScheduledClasses([
      { id: 1, date: "2025-08-17", time: "10:00", link: "https://zoom.us/abc", className: "Clase 1" },
      { id: 2, date: "2025-08-18", time: "14:00", link: "https://meet.google.com/xyz", className: "Clase 2" },
    ]);

    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/courses/");
        setCourses(res.data);
      } catch (error) {
        console.error("Error al cargar cursos:", error);
      }
    };

    if (user) fetchCourses();
  }, [user]);

  const handleSave = () => {
    const newClass = {
      id: isEditing ? editClassId : Date.now(),
      date: selectedDate,
      time,
      link,
      className,
    };

    if (isEditing) {
      setScheduledClasses((prev) => prev.map((cls) => (cls.id === editClassId ? newClass : cls)));
    } else {
      setScheduledClasses((prev) => [...prev, newClass]);
    }

    setSelectedDate("");
    setTime("");
    setLink("");
    setClassName("");
    setIsEditing(false);
    setEditClassId(null);
    setModalOpen(false);
  };

  const handleEdit = (cls) => {
    setSelectedDate(cls.date);
    setTime(cls.time);
    setLink(cls.link);
    setClassName(cls.className);
    setIsEditing(true);
    setEditClassId(cls.id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    setScheduledClasses((prev) => prev.filter((cls) => cls.id !== deleteTargetId));
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  };

  const handleOpenModal = () => {
    setSelectedDate("");
    setTime("");
    setLink("");
    setClassName("");
    setIsEditing(false);
    setEditClassId(null);
    setModalOpen(true);
  };

  if (loading) return <p className="text-center mt-4">Cargando usuario...</p>;
  if (!user) return <Navigate to="/unauthorized" />;
  if (user.role !== "student" && user.role !== "teacher") return <Navigate to="/unauthorized" />;

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center">
        {user.role === "teacher" ? "Programar Clases" : "Clases Programadas"}
      </h3>

      {user.role === "teacher" && (
        <>
          <div className="text-end mb-3">
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleOpenModal}>
              <i className="bi bi-plus-lg"></i> Programar clase
            </button>
          </div>

          <div className="d-flex flex-column align-items-center gap-3">
            {scheduledClasses.map((cls) => (
              <div key={cls.id} className="p-4 rounded-4 shadow-sm bg-white bg-opacity-75 w-100" style={{ maxWidth: "600px" }}>
                <h5>{cls.className}</h5>
                <p><i className="bi bi-calendar-event me-2"></i> Fecha: {cls.date}</p>
                <p><i className="bi bi-clock me-2"></i> Hora: {cls.time}</p>
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
                  <button className="btn btn-outline-danger" onClick={() => handleDelete(cls.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {user.role === "student" && (
        <div className="d-flex flex-column align-items-center gap-3">
          {scheduledClasses.map((cls) => (
            <div key={cls.id} className="p-4 rounded-4 shadow-sm bg-white bg-opacity-75 w-100" style={{ maxWidth: "600px" }}>
              <h5>{cls.className}</h5>
              <p><i className="bi bi-calendar-event me-2"></i> Fecha: {cls.date}</p>
              <p><i className="bi bi-clock me-2"></i> Hora: {cls.time}</p>
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

      {/* Modal Programar / Editar */}
      {modalOpen && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-4">
              <div className="modal-header border-0">
                <h5 className="modal-title">{isEditing ? "Editar Clase" : "Programar Clase"}</h5>
                <button className="btn-close" onClick={() => setModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <select value={className} onChange={(e) => setClassName(e.target.value)} className="form-select mb-3">
                  <option value="">Selecciona una clase</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.name}>{course.name}</option>
                  ))}
                </select>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="form-control mb-3" />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="form-control mb-3" />
                <input type="text" placeholder="Link de la clase" value={link} onChange={(e) => setLink(e.target.value)} className="form-control mb-3" />
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
                <button className="btn-close" onClick={() => setDeleteConfirmOpen(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar esta clase?</p>
                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-secondary" onClick={() => setDeleteConfirmOpen(false)}>Cancelar</button>
                  <button className="btn btn-danger" onClick={confirmDelete}>Eliminar</button>
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
