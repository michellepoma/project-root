import { Outlet, useParams, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function CourseLayout() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}/`);
        setCourse(response.data);
      } catch (err) {
        console.error("Error al obtener datos del curso:", err);
      }
    };

    fetchCourse();
  }, [id]);

  return (
    <>
      {/* Navbar del curso */}
      <div className="bg-primary text-white px-4 py-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-journal-text fs-4"></i>
          <h5 className="mb-0">{course?.name || "Cargando curso..."}</h5>
        </div>

        <ul className="nav">
          <li className="nav-item">
            <NavLink
              to={`/courses/${id}`}
              end
              className={({ isActive }) =>
                `nav-link text-white ${isActive ? "fw-bold" : ""}`
              }
            >
              Curso
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={`/courses/${id}/assignments`}
              className={({ isActive }) =>
                `nav-link text-white ${isActive ? "fw-bold" : ""}`
              }
            >
              Tareas
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={`/courses/${id}/grades`}
              className={({ isActive }) =>
                `nav-link text-white ${isActive ? "fw-bold" : ""}`
              }
            >
              Calificaciones
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={`/courses/${id}/participants`}
              className={({ isActive }) =>
                `nav-link text-white ${isActive ? "fw-bold" : ""}`
              }
            >
              Participantes
            </NavLink>
          </li>

        </ul>
      </div>
      <div className="container py-4">
        <Outlet />
      </div>
    </>
  );
}

export default CourseLayout;
