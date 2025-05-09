import { useAuth } from "../context/AuthContext";
import { capitalizeFullName } from "../utils/format";
import api from "../api/axiosConfig";
import { useState, useEffect } from "react";

function SettingsPage() {
  const { user, loading } = useAuth();
  const [profileImage, setProfileImage] = useState("/default_avatar.png");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [photoSuccess, setPhotoSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const res = await api.get("/auth/me/");
        if (res.data.profile_picture) {
          setProfileImage(res.data.profile_picture);
        } else {
          setProfileImage("/default_avatar.png");
        }
      } catch (err) {
        console.error("Error al cargar imagen de perfil:", err);
      }
    };

    fetchProfileImage();
  }, []);

  const handleEditPhoto = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("profile_picture", file);

        try {
          const res = await api.patch("/auth/me/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setProfileImage(res.data.profile_picture || "/default_avatar.png");
          setPhotoSuccess("Foto de perfil actualizada correctamente.");
          setTimeout(() => setPhotoSuccess(""), 3000); // Oculta el mensaje tras 3s
        } catch (err) {
          console.error("Error al actualizar imagen:", err);
        }
      }
    };
    fileInput.click();
  };

  const handleRemovePhoto = async () => {
    try {
      await api.patch("/auth/me/", { profile_picture: null });
      setProfileImage("/default_avatar.png");
      setPhotoSuccess("Foto de perfil actualizada correctamente.");
      setTimeout(() => setPhotoSuccess(""), 3000);
    } catch (err) {
      console.error("Error al eliminar imagen:", err);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Por favor, completa todos los campos de contraseña.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Las nuevas contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    try {
      await api.patch("/auth/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPasswordSuccess("Contraseña actualizada exitosamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error("Error al cambiar contraseña:", err);
      if (err.response?.data?.current_password) {
        setPasswordError(err.response.data.current_password[0]);
      } else {
        setPasswordError("Error al cambiar la contraseña.");
      }
    }
  };

  if (loading) return <p className="text-center mt-4">Cargando perfil...</p>;

  return (
    <div className="container text-center py-5">
      <img
        src={profileImage}
        alt="Perfil"
        className="rounded-circle mb-3"
        style={{ width: 120, height: 120, objectFit: "cover" }}
      />
      {photoSuccess && (
        <div className="alert alert-success text-center">{photoSuccess}</div>
      )}

      <div className="d-flex justify-content-center gap-3 mb-4">
        <button
          className="btn btn-outline-dark px-4 rounded-pill"
          onClick={handleEditPhoto}
        >
          Editar Foto
        </button>
        <button
          className="btn btn-link text-danger"
          onClick={handleRemovePhoto}
        >
          <i className="bi bi-trash3 me-1"></i> Quitar
        </button>
      </div>

      <form
        className="text-start mx-auto"
        style={{ maxWidth: 700 }}
        onSubmit={handleSaveChanges}
      >
        <div className="row g-3 mb-4">
          <div className="col">
            <label className="form-label">Nombres</label>
            <input
              type="text"
              className="form-control"
              value={capitalizeFullName(`${user?.first_name || ""}`)}
              disabled
            />
          </div>
          <div className="col">
            <label className="form-label">Apellidos</label>
            <input
              type="text"
              className="form-control"
              value={capitalizeFullName(`${user?.last_name || ""}`)}
              disabled
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">CI</label>
          <input
            type="text"
            className="form-control"
            value={`${user?.ci || ""}`}
            disabled
          />
        </div>

        <div className="mb-5">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={`${user?.email || ""}`}
            disabled
          />
        </div>

        <h5 className="text-center mb-4">Cambiar contraseña</h5>

        {passwordError && (
          <div className="alert alert-danger text-center">{passwordError}</div>
        )}
        {passwordSuccess && (
          <div className="alert alert-success text-center">
            {passwordSuccess}
          </div>
        )}
        {/*CAMBIAR PASSWORD */}
        <div className="mb-3 position-relative">
          <label className="form-label">Contraseña Actual</label>
          <input
            type={showCurrentPassword ? "text" : "password"}
            className="form-control"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <i
            className={`bi ${
              showCurrentPassword ? "bi-eye-slash" : "bi-eye"
            } position-absolute`}
            style={{ right: "15px", top: "38px", cursor: "pointer" }}
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
          ></i>
        </div>

        <div className="row g-4 mb-4">
          <div className="col position-relative">
            <label className="form-label">Nueva Contraseña</label>
            <input
              type={showNewPassword ? "text" : "password"}
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <i
              className={`bi ${
                showNewPassword ? "bi-eye-slash" : "bi-eye"
              } position-absolute`}
              style={{ right: "15px", top: "38px", cursor: "pointer" }}
              onClick={() => setShowNewPassword(!showNewPassword)}
            ></i>
          </div>
          <div className="col position-relative">
            <label className="form-label">Confirmar Nueva Contraseña</label>
            <input
              type={showConfirmNewPassword ? "text" : "password"}
              className="form-control"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <i
              className={`bi ${
                showConfirmNewPassword ? "bi-eye-slash" : "bi-eye"
              } position-absolute`}
              style={{ right: "15px", top: "38px", cursor: "pointer" }}
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
            ></i>
          </div>
        </div>

        <div className="text-center">
          <button className="btn btn-danger rounded-pill px-5" type="submit">
            CAMBIAR CONTRASEÑA
          </button>
        </div>
      </form>
    </div>
  );
}

export default SettingsPage;
