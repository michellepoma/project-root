// frontend/src/pages/CourseAssignmentsPage.jsx
import { /*useEffect,*/ useState } from "react";
import { useParams, Link } from "react-router-dom";
//import api from "../api/axiosConfig";

function CourseAssignmentsPage() {
    const { id } = useParams();
  
    // Ejemplo de tareas
    const assignments = [
      {
        id: 1,
        title: "Tarea 1 - Lectura",
        description: "Leer el capítulo 1 del libro de programación.",
        due_date: "2025-06-24",
        content: "Resumen del capítulo 1 sobre variables, condicionales y bucles.",
      },
      {
        id: 2,
        title: "Tarea 2 - Presentación",
        description: "Crear una presentación sobre React.",
        due_date: "2025-07-01",
        content: "Preparar 8 diapositivas explicando componentes y hooks.",
      },
      {
        id: 3,
        title: "Tarea 3 - Ejercicios prácticos",
        description: "Resolver ejercicios del tema 3.",
        due_date: "2025-07-08",
        content: "Realizar y entregar ejercicios de estructuras de datos.",
      },
    ];
  
    return (
      <div className="row">
        
        {/* Sidebar izquierdo (Tareas pendientes) */}
        <div className="col-md-3 rounded-start px-3 py-4 shadow-sm bg-light">
          <h6 className="mb-4">Tareas Pendientes</h6>
  
          <ul className="list-group border-0">
            {assignments.map((tarea) => (
              <li
                key={tarea.id}
                className="list-group-item d-flex justify-content-between align-items-center mb-2"
                style={{
                  borderRadius: "1rem",
                  border: "none",
                }}
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-folder me-2"></i>
                  <span>{tarea.title}</span>
                </div>
                <small>{tarea.due_date}</small>
              </li>
            ))}
          </ul>
        </div>
  
        {/* Contenido derecho (Lista completa de tareas) */}
        <div className="mt-5 col-md-9">
          {assignments.length > 0 ? (
            assignments.map((tarea) => (
              <div key={tarea.id} className="bg-light p-4 rounded mb-3 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">{tarea.title}</h5>
                  <Link
                    to={`/courses/${id}/assignments/${tarea.id}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Ver Detalle
                  </Link>
                </div>
                <p className="text-muted mb-2">{tarea.description}</p>
                <p className="text-dark">{tarea.content}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-muted mt-4">
              No hay tareas disponibles.
            </div>
          )}
        </div>
  
      </div>
    );
  }
  
  export default CourseAssignmentsPage;