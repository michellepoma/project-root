import "@/styles/AdminUserTable.css";

function AdminUserTable({ users, onEdit, onDelete }) {
  return (
    <div className="admin-table-container p-4 rounded shadow animate-fade-in">
      <table className="table table-hover align-middle text-center animate-slide-in">
        <thead className="table-header">
          <tr>
            <th>Foto</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Email</th>
            <th>CI</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((t) => (
            <tr key={t.id} className="table-row">
              <td>
                <img
                  src={t.profile_picture || "/default_avatar.png"}
                  alt="Foto"
                  className="user-avatar"
                />
              </td>
              <td className="text-capitalize">{t.first_name}</td>
              <td className="text-capitalize">{t.last_name}</td>
              <td>{t.email}</td>
              <td>{t.ci}</td>
              <td>{t.name}</td>
              <td>
                <div className="btn-group">
                  <button
                    className="action-btn edit-btn"
                    title="Editar"
                    onClick={() => onEdit(t)}
                  >
                    <i className="bi bi-pencil-fill"></i>
                  </button>
                  <button
                    className="action-btn delete-btn"
                    title="Eliminar"
                    onClick={() => onDelete(t)}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <p className="text-muted text-center mt-3">No hay usuarios registrados.</p>
      )}
    </div>
  );
}

export default AdminUserTable;
