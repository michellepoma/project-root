//✅inico de estudiante y techer 
// frontend/src/MainPage.jsx
// frontend/src/MainPage.jsx
import imagen from "/imagen.jpg";
import "@/styles/MainPage.css";

function MainPage() {
  return (
    <>
      {/* ======== NAV-BAR (header) ======== */}
      <div className="header">
        <div className="logo">ONE TECHNOLOGY</div>
        <div className="user-avatar">
          <i className="bi bi-person-circle"></i>
        </div>
      </div>

      {/* ======== SLIDER LATERAL ======== */}
      <div className="slider">
        <button className="slider-btn">
          <i className="bi bi-plus-lg"></i>
        </button>
        <button className="slider-btn">
          <i className="bi bi-laptop"></i>
        </button>
        <button className="slider-btn">
          <i className="bi bi-calendar3"></i>
        </button>
      </div>

      {/* ======== ZONA DE CONTENIDO CON FONDO 2 ======== */}
      <div className="main-container">
        <div className="content">
          <img src={imagen} className="main-image" alt="Imagen principal" />
          
        </div>
      </div>
    </>
  );
}

export default MainPage;
