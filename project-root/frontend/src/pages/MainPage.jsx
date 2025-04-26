import api from "../api/axiosConfig";
import { useState, useEffect } from "react";
import imagen from "/imagen.jpg";
import "@/styles/MainPage.css";

function MainPage() {
  const [form, setForm] = useState({
    name: "",
    subject_code: "",
    semester: "",
    description: "",
  });

  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/courses/", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        setAlert({ message: "Clase creada correctamente.", type: "success" });
        setForm({ name: "", subject_code: "", semester: "", description: "" });
        document.querySelector("#crearClaseModal .btn-close").click();
      }
    } catch (err) {
      const message =
        err.response?.data?.detail || "Ocurrió un error al crear la clase.";
      setAlert({ message, type: "danger" });
    }
  };

  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => {
        setAlert(null);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);

  return (
    <div className="main-container">
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar alerta"
            onClick={() => setAlert(null)}
          ></button>
        </div>
      )}

      {/* Imagen y botón juntos */}
      <div className="content">
        <img src={imagen} className="main-image" alt="Imagen principal" />
        <button
          className="custom-btn mt-3"
          type="button"
          data-bs-toggle="modal"
          data-bs-target="#crearClaseModal"
        >
          Crear Clase
        </button>
      </div>

      {/* Modal */}
      <div
        className="modal fade"
        id="crearClaseModal"
        tabIndex="-1"
        aria-labelledby="crearClaseModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content login-card">
            <div className="modal-header">
              <h5 className="modal-title" id="crearClaseModalLabel">
                Crear Nueva Clase
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Cerrar"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control login-input"
                    name="name"
                    id="nombreClase"
                    placeholder="Nombre de la clase"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="nombreClase">
                    <i className="bi bi-book me-2"></i>Nombre de la clase *
                  </label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control login-input"
                    name="subject_code"
                    id="siglaCurso"
                    placeholder="Sigla del curso"
                    value={form.subject_code}
                    onChange={handleChange}
                  />
                  <label htmlFor="siglaCurso">
                    <i className="bi bi-hash me-2"></i>Sigla del curso
                  </label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control login-input"
                    name="semester"
                    id="semestre"
                    placeholder="Semestre"
                    value={form.semester}
                    onChange={handleChange}
                  />
                  <label htmlFor="semestre">
                    <i className="bi bi-calendar me-2"></i>Semestre
                  </label>
                </div>
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control login-input"
                    name="description"
                    id="descripcionCurso"
                    placeholder="Descripción"
                    style={{ height: "100px" }}
                    value={form.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                  <label htmlFor="descripcionCurso">
                    <i className="bi bi-file-text me-2"></i>Descripción
                  </label>
                </div>
                <button type="submit" className="custom-btn w-100 mt-3">
                  Guardar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;
