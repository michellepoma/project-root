//✅es el formulario de los componetes de admin 
import "@/styles/AdminUserModal.css";
function AdminUserModal({
  show,
  onClose,
  onSubmit,
  formData,
  setFormData,
  editing,
  formError,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header border-0">
            <h5 className="modal-title">
              {editing ? "Editar Usuario" : "Añadir Usuario"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
          </div>

          {/* Error Alert */}
          {formError && (
            <div className="alert alert-danger py-2 px-3">{formError}</div>
          )}

          {/* Body */}
          <div className="modal-body">
            <input
              name="first_name"
              className="form-control mb-3"
              placeholder="Nombre"
              value={formData.first_name}
              onChange={handleChange}
            />
            <input
              name="last_name"
              className="form-control mb-3"
              placeholder="Apellido"
              value={formData.last_name}
              onChange={handleChange}
            />
            <input
              name="email"
              type="email"
              className="form-control mb-3"
              placeholder="Correo"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              name="ci"
              className="form-control mb-3"
              placeholder="CI"
              value={formData.ci}
              onChange={handleChange}
            />
          </div>

          {/* Footer */}
          <div className="modal-footer border-0">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger" onClick={onSubmit}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUserModal;
