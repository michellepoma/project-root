//

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import "@/styles/AdminMain.css"; // Asegúrate que este archivo existe

const AdminMainPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/profile/");
        if (response.data.role !== "superuser") {
          navigate("/unauthorized");
        } else {
          setUser(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  if (!user) return <div className="loading">Cargando...</div>;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Administrador</h1>
        <p>One Technology</p>
      </header>

      <nav className="admin-nav">
        <button className="nav-button active">Añadir Docente</button>
        <button className="nav-button">Añadir/Editar Est</button>
        <button className="nav-button">Crear curso</button>
        <button className="nav-button">Añadir Admin</button>
      </nav>

      <button className="nav-button test-style">Añadir Docente</button>


      <div className="admin-content">
        <h3>Nombre del admin: {user.name}</h3>
        <ul className="teacher-list">
          <li className="teacher-item">Docente 1 <span>⋮</span></li>
          <li className="teacher-item">Docente 2 <span>⋮</span></li>
          <li className="teacher-item">Docente 3 <span>⋮</span></li>
          <li className="teacher-item">Docente 4 <span>⋮</span></li>
        </ul>
        <button className="add-button">+</button>
      </div>
    </div>
  );
};

export default AdminMainPage;
