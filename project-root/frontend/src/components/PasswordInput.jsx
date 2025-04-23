import { useState } from "react";

function PasswordInput({ id = "password", placeholder = "Contraseña", ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className="input-group">
      <input
        id={id}
        type={show ? "text" : "password"}
        className="form-control"
        placeholder={placeholder}
        {...props}
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={() => setShow(!show)}
      >
        <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`}></i>
      </button>
    </div>
  );
}

export default PasswordInput;
