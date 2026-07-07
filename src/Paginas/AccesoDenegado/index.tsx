import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../Componentes/Sidebar';
import { HOME_BY_ROL } from '../../Componentes/Sidebar/navConfig';
import { getRolActual } from '../../utils/session';
import './accesoDenegado.css';
import { usePageTitle } from '../../hooks/usePageTitle';

/* ─────────────────────────────────────────────
   403 — ACCESO DENEGADO
   Se muestra cuando un usuario autenticado intenta
   entrar a una ruta que no corresponde a su rol.
───────────────────────────────────────────── */

const ROL_LABEL: Record<string, string> = {
  alumno: 'Alumno',
  profesor: 'Profesor',
  gestor: 'Gestor',
};

const AccesoDenegado: React.FC = () => {
  usePageTitle('Acceso denegado');
  const navigate = useNavigate();
  const rol = getRolActual();

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content ad-center">
          <div className="ad-panel" role="alert">
            <div className="ad-orb" aria-hidden="true" />

            <div className="ad-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="9.5" y1="9.5" x2="14.5" y2="14.5" />
                <line x1="14.5" y1="9.5" x2="9.5" y2="14.5" />
              </svg>
            </div>

            <span className="ad-code">Error 403</span>
            <h1 className="ad-title">No podés acceder a esta página</h1>
            <p className="ad-desc">
              Esta sección no está disponible para tu perfil de{' '}
              <strong>{ROL_LABEL[rol]}</strong>. Si creés que se trata de un error,
              contactá a tu institución.
            </p>

            <div className="ad-actions">
              <Link to={HOME_BY_ROL[rol]} className="ad-btn ad-btn--primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Ir a mi inicio
              </Link>
              <button type="button" className="ad-btn ad-btn--ghost" onClick={() => navigate(-1)}>
                ← Volver atrás
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AccesoDenegado;
