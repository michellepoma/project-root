// src/components/AdminProfileHeader.jsx
function AdminProfileHeader({ name, avatar }) {
    return (
      <div className="text-center mb-5">
        <img
          src={avatar || "/default_avatar.png"}
          alt="Avatar del administrador"
          className="rounded-circle shadow"
          style={{ width: 100, height: 100, objectFit: "cover" }}
        />
        <h5 className="mt-3">Bienvenido,</h5>
        <h4 className="fw-bold">{name || "Administrador"}</h4>
      </div>
    );
  }
  
  export default AdminProfileHeader;
  