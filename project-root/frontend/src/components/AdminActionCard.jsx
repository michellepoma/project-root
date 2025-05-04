import { Link } from "react-router-dom";

function AdminActionCard({ onClick, icon, title, bg = "white", textColor = "dark" }) {
    return (
      <div
        className={`card border-0 shadow-sm h-100 text-center bg-${bg} text-${textColor} cursor-pointer`}
        onClick={onClick}
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
