import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = (): void => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("rol");
    localStorage.removeItem("institucion_id");
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("alumno_id");
    localStorage.removeItem("profesor_id");
    localStorage.removeItem("gestor_id");
    navigate("/");
  };

  return (
    <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión" aria-label="Cerrar sesión">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  );
};

export default LogoutButton;
