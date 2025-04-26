//frontend/src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function PrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("access"));

  useEffect(() => {
    const token = localStorage.getItem("access");
    setIsAuthenticated(!!token);
  }, []);

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
