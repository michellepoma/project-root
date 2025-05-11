// src/pages/MyCoursesPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import "@/styles/MyCoursesPage.css";

// SVGs refinados, todos usan currentColor para poder colorearlos con CSS
const CalendarIcon = () => (
  <svg
    className="icon-svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const BookIcon = () => (
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

const MortarboardIcon = () => (
  <svg
    className="icon-svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 9l11 5 11-5-11-5-11 5z" />
    <path d="M3 9v6a9 9 0 0 0 18 0V9" />
    <path d="M12 14v7" />
  </svg>
);

function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    if (user) fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses/courses/");
      setCourses(Array.isArray(res.data.results) ? res.data.results : []);
    } catch (err) {
      console.error("Error al cargar los cursos:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="text-center mt-5">Cargando cursos...</div>;
  }

  const filtered = courses.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const mapDay = abbr => {
    const days = { mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb", sun: "Dom" };
    return days[abbr] || abbr;
  };

  const toggleExpanded = id => {
    setExpandedCards(p => ({ ...p, [id]: !p[id] }));
  };

  const renderCourseCard = course => (
    <Link
      to={`/${user.role}/courses/${course.id}`}
      className="card h-100 course-link-wrapper glass"
    >
      <div className="card-img-wrapper">
        <img src="/imagen.jpg" alt={course.name} className="card-img" />
        <div className="schedule-badge">
          <CalendarIcon />
          {(expandedCards[course.id]
            ? course.schedules
            : course.schedules.slice(0, 2)
          )
            .map(s =>
              `${mapDay(s.day)} ${s.start_time.slice(0, 5)}–${s.end_time.slice(0, 5)}`
            )
            .join(" | ")}
          {course.schedules.length > 2 && (
            <button
              className="toggle-btn"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                toggleExpanded(course.id);
              }}
            >
              {expandedCards[course.id] ? "ver menos" : "ver más"}
            </button>
          )}
        </div>
      </div>

      <div className="card-body text-center">
        <h6 className="card-title">
          <BookIcon />
          {course.name}
        </h6>
        <p className="card-text">
          <MortarboardIcon />
          {course.teacher_name || "Profesor desconocido"}
        </p>
      </div>
    </Link>
  );

  return (
    <div className="container pt-4">
      <form className="d-flex mb-4" onSubmit={e => e.preventDefault()}>
        <input
          className="form-control"
          type="search"
          placeholder="Buscar nombre del curso"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </form>

      <div className="grid-responsive">
        {filtered.length > 0 ? (
          filtered.map(c => (
            <div className="col" key={c.id}>
              {renderCourseCard(c)}
            </div>
          ))
        ) : (
          <div className="col-12">
            <p className="text-center">No se encontraron cursos.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCoursesPage;
