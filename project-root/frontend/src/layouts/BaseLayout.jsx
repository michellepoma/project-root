//frontend/src/layouts/BaseLayout.jsx
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import "@/styles/BaseLayout.css";
import { useAuth } from "../context/AuthContext";
import { capitalizeFullName } from "../utils/format";

function BaseLayout() {
  const sidebarRef = useRef();
  const overlayRef = useRef();
  const { user, loading, error, logout } = useAuth();

  // Lógica de toggle sidebar
  useEffect(() => {
    const toggleBtn = document.getElementById("sidebarToggle");
    const sidebar = sidebarRef.current;
    const overlay = overlayRef.current;

    const toggleSidebar = () => {
      if (window.innerWidth <= 768) {
        sidebar?.classList.toggle("active");
        overlay?.classList.toggle("active");
      }
    };

    const closeSidebar = () => {
      sidebar?.classList.remove("active");
      overlay?.classList.remove("active");
    };

    toggleBtn?.addEventListener("click", toggleSidebar);
    overlay?.addEventListener("click", closeSidebar);

    return () => {
      toggleBtn?.removeEventListener("click", toggleSidebar);
      overlay?.removeEventListener("click", closeSidebar);
    };
  }, []);

  if (loading) return <p className="text-center mt-4">Cargando perfil...</p>;
  if (error) return <p className="text-danger">Error al cargar perfil.</p>;

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom fixed-top custom-navbar">
        <div className="container-fluid justify-content-between align-items-center">
          <div
            className="position-absolute top-50 start-50 d-flex align-items-center gap-2 navbar-title"
            style={{ transform: "translate(-65%, -50%)" }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              style={{ height: "50px", width: "auto", objectFit: "contain" }}
            />
            <span className="d-none d-md-inline">ONE TECHNOLOGY</span>
          </div>

          <ul className="navbar-nav d-flex flex-row align-items-center gap-2 ms-auto">
            <li className="nav-item dropdown position-relative">
              <Link
                className="nav-link dropdown-toggle d-flex align-items-center"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-2"></i>
              </Link>
              <div
                className="dropdown-menu dropdown-menu-end p-3 position-absolute shadow border-0"
                style={{ width: 260 }}
              >
                <div className="text-center mb-3">
                  <h6 className="mb-0 text-capitalize">
                    {" "}
                    {capitalizeFullName(
                      `${user?.first_name || ""} ${user?.last_name || ""}`
                    )}
                  </h6>
                  <small className="text-muted">{user?.email}</small>
                </div>

                <div className="d-grid gap-2">
                  <button className="logout" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2"></i> Cerrar sesión
                  </button>
                </div>
              </div>
            </li>
            <li className="nav-item position-relative pb-1">
              <button
                className="btn btn-outline-primary d-md-none pb-1"
                id="sidebarToggle"
                aria-label="Abrir menú lateral"
              >
                <i className="bi bi-list fs-6"></i>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* SIDEBAR */}
      <div
        ref={sidebarRef}
        className="sidebar bg-white border-start position-fixed pt-1 px-2"
        id="sidebar"
      >
        <ul className="nav flex-column">
          {user?.role === "student" && (
            <li className="nav-item">
              <Link
                to="/student/join_course"
                className="nav-link d-flex align-items-center"
              >
                <i className="bi bi-plus-square-fill me-2"></i>
                <span>Unirse a clases</span>
              </Link>
            </li>
          )}

          <li className="nav-item">
            <Link
              to={`/${user?.role}/my_courses`}
              className="nav-link d-flex align-items-center"
            >
              <i className="bi bi-pc-display-horizontal me-2"></i>
              <span>Mis clases</span>
            </Link>
          </li>

          <li className="nav-item mb-5">
            <Link
              to={`/${user?.role}/schedule`}
              className="nav-link d-flex align-items-center"
            >
              <i className="bi bi-calendar3 me-2"></i>
              <span>
                {user?.role === "student"
                  ? "Clases Programadas"
                  : "Programar clases"}
              </span>
            </Link>
          </li>

          <li className="nav-item mt-5">
            <hr />
            <Link to="/" className="nav-link d-flex align-items-center">
              <i className="bi bi-gear me-2"></i>
              <span>Configuración</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* OVERLAY */}
      <div ref={overlayRef} id="overlay" className="overlay"></div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="pt-5 mt-2" id="main-content">
        <div className="container pt-4">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default BaseLayout;
