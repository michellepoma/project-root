//✅admin navbar layout etc  
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { capitalizeFullName } from "../utils/format";
import ManageTeachersPage from "../pages/ManageTeachersPage";
import ManageStudentsPage from "../pages/ManageStudentsPage";
import ManageCoursesPage from "../pages/ManageCoursesPage";
import ManageAdminsPage from "../pages/ManageAdminsPage";
import "@/styles/AdminDashboard.css";

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeSection, setActiveSection] = useState("teachers");

  return (
    <>
      <div className="admin-dashboard">
        {/* Encabezado */}
        <header className="admin-header">
          <h1>Panel del Administrador</h1>
          <h2>One Technology</h2>
          <p>Gestión de usuarios, cursos y roles</p>
        </header>

        {/* Avatar y saludo */}
        <div className="admin-avatar-wrapper">
          <img
            src={user?.profile_picture || "/default_avatar.png"}
            alt="avatar"
            className="admin-avatar"
          />
          <p className="text-center mt-2">
            Bienvenido{" "}
            {capitalizeFullName(
              `${user?.first_name || ""} ${user?.last_name || ""}`
            )}
          </p>
        </div>

        {/* Botones de secciones */}
        <nav className="admin-tab-nav">
          {[
            { key: "teachers", icon: "bi-person-video2", label: "Docentes" },
            { key: "students", icon: "bi-mortarboard", label: "Estudiantes" },
            { key: "courses", icon: "bi-journal-text", label: "Cursos" },
            { key: "admins", icon: "bi-shield-lock", label: "Administradores" },
          ].map((section) => (
            <div
              key={section.key}
              className={`admin-tab-item ${activeSection === section.key ? "active" : ""}`}
              onClick={() => setActiveSection(section.key)}
            >
              <i className={`bi ${section.icon} me-2`}></i> {section.label}
            </div>
          ))}
        </nav>


        {/* Secciones dinámicas */}
        <main className="admin-main">
          {activeSection === "teachers" && <ManageTeachersPage />}
          {activeSection === "students" && <ManageStudentsPage />}
          {activeSection === "courses" && <ManageCoursesPage />}
          {activeSection === "admins" && <ManageAdminsPage />}
        </main>
      </div>
              {/* Botón cerrar sesión */}
              <button
          className="logout-btn d-flex align-items-center justify-content-center"
          onClick={() => setShowLogoutModal(true)}
          title="Cerrar sesión"
        >
          <i className="bi bi-box-arrow-right fs-4"></i>
        </button>

        {/* Modal de cierre de sesión */}
        {showLogoutModal && (
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content p-4">
                <h5 className="modal-title mb-3">Confirmar cierre de sesión</h5>
                <p>¿Estás seguro de que deseas cerrar sesión?</p>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowLogoutModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
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
    </>
  );
}

export default AdminDashboard;
