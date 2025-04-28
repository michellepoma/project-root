// frontend/src/pages/CourseParticipantsPage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";

function CourseParticipantsPage() {
  const { id } = useParams();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await api.get(`/courses/${id}/participants/`);
        setParticipants(response.data);
      } catch (error) {
        console.error("Error al cargar participantes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [id]);

  if (loading) {
    return <div className="text-center mt-5">Cargando participantes...</div>;
  }

  const teachers = participants.filter(p => p.role === "teacher");
  const students = participants.filter(p => p.role === "student");

  const renderParticipant = (participant) => (
    <li key={participant.id} className="list-group-item d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-3">
        <div className="rounded-circle bg-light d-flex justify-content-center align-items-center" style={{ width: 40, height: 40 }}>
          <span className="text-uppercase fw-bold">{participant.user_name ? participant.user_name.charAt(0) : "U"}</span>
        </div>
        <span>{participant.user_name || "Usuario"}</span>
      </div>
      <i className="bi bi-check2-square"></i> {/* Icono de check (puedes cambiarlo) */}
    </li>
  );

  return (
    <div>
      {/* Encargado del Curso */}
      {teachers.length > 0 && (
        <div className="mb-4">
          <h6 className="text-muted">Encargado del curso</h6>
          <ul className="list-group">
            {teachers.map((participant) => renderParticipant(participant))}
          </ul>
        </div>
      )}

      {/* Estudiantes */}
      {students.length > 0 && (
        <div>
          <h6 className="text-muted">Estudiantes</h6>
          <ul className="list-group">
            {students.map((participant) => renderParticipant(participant))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CourseParticipantsPage;
