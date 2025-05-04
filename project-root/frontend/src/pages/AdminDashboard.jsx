import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { capitalizeFullName } from "../utils/format";
import AdminActionCard from "../components/AdminActionCard";
import AdminProfileHeader from "../components/AdminProfileHeader";

import ManageTeachersPage from "../pages/ManageTeachersPage";
import ManageStudentsPage from "../pages/ManageStudentsPage";
import ManageCoursesPage from "../pages/ManageCoursesPage";
import ManageAdminsPage from "../pages/ManageAdminsPage";


function AdminDashboard() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeSection, setActiveSection] = useState(null);


  useEffect(() => {}, [user]);

  return (
    <div className="container py-5">
      {/* Encabezado */}
      <div className="text-white rounded bg-dark p-5 mb-5 shadow-sm">
        <h1 className="display-3 fw-bold">Panel del Administrador</h1>
        <h2 className="fw-bold">One Technology</h2>
        <p className="lead mb-0">Gestión de usuarios, cursos y roles</p>
      </div>

      <AdminProfileHeader
        name={capitalizeFullName(`${user?.first_name} ${user?.last_name}`)}
        avatar={user?.profile_picture}
      />

      {/* Acciones principales */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-5">
        <div className="col">
          <AdminActionCard
            onClick={() => setActiveSection("teachers")}
            icon="bi-person-video2"
            title="Administrar Docentes"
            bg="danger"
            textColor="white"
          />
        </div>

        <div className="col">
          <AdminActionCard
            onClick={() => setActiveSection("students")}
            icon="bi-mortarboard"
            title="Administrar Estudiantes"
          />
        </div>

        <div className="col">
          <AdminActionCard
            onClick={() => setActiveSection("courses")}
            icon="bi-journal-text"
            title="Administrar Cursos"
          />
        </div>

        <div className="col">
          <AdminActionCard
            onClick={() => setActiveSection("admins")}
            icon="bi-shield-lock"
            title="Administrar Administradores"
          />
        </div>
      </div>

      {/* Botón para cerrar sesión */}
      <button
        className="btn btn-outline-danger position-fixed bottom-0 end-0 m-4 rounded-circle shadow"
        style={{ width: 60, height: 60 }}
        aria-label="Cerrar sesión"
        role="button"
        title="Cerrar sesión"
        onClick={() => setShowLogoutModal(true)}
      >
        <i className="bi bi-box-arrow-right fs-4"></i>
      </button>
      {showLogoutModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar cierre de sesión</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLogoutModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas cerrar sesión?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    logout();
                    setShowLogoutModal(false);
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeSection === "teachers" && <ManageTeachersPage />}
    {activeSection === "students" && <ManageStudentsPage />}
    {activeSection === "courses" && <ManageCoursesPage />}
    {activeSection === "admins" && <ManageAdminsPage />}
    </div>
    
    
  );
}

export default AdminDashboard;
