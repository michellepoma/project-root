// frontend/src/pages/CourseGradesPage.jsx

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import useProfile from "../hooks/useProfile";

function GradesPage() {
    const { id } = useParams(); // ID del curso
    const user = useProfile();  // Info del usuario logueado
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);

  // Datos simulados por ahora (ya que no hay backend todavía)
  const assignments = [
    { id: 1, title: "Tarea 1", points: "0/100", status: "ESTADO" },
    { id: 2, title: "Tarea 2", points: "0/100", status: "ESTADO" },
    { id: 3, title: "Tarea 3", points: "0/100", status: "ESTADO" },
  ];

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

  if (loading || !user) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  // Buscar docente y estudiante
  const teacher = participants.find(p => p.role === "teacher");
  const student = participants.find(p => p.user === user.id && p.role === "student");

  return (
    <div className="container py-4">
      {/* Nombre del profesor */}
      <h3 className="text-center mb-4">
        {teacher ? teacher.user_name.toUpperCase() : "DOCENTE NO ENCONTRADO"}
      </h3>

      {/* Info del estudiante */}
      <div className="d-flex align-items-center mb-5">
        <div className="rounded-circle bg-light d-flex justify-content-center align-items-center" style={{ width: 60, height: 60 }}>
          <i className="bi bi-person fs-3"></i>
        </div>
        <h5 className="ms-3 mb-0">
          {student ? student.user_name.toUpperCase() : "USUARIO NO ENCONTRADO"} :
        </h5>
      </div>

      {/* Lista de Tareas */}
      <div className="d-flex flex-column gap-4">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="d-flex align-items-center justify-content-between p-3 bg-light rounded shadow-sm"
          >
            <div>
              <Link
                to={`/courses/${id}/assignments/${assignment.id}`}
                className="text-decoration-none text-dark"
              >
                <h6 className="mb-1">{assignment.title}</h6>
              </Link>
              <p className="mb-0 text-muted" style={{ maxWidth: "400px" }}>
                Datos de prueba
              </p>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">{assignment.points} PTS</span>
              {/* ESTADO como badge, no botón */}
              <span className="badge rounded-pill bg-danger px-3 py-2">{assignment.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GradesPage;
