//✅gestion de cursos admin

import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import CourseFormModal from "../components/CourseFormModal";
import "@/styles/ManageCoursesPage.css";

function ManageCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCourses = async (page = 1, search = "") => {
    try {
      const res = await api.get(`/courses/courses/?page=${page}&search=${search}`);
      setCourses(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 10));
      setCurrentPage(page);
    } catch (err) {
      console.error("Error cargando cursos:", err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/auth/all/?role=teacher&is_superuser=false");
      setTeachers(res.data.results);
    } catch (err) {
      console.error("Error cargando docentes:", err);
      setTeachers([]);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  const openModal = (course = null) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/courses/${deleteTarget.id}/`);
      fetchCourses();
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error al eliminar curso:", err);
    }
  };

  const dayLabels = {
    mon: "Lunes",
    tue: "Martes",
    wed: "Miércoles",
    thu: "Jueves",
    fri: "Viernes",
    sat: "Sábado",
    sun: "Domingo",
  };

  const getDayLabel = (code) => dayLabels[code] || code;

  return (
    <div className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Gestión de Cursos</h3>
        <button className="custom-btn danger" onClick={() => openModal()}>
          <i className="bi bi-journal-plus me-2"></i>
          <span className="btn-text">Añadir Curso</span>
        </button>
      </div>

      <SearchBar
        placeholder="Buscar cursos por nombre, sigla o docente"
        onSearch={(value) => {
          setSearchTerm(value);
          fetchCourses(1, value);
        }}
      />

      <div className="table-responsive bg-light p-3 rounded shadow-sm">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Código</th>
              <th>Nombre del Curso</th>
              <th>Sigla</th>
              <th>Docente</th>
              <th>Horario</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.code}</td>
                <td>{course.name}</td>
                <td>{course.subject_code}</td>
                <td>{course.teacher_name || "Sin asignar"}</td>
                <td>
                  {course.schedules.map((s, idx) => (
                    <div key={idx}>
                      {getDayLabel(s.day)}: {s.start_time} - {s.end_time}
                    </div>
                  ))}
                </td>
                <td>
                  <div className="btn-group">
                    <button
                      className="action-btn edit-btn"
                      title="Editar"
                      onClick={() => openModal(course)}
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                      className="action-btn delete-btn"
                      title="Eliminar"
                      onClick={() => {
                        setDeleteTarget(course);
                        setShowDeleteModal(true);
                      }}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {courses.length === 0 && (
          <p className="text-muted text-center mt-3">
            No hay cursos registrados.
          </p>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => fetchCourses(page, searchTerm)}
        />
      </div>

      <CourseFormModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onRefresh={fetchCourses}
        editingCourse={editingCourse}
        teachers={teachers}
      />

      <DeleteConfirmModal
        show={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        targetName={deleteTarget?.name || ""}
      />
    </div>
  );
}

export default ManageCoursesPage;
