function AdminUserTable({ users, onEdit, onDelete }) {
    return (
      <div className="table-responsive bg-light p-3 rounded shadow-sm">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Foto</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Email</th>
              <th>CI</th>
              <th>Nombre de Usuario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((t) => (
              <tr key={t.id}>
                <td>
                  <img
                    src={t.profile_picture || "/default_avatar.png"}
                    alt="Foto"
                    className="rounded-circle"
                    style={{ width: 40, height: 40, objectFit: "cover" }}
                  />
                </td>
                <td className="text-capitalize">{t.first_name}</td>
                <td className="text-capitalize">{t.last_name}</td>
                <td>{t.email}</td>
                <td>{t.ci}</td>
                <td>{t.name}</td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => onEdit(t)}>Editar</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => onDelete(t)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-muted text-center mt-3">No hay usuarios registrados.</p>}
      </div>
    );
  }
  
  export default AdminUserTable;
  