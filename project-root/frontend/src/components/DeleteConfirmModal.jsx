function DeleteConfirmModal({ show, onCancel, onConfirm, targetName }) {
    return show ? (
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirmar eliminación</h5>
              <button className="btn-close" onClick={onCancel}></button>
            </div>
            <div className="modal-body">
              <p>
                ¿Estás seguro de que deseas eliminar a{" "}
                <strong>{targetName}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
              <button className="btn btn-danger" onClick={onConfirm}>Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }
  
  export default DeleteConfirmModal;
  