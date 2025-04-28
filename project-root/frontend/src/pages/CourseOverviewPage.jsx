// frontend/src/pages/CourseOverviewPage.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";

function CourseOverviewPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}/`);
        setCourse(response.data);

        setMaterials([
          { id: 1, title: "Datos de prueba", description: "Solo para ver como", link: "#" },
          { id: 2, title: "Todavia en Desarrollo", description: "Esta estrcuturado", link: "#" },
          { id: 3, title: "Falta implementacion en Backend", description: "la pagina", link: "#" },
        ]);
      } catch (err) {
        console.error("Error al cargar detalles del curso:", err);
      }
    };

    const fetchMaterials = async () => {
      try {
        const response = await api.get(`/materials/?course=${id}`);
        setMaterials(response.data);
      } catch (err) {
        console.error("Error al cargar materiales del curso:", err);
      }
    };

    fetchCourse();
    fetchMaterials();
  }, [id]);

  const filteredMaterials = materials.filter((material) =>
    material.title.toLowerCase().includes(query.toLowerCase())
  );

  if (!course) {
    return <div className="text-center mt-5">Cargando detalles del curso...</div>;
  }

  return (
    <div className="row">
      {/* Sidebar izquierdo */}
      <div className="col-md-3">
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Buscar material..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="list-group shadow">
          {query ? (
            filteredMaterials.length > 0 ? (
              filteredMaterials.map((material) => (
                <li key={material.id} className="list-group-item">
                  {material.title}
                </li>
              ))
            ) : (
              <li className="list-group-item text-muted">No encontrado</li>
            )
          ) : null}
        </ul>
      </div>


      {/* Contenido derecho */}
      <div className="mt-5 col-md-9">
        {materials.length > 0 ? (
          materials.map((material) => (
            <div key={material.id} className="bg-light p-3 rounded mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{material.title}</strong>
                  <p className="mb-0 text-muted">{material.description || "Sin descripción"}</p>
                </div>
                {material.link && (
                  <a
                    href={material.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-decoration-none d-flex align-items-center"
                  >
                    <i className="bi bi-chevron-right fs-4"></i>
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center mt-4 text-muted">
            No hay materiales disponibles.
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseOverviewPage;