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

  return show ? (
    <div className="modal fade show d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editing ? "Editar Usuario" : "Añadir Usuario"}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          {formError && (
            <div className="alert alert-danger py-2 px-3">{formError}</div>
          )}

          <div className="modal-body">
            <input
              name="first_name"
              className="form-control mb-2"
              placeholder="Nombre"
              value={formData.first_name}
              onChange={handleChange}
            />
            <input
              name="last_name"
              className="form-control mb-2"
              placeholder="Apellido"
              value={formData.last_name}
              onChange={handleChange}
            />
            <input
              name="email"
              className="form-control mb-2"
              placeholder="Correo"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              name="ci"
              className="form-control mb-2"
              placeholder="CI"
              value={formData.ci}
              onChange={handleChange}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-danger" onClick={onSubmit}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}

export default AdminUserModal;
