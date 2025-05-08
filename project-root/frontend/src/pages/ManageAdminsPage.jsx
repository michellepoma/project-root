import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Pagination from "../components/Pagination";
import AdminUserTable from "../components/AdminUserTable";
import AdminUserModal from "../components/AdminUserModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import SearchBar from "../components/SearchBar";

function ManageAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [formError, setFormError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    ci: "",
    name: ""
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchAdmins = async (page = 1, search = "") => {
    try {
      const res = await api.get(`/auth/all/?is_superuser=true&page=${page}&search=${search}`);
      setAdmins(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 10));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error cargando administradores:", err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchAdmins(1, value);
  };

  const openModal = (admin = null) => {
    setEditingAdmin(admin);
    setFormData({
      first_name: admin?.first_name || "",
      last_name: admin?.last_name || "",
      email: admin?.email || "",
      ci: admin?.ci || "",
      name: admin ? `${admin.first_name} ${admin.last_name}` : ""
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (
      !formData.first_name.trim() ||
      !formData.last_name.trim() ||
      !formData.email.trim() ||
      !formData.ci.trim()
    ) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    try {
      setFormError("");

      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      const password = `${formData.ci}${formData.first_name}`;

      if (editingAdmin) {
        await api.patch(`/auth/admin/users/${editingAdmin.id}/`, {
          ...formData,
          name: fullName
        });
      } else {
        await api.post("/auth/admin/users/", {
          ...formData,
          name: fullName,
          password,
          password_confirm: password,
          role: "teacher",
          is_superuser: true
        });
      }

      fetchAdmins(currentPage, searchTerm);
      setShowModal(false);
    } catch (err) {
      const res = err.response?.data;
      if (typeof res === "string") {
        setFormError(res);
      } else if (typeof res === "object") {
        const firstField = Object.keys(res)[0];
        const firstError = res[firstField]?.[0] || "Error al guardar.";
        setFormError(`${firstField}: ${firstError}`);
      } else {
        setFormError("Error desconocido al guardar.");
      }

      console.error("Error al guardar administrador:", err);
    }
  };

  const confirmDelete = (admin) => {
    setDeleteTarget(admin);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/auth/admin/users/${deleteTarget.id}/`);
      fetchAdmins(currentPage, searchTerm);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error al eliminar administrador:", err);
    }
  };

  return (
    <div className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Gestión de Administradores</h3>
        <button
          className="btn btn-outline-danger rounded"
          onClick={() => openModal()}
        >
          <i className="bi bi-person-plus"></i> Añadir Administrador
        </button>
      </div>

      <SearchBar placeholder="Buscar administrador..." onSearch={handleSearch} />

      <AdminUserTable users={admins} onEdit={openModal} onDelete={confirmDelete} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => fetchAdmins(page, searchTerm)}
      />

      <AdminUserModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editing={editingAdmin}
        formError={formError}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        targetName={
          deleteTarget ? `${deleteTarget.first_name} ${deleteTarget.last_name}` : ""
        }
      />
    </div>
  );
}

export default ManageAdminsPage;
