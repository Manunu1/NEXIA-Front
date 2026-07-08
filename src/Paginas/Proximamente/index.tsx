import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../Componentes/Sidebar';
import Footer from '../../Componentes/footer';
import { usePageTitle } from '../../hooks/usePageTitle';
import './proximamente.css';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const SECTION_INFO: Record<string, { icon: React.ReactNode; title: string; desc: string }> = {
  '/configuracion': {
    icon: (
      <svg viewBox="0 0 24 24" {...stroke}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    title: 'Configuración',
    desc: 'Personalizá tu perfil y preferencias de la plataforma.',
  },
};

const DEFAULT_INFO = {
  icon: (
    <svg viewBox="0 0 24 24" {...stroke}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  title: 'Próximamente',
  desc: 'Esta sección estará disponible muy pronto.',
};

const Proximamente: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const info = SECTION_INFO[location.pathname] ?? DEFAULT_INFO;
  usePageTitle(info.title);

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="prox-screen">
            <div className="prox-badge">En desarrollo</div>
            <div className="prox-icon" aria-hidden="true">{info.icon}</div>
            <h1 className="prox-title">{info.title}</h1>
            <p className="prox-desc">{info.desc}</p>
            <p className="prox-sub">Esta funcionalidad estará disponible en la próxima versión de NEXIA.</p>
            <button className="prox-btn" onClick={() => navigate(-1)}>
              ← Volver
            </button>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Proximamente;
