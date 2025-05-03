// frontend/src/layouts/MyCoursesPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";

function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (user) fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses/courses/");
      setCourses(response.data);
    } catch (error) {
      console.error("Error al cargar los cursos:", error);
    } finally {
      setLoading(false);
    }
  };
  

  if (authLoading || loading) {
    return <div className="text-center mt-5">Cargando cursos...</div>;
  }

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(query.toLowerCase())
  );

  const renderCourseCard = (course) => (
    <div className="card h-100 shadow-sm position-relative">
      <div className="position-relative bg-light" style={{ height: "150px", overflow: "hidden" }}>
        <span className="position-absolute bottom-0 end-0 bg-light text-dark small m-2 px-2 py-1 rounded">
          <i className="bi bi-calendar3"></i> {course.semester || "Semestre no especificado"}
        </span>
        <img
          src="/imagen.jpg"
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
          alt={course.name}
        />
      </div>

      <div className="card-body text-center">
        <h6 className="card-title mb-1">
          <Link to={`/${user.role}/courses/${course.id}`} className="text-decoration-none">
            <i className="bi bi-book"></i> {course.name}
          </Link>
        </h6>
        <p className="card-text mb-0">
          <small>
            <i className="bi bi-person-fill"></i> {course.teacher_name || "Profesor desconocido"}
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