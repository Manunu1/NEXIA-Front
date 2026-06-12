import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = (): void => {
    // Elimina todos los datos del localStorage
    localStorage.removeItem("usuario");
    localStorage.removeItem("rol");
    localStorage.removeItem("institucion_id");
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("alumno_id");
    localStorage.removeItem("profesor_id");
    localStorage.removeItem("gestor_id");

    // Redirige al login
    navigate("/");
  };

  return (
    <button className="logout-btn" onClick={handleLogout}>
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;
