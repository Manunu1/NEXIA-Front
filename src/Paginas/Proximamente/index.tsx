import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../Componentes/alumnos/Sidebar';
import Footer from '../../Componentes/footer';
import './proximamente.css';

const SECTION_INFO: Record<string, { icon: string; title: string; desc: string }> = {
  '/calendario':   { icon: '📅', title: 'Calendario',    desc: 'Visualizá tus fechas de exámenes, entregas y eventos institucionales.' },
  '/mensajes':     { icon: '💬', title: 'Mensajes',      desc: 'Comunicación directa con docentes y compañeros de clase.' },
  '/comunicados':  { icon: '📢', title: 'Comunicados',   desc: 'Novedades y anuncios oficiales de tu institución.' },
  '/nexia-ia':     { icon: '⚡', title: 'Nexia IA',      desc: 'Tu asistente pedagógico inteligente disponible 24/7.' },
  '/boletin':      { icon: '📋', title: 'Mi Boletín',    desc: 'Consultá tus calificaciones y evolución académica.' },
  '/apuntes':      { icon: '📝', title: 'Apuntes',       desc: 'Organizá y guardá tus apuntes de clase en un solo lugar.' },
  '/configuracion':{ icon: '⚙️', title: 'Configuración', desc: 'Personalizá tu perfil y preferencias de la plataforma.' },
};

const Proximamente: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const info = SECTION_INFO[location.pathname] ?? {
    icon: '🚧',
    title: 'Próximamente',
    desc: 'Esta sección estará disponible muy pronto.',
  };

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="prox-screen">
            <div className="prox-badge">En desarrollo</div>
            <div className="prox-icon">{info.icon}</div>
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
