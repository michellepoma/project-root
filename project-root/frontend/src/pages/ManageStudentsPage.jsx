//✅gestion de estudiantes admin 

import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Pagination from "../components/Pagination";
import AdminUserTable from "../components/AdminUserTable";
import AdminUserModal from "../components/AdminUserModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import SearchBar from "../components/SearchBar";
import "@/styles/ManageStudentsPage.css";

function ManageStudentsPage() {
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [formError, setFormError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    ci: "",
    name: ""
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchStudents = async (page = 1, search = "") => {
    try {
      const res = await api.get(`/auth/all/?role=student&page=${page}&search=${search}`);
      setStudents(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 10));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error cargando estudiantes:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchStudents(1, value);
  };

  const openModal = (student = null) => {
    setEditingStudent(student);
    setFormData({
      first_name: student?.first_name || "",
      last_name: student?.last_name || "",
      email: student?.email || "",
      ci: student?.ci || "",
      name: student ? `${student.first_name} ${student.last_name}` : ""
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

      if (editingStudent) {
        await api.patch(`/auth/admin/users/${editingStudent.id}/`, {
          ...formData,
          name: fullName
        });
      } else {
        await api.post("/auth/admin/users/", {
          ...formData,
          name: fullName,
          role: "student",
          password,
          password_confirm: password
        });
      }

      fetchStudents(currentPage, searchTerm);
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

      console.error("Error al guardar estudiante:", err);
    }
  };

  const confirmDelete = (student) => {
    setDeleteTarget(student);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/auth/admin/users/${deleteTarget.id}/`);
      fetchStudents(currentPage, searchTerm);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error al eliminar estudiante:", err);
    }
  };

  return (
    <div className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Gestión de Estudiantes</h3>
        <button className="btn-add-student" onClick={() => openModal()}>
          <i className="bi bi-person-plus"></i> AÑADIR ESTUDIANTE
        </button>

      </div>

      <SearchBar placeholder="Buscar estudiante..." onSearch={handleSearch} />

      <AdminUserTable users={students} onEdit={openModal} onDelete={confirmDelete} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => fetchStudents(page, searchTerm)}
      />

      <AdminUserModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editing={editingStudent}
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

export default ManageStudentsPage;
