//frontend/src/layouts/MyCoursesPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";

function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses/");
      setCourses(response.data);
    } catch (error) {
      console.error("Error al cargar los cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return <div className="text-center mt-5">Cargando cursos...</div>;
  }

  return (
    <div className="container pt-4">
      {/* Barra de Búsqueda */}
      <form className="d-flex mb-4" onSubmit={(e) => e.preventDefault()}>
        <input
          className="form-control me-2"
          type="search"
          placeholder="Buscar nombre del curso"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-outline-secondary" type="submit">
          Buscar
        </button>
      </form>

      {/* Listado de Cursos */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div className="col" key={course.id}>
              <div className="card h-100 shadow-sm position-relative">

                {/* Imagen con semestre */}
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

                  {/* Dropdown de Opciones */}
                  <div className="position-absolute top-0 end-0 m-2">
                    <div className="dropdown">
                      <button
                        className="btn btn-sm btn-light"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <button className="dropdown-item" type="button">
                            Salir del curso
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Cuerpo de la Card */}
                <div className="card-body text-center">
                  <h6 className="card-title mb-1">
                    <Link to={`/courses/${course.id}`} className="text-decoration-none">
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