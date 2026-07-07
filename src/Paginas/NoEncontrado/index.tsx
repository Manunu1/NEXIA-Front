import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../Componentes/Sidebar';
import { HOME_BY_ROL } from '../../Componentes/Sidebar/navConfig';
import { getRolActual, haySesion } from '../../utils/session';
import { usePageTitle } from '../../hooks/usePageTitle';
// Reutiliza los estilos de pantalla de error de AccesoDenegado (clases ad-*)
import '../AccesoDenegado/accesoDenegado.css';
import './noEncontrado.css';

/* ─────────────────────────────────────────────
   404 — PÁGINA NO ENCONTRADA (ruta catch-all)
───────────────────────────────────────────── */

const NoEncontrado: React.FC = () => {
  usePageTitle('Página no encontrada');
  const navigate = useNavigate();
  const logueado = haySesion();
  const inicio = logueado ? HOME_BY_ROL[getRolActual()] : '/';

  const contenido = (
    <div className="ad-panel ad-panel--404" role="alert">
      <div className="ad-orb" aria-hidden="true" />

      <div className="ad-icon ad-icon--404" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      </div>

      <span className="ad-code ad-code--404">Error 404</span>
      <h1 className="ad-title">Página no encontrada</h1>
      <p className="ad-desc">
        La dirección que ingresaste no existe o fue movida.
        Revisá la URL o volvé al inicio.
      </p>

      <div className="ad-actions">
        <Link to={inicio} className="ad-btn ad-btn--primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          {logueado ? 'Ir a mi inicio' : 'Ir al inicio'}
        </Link>
        <button type="button" className="ad-btn ad-btn--ghost" onClick={() => navigate(-1)}>
          ← Volver atrás
        </button>
      </div>
    </div>
  );

  // Con sesión mantiene la navegación; sin sesión, pantalla completa centrada
  if (!logueado) {
    return <div className="nf-fullscreen">{contenido}</div>;
  }

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content ad-center">{contenido}</main>
      </div>
    </>
  );
};

export default NoEncontrado;
