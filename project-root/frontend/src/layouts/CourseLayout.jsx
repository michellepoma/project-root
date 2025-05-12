// ✅layout 
// src/layouts/CourseLayout.jsx
import { Outlet, useParams, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import "@/styles/CourseLayout.css";

// Icono SVG para el journal
const JournalIcon = () => (
  <svg
    className="icon-svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 7H20V19.5H6.5A2.5 2.5 0 0 1 4 17V4.5Z" />
  </svg>
);

function CourseLayout() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.get(`/courses/courses/${id}/`)
      .then(res => setCourse(res.data))
      .catch(err => console.error("Error al obtener datos del curso:", err));
  }, [id, user]);

  if (loading) return <div className="loader">Cargando curso…</div>;
  if (!user || !course) return null;

  const base = `/${user.role}/courses/${id}`;

  return (
    <>
      <header className="course-navbar animate-fadeUp">
        <div className="course-title">
          <JournalIcon />
          <h2>{course.name}</h2>
        </div>
        <nav className="nav-links">
          {[
            ["Contenido", base, true],
            ["Tareas", `${base}/assignments`],
            ["Calificaciones", `${base}/grades`],
            ["Participantes", `${base}/participants`],
          ].map(([label, to, end]) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="course-content animate-fadeUp">
        <Outlet />
      </main>
    </>
  );
}

export default CourseLayout;
