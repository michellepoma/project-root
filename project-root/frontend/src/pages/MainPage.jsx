import imagen from "/imagen.jpg";
import "@/styles/MainPage.css";

function MainPage() {
  return (
    <div className="main-container">

      {/* Imagen */}
      <div className="content">
        <img src={imagen} className="main-image" alt="Imagen principal" />
      </div>
    </div>
  );
}

export default MainPage;
