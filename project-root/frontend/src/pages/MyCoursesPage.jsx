//frontend/src/layouts/MyCoursesPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import useProfile from "../hooks/useProfile";


function MyCoursesPage() {
  const user = useProfile();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [studentCourses, setStudentCourses] = useState([]);
  const [teacherCourses, setTeacherCourses] = useState([]);



  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses/");
      const allCourses = response.data;
  
      const students = allCourses.filter(course => course.teacher !== user.id);
      const teachers = allCourses.filter(course => course.teacher === user.id);

  
      setStudentCourses(students);
      setTeacherCourses(teachers);
    } catch (error) {
      console.error("Error al cargar los cursos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando cursos...</div>;
  }

  const renderCourseCard = (course) => (
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
  );  

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
  
      {/* Mis Cursos como Estudiante */}
      <h5 className="mb-3">📚 Mis Clases</h5>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4 mb-5">
        {studentCourses.length > 0 ? (
          studentCourses
            .filter((course) => course.name.toLowerCase().includes(query.toLowerCase()))
            .map((course) => (
              <div className="col" key={course.id}>
                {renderCourseCard(course)}
              </div>
            ))
        ) : (
          <div className="col-12">
            <p className="text-center">No estás inscrito en ningún curso.</p>
          </div>
        )}
      </div>
  
      {/* Mis Cursos como Profesor */}
      <h5 className="mb-3">👨‍🏫 Cursos que Creé</h5>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        {teacherCourses.length > 0 ? (
          teacherCourses
            .filter((course) => course.name.toLowerCase().includes(query.toLowerCase()))
            .map((course) => (
              <div className="col" key={course.id}>
                {renderCourseCard(course)}
              </div>
            ))
        ) : (
          <div className="col-12">
            <p className="text-center">No has creado ningún curso aún.</p>
          </div>
        )}
      </div>
    </div>
  );
  
}

export default MyCoursesPage;