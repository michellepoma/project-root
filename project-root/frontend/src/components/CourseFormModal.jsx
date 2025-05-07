import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

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

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        name: editingCourse.name || "",
        description: editingCourse.description || "",
        subject_code: editingCourse.subject_code || "",
        teacher: editingCourse.teacher || "",
        schedules: editingCourse.schedules || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        subject_code: "",
        teacher: "",
        schedules: [],
      });
    }
  }, [editingCourse]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index, field, value) => {
    const updated = [...formData.schedules];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, schedules: updated }));
  };

  const addSchedule = () => {
    const newSchedule = { day: "mon", start_time: "14:00", end_time: "16:00" };

    // Validación: ¿ya existe ese horario exacto?
    const duplicate = formData.schedules.some(
      (s) =>
        s.day === newSchedule.day &&
        s.start_time === newSchedule.start_time &&
        s.end_time === newSchedule.end_time
    );

    if (duplicate) {
      alert("Este horario ya ha sido agregado.");
      return;
    }

    // Validación: ¿hora de fin menor o igual a inicio?
    if (newSchedule.end_time <= newSchedule.start_time) {
      alert("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    // Si pasa ambas validaciones, agregar
    setFormData((prev) => ({
      ...prev,
      schedules: [...prev.schedules, newSchedule],
    }));
  };

  const removeSchedule = (index) => {
    const updated = formData.schedules.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, schedules: updated }));
  };

  const handleSubmit = async () => {
    //console.log(formData.schedules);
    for (let s of formData.schedules) {
      if (!s.day || !s.start_time || !s.end_time) {
        alert("Todos los horarios deben estar completos.");
        return;
      }

      if (s.end_time <= s.start_time) {
        alert(
          `El horario del día "${s.day.toUpperCase()}" tiene una hora de fin menor o igual a la de inicio.`
        );
        return;
      }
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      subject_code: formData.subject_code,
      schedules: formData.schedules,
    };

    if (formData.teacher) {
      payload.teacher = formData.teacher;
    }    

    console.log("Payload enviado:", payload);

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
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editingCourse ? "Editar Curso" : "Nuevo Curso"}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

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
              className="form-select mb-2"
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
              <label className="form-label">Horarios</label>
              {formData.schedules.map((sched, idx) => (
                <div key={idx} className="d-flex align-items-center mb-1">
                  <select
                    className="form-select me-2"
                    value={sched.day}
                    onChange={(e) =>
                      handleScheduleChange(idx, "day", e.target.value)
                    }
                  >
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
                    onChange={(e) =>
                      handleScheduleChange(idx, "start_time", e.target.value)
                    }
                  />
                  <input
                    type="time"
                    className="form-control me-2"
                    value={sched.end_time}
                    onChange={(e) =>
                      handleScheduleChange(idx, "end_time", e.target.value)
                    }
                  />
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => removeSchedule(idx)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={addSchedule}
              >
                Añadir horario
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-danger" onClick={handleSubmit}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseFormModal;
