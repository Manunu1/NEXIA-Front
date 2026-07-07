import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmDialog from "../ConfirmDialog";
import { clearSession } from "../../utils/session";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const [confirmando, setConfirmando] = useState(false);

  const handleLogout = (): void => {
    // Limpia TODA la sesión local, incluidos access y refresh tokens
    clearSession();
    navigate("/");
  };

  return (
    <>
      <button
        className="logout-btn"
        onClick={() => setConfirmando(true)}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>

      <ConfirmDialog
        open={confirmando}
        title="Cerrar sesión"
        message="¿Querés cerrar tu sesión en NEXIA?"
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setConfirmando(false)}
      />
    </>
  );
};

export default LogoutButton;
