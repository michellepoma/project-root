import { useRef, useEffect } from "react";

function SidebarToggle() {
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleToggle = () => {
      if (window.innerWidth <= 768) {
        sidebarRef.current.classList.toggle("active");
        overlayRef.current.classList.toggle("active");
      }
    };

    const handleOverlayClick = () => {
      sidebarRef.current.classList.remove("active");
      overlayRef.current.classList.remove("active");
    };

    const toggleBtn = document.getElementById("sidebarToggle");

    if (toggleBtn) toggleBtn.addEventListener("click", handleToggle);
    if (overlayRef.current) overlayRef.current.addEventListener("click", handleOverlayClick);

    return () => {
      if (toggleBtn) toggleBtn.removeEventListener("click", handleToggle);
      if (overlayRef.current) overlayRef.current.removeEventListener("click", handleOverlayClick);
    };
  }, []);

  return (
    <>
      <div ref={sidebarRef} id="sidebar" className="sidebar">
        {/* contenido sidebar */}
      </div>
      <div ref={overlayRef} id="overlay" className="overlay"></div>
    </>
  );
}

export default SidebarToggle;
