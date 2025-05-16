import React, { useState, useEffect } from "react";
import api from "../api/axiosConfig";

function GradeModal({ show, onClose, submission, fetchGrades }) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (submission) {
      // Si ya existe una calificación, la cargamos (si no, dejamos en 0)
      setScore(submission.grade?.score || 0);
    }
  }, [submission]);

  if (!show || !submission) return null;

  const handleSave = async () => {
    const payload = {
      assignment: submission.assignment,
      student: submission.student,
      score: score,
      feedback: ""  // Puedes agregar un input si quieres manejar feedback
    };

    try {
      // Llamamos al backend con POST, él decidirá si crea o actualiza gracias al update_or_create.
      await api.post("/assignments/grades/", payload);

      alert("Calificación guardada correctamente.");
      onClose();
      if (fetchGrades) fetchGrades(submission.assignment);
    } catch (err) {
      console.error("Error al guardar calificación:", err);
      alert("Error al guardar la calificación.");
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content p-4">
          <div className="modal-header">
            <h5 className="modal-title">Calificar Entrega</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>
              <strong>Estudiante:</strong> {submission.student_name}
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
            <button className="btn-orange" onClick={handleSave}>
              Guardar Calificación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GradeModal;
