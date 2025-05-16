import React, { useState } from "react";
import api from "../api/axiosConfig";

function SubmissionModal({
  show,
  onClose,
  isEditing,
  currentAssignmentId,
  submissions,
  user,
  fetchSubmissions,
}) {
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);

  if (!show) return null;

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("assignment", currentAssignmentId);
    formData.append("content", submissionContent);
    if (submissionFile) formData.append("file", submissionFile);

    try {
      if (isEditing) {
        const submissionList = submissions[currentAssignmentId] || [];
        const submission = submissionList.find((s) => s.student === user.id);

        if (!submission) {
          alert("No se encontró la entrega para modificar.");
          return;
        }

        await api.put(`/assignments/submissions/${submission.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Entrega actualizada con éxito.");
      } else {
        await api.post("/assignments/submissions/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Entrega realizada con éxito.");
      }

      onClose();
      setSubmissionContent("");
      setSubmissionFile(null);
      fetchSubmissions(currentAssignmentId);
    } catch (err) {
      console.error("Error al enviar entrega:", err);
      alert("Error al procesar la entrega.");
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-md modal-dialog-centered">
        <div className="modal-content p-4">
          <div className="modal-header">
            <h5 className="modal-title">
              {isEditing ? "Modificar Entrega" : "Subir Entrega"}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <textarea
              className="form-control mb-3"
              placeholder="Escribe algún comentario o contenido (opcional)..."
              value={submissionContent}
              onChange={(e) => setSubmissionContent(e.target.value)}
            ></textarea>

            <label className="form-label">Archivo (opcional)</label>
            <input
              type="file"
              className="form-control mb-3"
              onChange={(e) => setSubmissionFile(e.target.files[0])}
            />

            <div className="text-center">
              <button className="btn-orange" onClick={handleSubmit}>
                {isEditing ? "Guardar Cambios" : "Entregar Tarea"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmissionModal;
