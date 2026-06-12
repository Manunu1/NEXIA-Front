import React, { useState, useEffect } from 'react';
import './sidebar.css';
// Importamos el logo desde assets
import logoEscuela from '../../../assets/Logo.png';
import LogoutButton from '../../Logout';

const Sidebar: React.FC = () => {
  // Estado para el menú móvil con tipado explícito
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // Estado para detectar la página activa
  const [currentPage, setCurrentPage] = useState<string>('inicio');

  useEffect(() => {
    // Detección automática del path activo con encadenamiento opcional
    const path = window.location.pathname.split('/').pop()?.replace('.html', '') || 'inicio';
    setCurrentPage(path);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  // Extracción y tipado estricto del manejador de errores de la imagen
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.style.display = 'none';
    
    // Casteo explícito a HTMLElement para acceder a la propiedad style de forma segura
    const fallbackElement = target.nextElementSibling as HTMLElement | null;
    if (fallbackElement) {
      fallbackElement.style.display = 'flex';
    }
  };

  return (
    <>
      {/* Botón Toggle: Cambia de ícono y posición según el estado isOpen */}
      <button 
        className={`sidebar-toggle ${isOpen ? 'is-open' : ''}`} 
        onClick={toggleSidebar} 
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? (
          // SVG del ícono "X" (Cerrar)
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          // SVG del menú Hamburguesa
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Overlay para mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        {/* Logo Institucional */}
        <div className="sidebar-logo">
          <a href="/inicio">
            <img src={logoEscuela} alt="Logo Escuela" />
          </a>
        </div>

        {/* Navegación principal */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <a href="/inicio.html" className={`nav-link ${currentPage === 'inicio' ? 'active' : ''}`}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </span>
                <span className="nav-text">Inicio</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="/mis-materias.html" className={`nav-link ${currentPage === 'mis-materias' ? 'active' : ''}`}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </span>
                <span className="nav-text">Mis materias</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="/calendario.html" className={`nav-link ${currentPage === 'calendario' ? 'active' : ''}`}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </span>
                <span className="nav-text">Calendario</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="/mensajes.html" className={`nav-link ${currentPage === 'mensajes' ? 'active' : ''}`}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="nav-text">Mensajes</span>
                <span className="nav-badge notification">3</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="/comunicados.html" className={`nav-link ${currentPage === 'comunicados' ? 'active' : ''}`}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <span className="nav-text">Comunicados</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="/nexia-ia.html" className={`nav-link ${currentPage === 'nexia-ia' ? 'active' : ''}`}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
                <span className="nav-text">Nexia IA</span>
                <span className="nav-badge plus">PLUS</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="/mi-boletin.html" className={`nav-link ${currentPage === 'mi-boletin' ? 'active' : ''}`}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </span>
                <span className="nav-text">Mi boletín</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="/apuntes.html" className={`nav-link ${currentPage === 'apuntes' ? 'active' : ''}`}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </span>
                <span className="nav-text">Apuntes</span>
              </a>
            </li>
            <li className="nav-item">
              <a href="/configuracion.html" className={`nav-link ${currentPage === 'configuracion' ? 'active' : ''}`}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </span>
                <span className="nav-text">Configuración</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Usuario */}
        <div className="sidebar-user interactive-hover">
          <div className="user-avatar">
            <img 
              src="Imagenes/avatar.png" 
              alt="Avatar usuario" 
              onError={handleImageError}
            />
            <span className="user-avatar-fallback">JG</span>
            <span className="status-indicator"></span>
          </div>
          <div className="user-info">
            <span className="user-name">Julián García</span>
            <span className="user-role">ALUMNO 5° AÑO A</span>
          </div>
          <LogoutButton/>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;