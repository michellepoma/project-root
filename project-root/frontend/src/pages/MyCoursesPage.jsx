// frontend/src/layouts/MyCoursesPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import "@/styles/MyCoursesPage.css";

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
      const response = await api.get("/courses/courses/");
      setCourses(
        Array.isArray(response.data.results) ? response.data.results : []
      );
    } catch (error) {
      console.error("Error al cargar los cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="text-center mt-5">Cargando cursos...</div>;
  }

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(query.toLowerCase())
  );

  const mapDayAbbreviation = (abbr) => {
    const days = {
      mon: "Lun",
      tue: "Mar",
      wed: "Mié",
      thu: "Jue",
      fri: "Vie",
      sat: "Sáb",
      sun: "Dom",
    };
    return days[abbr] || abbr;
  };

  const toggleExpanded = (courseId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };
  

  const renderCourseCard = (course) => (
    <div className="card h-100 shadow-sm position-relative">
      <div
        className="position-relative bg-light"
        style={{ height: "150px", overflow: "hidden" }}
      >
        <div
  className="position-absolute bottom-0 end-0 bg-light text-dark small m-2 px-2 py-1 rounded text-end"
  style={{
    maxWidth: "90%",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  }}
>
  <i className="bi bi-calendar3 me-1"></i>
  {course.schedules?.length > 0 ? (
    <>
      {(expandedCards[course.id] ? course.schedules : course.schedules.slice(0, 2))
        .map(
          (s) =>
            `${mapDayAbbreviation(s.day)} ${s.start_time.slice(0, 5)}-${s.end_time.slice(0, 5)}`
        )
        .join(" | ")}

      {course.schedules.length > 2 && (
        <button
          className="btn btn-link btn-sm text-primary p-0 ms-2"
          style={{ fontSize: "0.75rem" }}
          onClick={() => toggleExpanded(course.id)}
        >
          {expandedCards[course.id] ? "ver menos" : "ver más"}
        </button>
      )}
    </>
  ) : (
    "Sin horario"
  )}
</div>



        <img
          src="/imagen.jpg"
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
          alt={course.name}
        />
      </div>

      <div className="card-body text-center">
        <h6 className="card-title mb-1">
          <Link
            to={`/${user.role}/courses/${course.id}`}
            className="text-decoration-none"
          >
            <i className="bi bi-book"></i> {course.name}
          </Link>
        </h6>
        <p className="card-text mb-0">
          <small>
            <i className="bi bi-person-fill"></i>{" "}
            {course.teacher_name || "Profesor desconocido"}
          </small>
        </p>
      </div>
    </div>
  );

  return (
    <div className="container pt-4">
      <form className="d-flex mb-4" onSubmit={(e) => e.preventDefault()}>
        <input
          className="form-control me-2"
          type="search"
          placeholder="Buscar nombre del curso"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div className="col" key={course.id}>
              {renderCourseCard(course)}
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
