import { Outlet, useParams, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

function CourseLayout() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/courses/${id}/`);
        setCourse(response.data);
      } catch (err) {
        console.error("Error al obtener datos del curso:", err);
      }
    };

    if (user) fetchCourse();
  }, [id, user]);

  if (loading) return <div className="text-center mt-5">Cargando curso...</div>;
  if (!user || !course) return null;

  // Determinar prefijo según el rol (student o teacher)
  const basePath = `/${user.role}/courses/${id}`;

  return (
    <>
      {/* Navbar del curso */}
      <div className="bg-primary text-white px-4 py-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-journal-text fs-4"></i>
          <h5 className="mb-0">{course.name}</h5>
        </div>

        <ul className="nav">
          <li className="nav-item">
            <NavLink
              to={basePath}
              end
              className={({ isActive }) =>
                `nav-link text-white ${isActive ? "fw-bold" : ""}`
              }
            >
              Contenido
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={`${basePath}/assignments`}
              className={({ isActive }) =>
                `nav-link text-white ${isActive ? "fw-bold" : ""}`
              }
            >
              Tareas
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={`${basePath}/grades`}
              className={({ isActive }) =>
                `nav-link text-white ${isActive ? "fw-bold" : ""}`
              }
            >
              Calificaciones
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to={`${basePath}/participants`}
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
