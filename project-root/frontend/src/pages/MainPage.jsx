//frontend/src/MainPage.jsx
import imagen from "/imagen.jpg";
import "@/styles/MainPage.css";

function MainPage() {
  return (
    <div className="main-container">
      <div className="content">
        <img src={imagen} className="main-image" alt="Imagen principal" />
      </div>
    </div>
  );
}

export default MainPage;
