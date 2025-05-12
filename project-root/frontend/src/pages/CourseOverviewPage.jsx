import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import "@/styles/CourseOverviewPage.css";

function CourseOverviewPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();

  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [query, setQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    file: null,
    link: "",
  });

  useEffect(() => {
    if (user) {
      fetchCourse();
      fetchMaterials();
    }
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/courses/${id}/`);
      if (!response.data.is_participant) {
        setCourse(null);
        return;
      }
      setCourse(response.data);
    } catch (err) {
      console.error("Error al cargar curso:", err);
      setCourse(null);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await api.get(`/courses/materials/?course=${id}`);
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setMaterials(data);
    } catch (err) {
      console.error("Error al cargar materiales:", err);
    }
  };

  const handleSave = async () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("course", id);
    if (form.file) fd.append("file", form.file);
    if (form.link) fd.append("link", form.link);

    try {
      if (editingMaterial) {
        await api.put(
          `/courses/materials/${editingMaterial.id}/`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        await api.post("/courses/materials/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowModal(false);
      setForm({ title: "", description: "", file: null, link: "" });
      setEditingMaterial(null);
      fetchMaterials();
    } catch (err) {
      console.error("Error al guardar material:", err);
    }
  };

  const handleDelete = async (mid) => {
    if (!window.confirm("¿Eliminar este material?")) return;
    try {
      await api.delete(`/courses/materials/${mid}/`);
      fetchMaterials();
    } catch (err) {
      console.error("Error al eliminar material:", err);
    }
  };

  if (loading) return <div className="text-center mt-5">Cargando...</div>;
  if (!user) return <Navigate to="/unauthorized" />;
  if (!course)
    return <div className="text-center mt-5">Acceso no autorizado.</div>;

  const filtered = materials.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Buscar material..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {user.role === "teacher" && (
          <button
            className="btn-orange btn-add"
            onClick={() => {
              setEditingMaterial(null);
              setForm({ title: "", description: "", file: null, link: "" });
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-lg me-1"></i>Añadir Contenido
          </button>
        )}
      </div>

      {filtered.map((m) => (
        <div
          key={m.id}
          className="bg-light p-3 rounded mb-3 d-flex justify-content-between align-items-center"
        >
          <div>
            <strong>{m.title}</strong>
            <p className="mb-0 text-muted">
              {m.description || "Sin descripción"}
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn-edit"
              title="Editar"
              onClick={() => {
                setEditingMaterial(m);
                setForm({
                  title: m.title,
                  description: m.description,
                  file: null,
                  link: m.link,
                });
                setShowModal(true);
              }}
            >
              <i className="bi bi-pencil-fill"></i>
            </button>

            {m.file && (
              <a
                href={m.file}
                download
                className="btn-download"
                title="Descargar"
              >
                <i className="bi bi-download"></i>
              </a>
            )}

            {user.role === "teacher" && (
              <button
                className="btn-delete"
                title="Eliminar"
                onClick={() => handleDelete(m.id)}
              >
                <i className="bi bi-trash-fill"></i>
              </button>
            )}
          </div>
        </div>
      ))}

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content p-4 rounded-4">
              <div className="modal-header border-0">
                <h5 className="modal-title">
                  {editingMaterial ? "Editar Material" : "Agregar Material"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  className="form-control mb-3"
                  placeholder="Título"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
                <textarea
                  className="form-control mb-3"
                  placeholder="Descripción"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                ></textarea>
                <input
                  className="form-control mb-3"
                  placeholder="Enlace (opcional)"
                  value={form.link}
                  onChange={(e) =>
                    setForm({ ...form, link: e.target.value })
                  }
                />
                <input
                  type="file"
                  className="form-control mb-3"
                  onChange={(e) =>
                    setForm({ ...form, file: e.target.files[0] })
                  }
                />
                <div className="text-center">
                  <button
                    className="btn-orange btn-save"
                    onClick={handleSave}
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
  );
}

export default CourseOverviewPage;
