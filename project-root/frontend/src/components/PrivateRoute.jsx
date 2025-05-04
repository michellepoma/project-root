import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute({ allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center mt-4">Cargando perfil...</p>;
  if (!user) return <Navigate to="/login" replace />;

  const normalizedRole = user.role?.trim().toLowerCase();
  const isSuperUser = user.is_superuser === true;

  // Si se permite superuser explícitamente
  if (allowedRoles.includes("superuser") && isSuperUser) {
    return <Outlet />;
  }

  // Caso normal por rol
  if (!allowedRoles.includes(normalizedRole)) {
    console.warn("🔒 Acceso denegado. Rol:", user.role);
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default PrivateRoute;