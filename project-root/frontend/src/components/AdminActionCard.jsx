//Crea una card clickeable con un ícono y un título. 
// ✅Se usa para navegar entre secciones administrativas (por ejemplo: "Administrar Docentes", "Cursos", etc.).
import { Link } from "react-router-dom";
import "@/styles/AdminActionCard.css";



function AdminActionCard({ onClick, icon, title, bg = "white", textColor = "dark" }) {
    return (
      <div className="admin-action-card" onClick={onClick}
        role="button"
        style={{ transition: "0.3s", cursor: "pointer" }}
      >
        <div className="card-body">
          <i className={`bi ${icon} fs-3`}></i>
          <h6 className="mt-2">{title}</h6>
        </div>
      </div>
    );
  }
  

export default AdminActionCard;
