//✅Gestion de docente 

import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Pagination from "../components/Pagination";
import AdminUserTable from "../components/AdminUserTable";
import AdminUserModal from "../components/AdminUserModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import SearchBar from "../components/SearchBar";
import "@/styles/ManageTeachersPage.css";
import "@/styles/ManageAdminsPage.css";

function ManageTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formError, setFormError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    ci: "",
    name: "",
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const fetchTeachers = async (page = 1, search = "") => {
    try {
      const res = await api.get(
        `/auth/all/?role=teacher&is_superuser=false&page=${page}&search=${search}`
      );
      setTeachers(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 10));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error cargando docentes:", err);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchTeachers(1, value);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openModal = (teacher = null) => {
    setEditingTeacher(teacher);
    setFormData({
      first_name: teacher?.first_name || "",
      last_name: teacher?.last_name || "",
      email: teacher?.email || "",
      ci: teacher?.ci || "",
      name: teacher ? `${teacher.first_name} ${teacher.last_name}` : "",
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

      if (editingTeacher) {
        await api.patch(`/auth/admin/users/${editingTeacher.id}/`, {
          ...formData,
          name: fullName,
        });
      } else {
        await api.post("/auth/admin/users/", {
          ...formData,
          name: fullName,
          role: "teacher",
          password,
          password_confirm: password,
        });
      }

      fetchTeachers();
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

      console.error("Error al guardar docente:", err);
    }
  };

  const confirmDelete = (teacher) => {
    setDeleteTarget(teacher);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/auth/admin/users/${deleteTarget.id}/`);
      fetchTeachers();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error al eliminar docente:", err);
    }
  };

  return (
    <div className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Gestión de Docentes</h3>
       <button className="custom-btn danger" onClick={() => openModal()}>
          <i className="bi bi-person-plus me-2"></i>
          <span className="btn-text">Añadir Docente</span>
        </button>

      </div>
      <SearchBar placeholder="Buscar docente..." onSearch={handleSearch} />
      <AdminUserTable
        users={teachers}
        onEdit={openModal}
        onDelete={confirmDelete}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => fetchTeachers(page, searchTerm)}
      />

      <AdminUserModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editing={editingTeacher}
        formError={formError}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        targetName={
          deleteTarget
            ? `${deleteTarget.first_name} ${deleteTarget.last_name}`
            : ""
        }
      />
    </div>
  );
}

export default ManageTeachersPage;
