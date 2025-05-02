import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import useProfile from "../hooks/useProfile";

function CourseOverviewPage() {
  const { id } = useParams();
  const user = useProfile();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [query, setQuery] = useState("");

  const [showMainModal, setShowMainModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState("link");

  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}/`);
        setCourse(response.data);
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

  if (!user || !course) {
    return <div className="text-center mt-5">Cargando datos del curso...</div>;
  }
  //manejo de modals

  // VISTA TEACHER
  if (user.role === "teacher") {
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
        <div className="col-md-9 py-3 position-relative">
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-danger rounded-pill d-flex align-items-center gap-2 px-4 py-2 shadow-sm"
            title="Agregar nuevo material"
            onClick={() => {
              setEditingMaterial(null);
              setShowMainModal(true);
            }}
          >
            <i className="bi bi-plus-lg"></i>
            Agregar
          </button>
        </div>

          {/* Lista de materiales */}
          {filteredMaterials.length > 0 ? (
            filteredMaterials.map((material) => (
              <div key={material.id} className="bg-light p-3 rounded mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{material.title}</strong>
                    <p className="mb-0 text-muted">{material.description || "Sin descripción"}</p>
                  </div>
                  <button className="btn btn-danger rounded-pill px-4 d-flex align-items-center gap-2"
                  onClick={() => {
                    setEditingMaterial(material);
                    setShowMainModal(true);
                  }}
                  >
                    <i className="bi bi-pencil"></i>
                    Editar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted text-center">No hay materiales disponibles.</p>
          )}

          {/* MODAL PRINCIPAL */}
          {showMainModal && (
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content rounded-4 p-4">
                  <div className="modal-header border-0">
                    <h5 className="modal-title">Agregar / Editar Contenido</h5>
                    <button className="btn-close" onClick={() => setShowMainModal(false)}></button>
                  </div>

                  <div className="modal-body">
                    <input
                      className="form-control mb-3 rounded-pill"
                      placeholder="Título del contenido / tema"
                      defaultValue={editingMaterial?.title || ""}
                    />
                    <textarea
                      className="form-control mb-3 rounded-4"
                      placeholder="Descripción"
                      rows={4}
                      defaultValue={editingMaterial?.description || ""}
                    ></textarea>

                    <div className="bg-light p-4 rounded-4 mb-3 d-flex justify-content-between align-items-center">
                      <div>
                        <strong className="d-block mb-2">Subir archivo</strong>
                        <small className="text-muted">Agregar documento o enlace</small>
                      </div>
                      <button
                        className="btn btn-outline-dark rounded-pill px-4"
                        onClick={() => setShowUploadModal(true)}
                      >
                        Elegir archivo/enlace
                      </button>
                    </div>

                    <div className="text-center">
                      <button className="btn btn-danger rounded-pill px-5 py-2">
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUBMODAL DE CARGA */}
          {showUploadModal && (
            <div className="modal fade show d-block" tabIndex="-1">
              <div className="modal-dialog modal-md modal-dialog-centered">
                <div className="modal-content rounded-4 p-4">
                  <div className="modal-header border-0">
                    <h5 className="modal-title">Agregar Documento</h5>
                    <button className="btn-close" onClick={() => setShowUploadModal(false)}></button>
                  </div>

                  <div className="modal-body text-center">
                    <div className="btn-group mb-3 rounded-pill overflow-hidden">
                      <button
                        className={`btn ${uploadType === "link" ? "btn-danger" : "btn-light"}`}
                        onClick={() => setUploadType("link")}
                      >
                        Enlace
                      </button>
                      <button
                        className={`btn ${uploadType === "file" ? "btn-danger" : "btn-light"}`}
                        onClick={() => setUploadType("file")}
                      >
                        Archivo
                      </button>
                    </div>

                    {uploadType === "link" ? (
                      <input className="form-control rounded-pill" placeholder="Escriba el enlace" />
                    ) : (
                      <div className="bg-light rounded-4 p-4 mt-2 d-flex flex-column align-items-center">
                        <i className="bi bi-file-earmark-text fs-1 mb-2"></i>
                        <label className="btn btn-outline-dark rounded-pill">
                          Agregar / buscar
                          <input type="file" hidden />
                        </label>
                      </div>
                    )}

                    <div className="text-center mt-4">
                      <button
                        className="btn btn-danger rounded-pill px-4"
                        onClick={() => setShowUploadModal(false)}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // VISTA DEL ESTUDIANTE
  if (user.role === "student") {
  return (
    <div className="row">
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
}

export default CourseOverviewPage;
