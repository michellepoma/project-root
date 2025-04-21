//frontend/src/pages/MainPage.jsx
import api from "../api/axiosConfig";
import { useState, useEffect } from "react";
//import axios from "axios";
import imagen from "/imagen.jpg"; // debe estar en /public
import { Modal, Button } from "bootstrap"; // solo si quieres usarlo programáticamente

function MainPage() {
  const [form, setForm] = useState({
    name: "",
    code: "",
    teacher_name: "",
    description: "",
  });

  const [alert, setAlert] = useState(null); // { message: "", type: "success" | "danger" }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/courses/", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        setAlert({ message: "Clase creada correctamente.", type: "success" });
        setForm({ name: "", code: "", teacher_name: "", description: "" });
        document.querySelector("#crearClaseModal .btn-close").click(); // cierra el modal
      }
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        "Ocurrió un error al crear la clase.";
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
    <div className="container col-md-8">
      {/* Mensaje */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show mt-3`} role="alert">
          {alert.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlert(null)}
          ></button>
        </div>
      )}

      {/* Imagen */}
      <div className="p-4 mb-4 rounded text-body-emphasis bg-body-secondary">
        <img src={imagen} className="img-fluid w-100 rounded" alt="Imagen" />
      </div>

      {/* Botón para abrir modal */}
      <div className="text-center my-4">
        <button
          className="btn btn-primary btn-md"
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
          <div className="modal-content">
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
                {/* Nombre de la clase */}
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
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

                {/* Sigla del curso */}
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    name="code"
                    id="siglaCurso"
                    placeholder="Sigla del curso"
                    value={form.code}
                    onChange={handleChange}
                  />
                  <label htmlFor="siglaCurso">
                    <i className="bi bi-hash me-2"></i>Sigla del curso
                  </label>
                </div>

                {/* Nombre del docente */}
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    name="teacher_name"
                    id="nombreDocente"
                    placeholder="Nombre del Docente"
                    value={form.teacher_name}
                    onChange={handleChange}
                  />
                  <label htmlFor="nombreDocente">
                    <i className="bi bi-person-badge me-2"></i>Nombre del Docente
                  </label>
                </div>

                {/* Descripción */}
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
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

                <button type="submit" className="btn btn-primary w-100">
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
