import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import "@/styles/CourseFormModal.css";

const daysOfWeek = [
  { label: "Lunes", value: "mon" },
  { label: "Martes", value: "tue" },
  { label: "Miércoles", value: "wed" },
  { label: "Jueves", value: "thu" },
  { label: "Viernes", value: "fri" },
  { label: "Sábado", value: "sat" },
  { label: "Domingo", value: "sun" },
];

function CourseFormModal({
  show,
  onClose,
  onRefresh,
  editingCourse,
  teachers,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subject_code: "",
    teacher: "",
    schedules: [],
  });

  const [tempSchedules, setTempSchedules] = useState([]);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        name: editingCourse.name || "",
        description: editingCourse.description || "",
        subject_code: editingCourse.subject_code || "",
        teacher: editingCourse.teacher || "",
        schedules: editingCourse.schedules || [],
      });
      setTempSchedules(editingCourse.schedules || []);
    } else {
      setFormData({
        name: "",
        description: "",
        subject_code: "",
        teacher: "",
        schedules: [],
      });
      setTempSchedules([]);
    }
    setFormError("");
  }, [editingCourse, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index, field, value) => {
    const updated = [...tempSchedules];
    updated[index][field] = value;
    setTempSchedules(updated);
  };

  const addSchedule = () => {
    const newSchedule = { day: "", start_time: "", end_time: "" };
    setTempSchedules((prev) => [...prev, newSchedule]);
  };

  const removeSchedule = (index) => {
    setTempSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.name || !formData.description || !formData.subject_code) {
      setFormError("Por favor, completa todos los campos del formulario.");
      return false;
    }
    if (!formData.teacher) {
      setFormError("Debes seleccionar un docente.");
      return false;
    }
    for (let s of tempSchedules) {
      if (!s.day || !s.start_time || !s.end_time) {
        setFormError("Todos los horarios deben estar completos.");
        return false;
      }
      if (s.end_time <= s.start_time) {
        setFormError(`Horario no válido. La hora de fin debe ser mayor a la de inicio.`);
        return false;
      }
      if (s.end_time === s.start_time) {
        setFormError(`La hora de inicio y fin no pueden ser iguales.`);
        return false;
      }
    }
    setFormError("");
    return true;
  };
  const onSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      ...formData,
      teacher: formData.teacher,
      schedules: tempSchedules,
    };

    try {
      if (editingCourse) {
        await api.put(`/courses/courses/${editingCourse.id}/`, payload);
      } else {
        await api.post("/courses/courses/", payload);
      }
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Error al guardar curso:", err);
      setFormError("Hubo un error al guardar el curso.");
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-overlay"></div>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 999 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{editingCourse ? "Editar Curso" : "Nuevo Curso"}</h5>
              <button className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
            </div>

            {formError && (
              <div className="alert alert-danger py-2 px-3">{formError}</div>
            )}

            <div className="modal-body">
              <input
                name="name"
                className="form-control mb-2"
                placeholder="Nombre del curso"
                value={formData.name}
                onChange={handleChange}
              />
              <input
                name="description"
                className="form-control mb-2"
                placeholder="Descripción"
                value={formData.description}
                onChange={handleChange}
              />
              <input
                name="subject_code"
                className="form-control mb-2"
                placeholder="Sigla"
                value={formData.subject_code}
                onChange={handleChange}
              />

              <select
                name="teacher"
                className="form-select mb-2 select-docente"
                value={formData.teacher}
                onChange={handleChange}
              >
                <option value="">Seleccionar docente</option>
                {(Array.isArray(teachers) ? teachers : []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.first_name} {t.last_name}
                  </option>
                ))}
              </select>

              <div className="mb-2">
                {tempSchedules.map((sched, idx) => (
                  <div key={idx} className="d-flex align-items-center mb-1">
                    <select
                      className="form-select me-2 select-dia"
                      value={sched.day}
                      onChange={(e) => handleScheduleChange(idx, "day", e.target.value)}
                    >
                      <option value="">Día</option>
                      {daysOfWeek.map((day) => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="time"
                      className="form-control me-2"
                      value={sched.start_time}
                      onChange={(e) => handleScheduleChange(idx, "start_time", e.target.value)}
                    />
                    <input
                      type="time"
                      className="form-control me-2"
                      value={sched.end_time}
                      onChange={(e) => handleScheduleChange(idx, "end_time", e.target.value)}
                    />
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeSchedule(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button className="btn-add-schedule mt-2" onClick={addSchedule}>
                  Añadir horario
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={onSubmit}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseFormModal;
