//=====================SIDEBAR====================
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const toggleBtn = document.getElementById("sidebarToggle");

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
    }
  });
}

if (overlay) {
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });
}

//===============REGISTER====================
const togglePassIcons = document.querySelectorAll(".toggle-pass");
if (togglePassIcons.length > 0) {
  togglePassIcons.forEach((icon) => {
    icon.addEventListener("click", function () {
      const target = document.getElementById(this.dataset.target);
      if (target) {
        const type = target.getAttribute("type") === "password" ? "text" : "password";
        target.setAttribute("type", type);
        this.classList.toggle("bi-eye");
        this.classList.toggle("bi-eye-slash");
      }
    });
  });
}

//===============LOGIN=======================
const toggle = document.getElementById("togglePassword");
const password = document.getElementById("password");

if (toggle && password) {
  toggle.addEventListener("click", function () {
    const type = password.getAttribute("type") === "password" ? "text" : "password";
    password.setAttribute("type", type);

    this.classList.toggle("bi-eye");
    this.classList.toggle("bi-eye-slash");
  });
}
