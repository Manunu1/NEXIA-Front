import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../alumnos/Sidebar/sidebar.css';
import './sidebarGestor.css';
import logoEscuela from '../../../assets/Logo.png';
import LogoutButton from '../../Logout';

const SidebarGestor: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('Gestor');
  const [userInitials, setUserInitials] = useState('GT');

  useEffect(() => {
    try {
      const session = localStorage.getItem('usuario');
      if (session) {
        const user = JSON.parse(session);
        const nombre = `${user.nombre || ''} ${user.apellido || ''}`.trim();
        if (nombre) {
          setUserName(nombre);
          const parts = nombre.split(' ').filter(Boolean);
          setUserInitials(parts.map((p: string) => p[0]).join('').slice(0, 2).toUpperCase());
        }
      }
    } catch {}
  }, []);

  const nav = (paths: string[]) => {
    const active = paths.some(p =>
      p.endsWith('*')
        ? location.pathname.startsWith(p.slice(0, -1))
        : location.pathname === p
    );
    return `nav-link${active ? ' active' : ''}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.currentTarget as HTMLImageElement).style.display = 'none';
    const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
    if (fb) fb.style.display = 'flex';
  };

  return (
    <>
      <button
        className={`sidebar-toggle ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(false)} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Link to="/gestor">
            <img src={logoEscuela} alt="Logo" onError={handleImageError} />
            <span className="sidebar-logo-fallback" style={{ display: 'none' }}>NEXIA</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">

            <li className="nav-section-label">GESTIÓN</li>

            <li className="nav-item">
              <Link to="/gestor" className={nav(['/gestor'])}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </span>
                <span className="nav-text">Panel principal</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/gestor/alumnos" className={nav(['/gestor/alumnos'])}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <span className="nav-text">Alumnos</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/gestor/profesores" className={nav(['/gestor/profesores'])}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </span>
                <span className="nav-text">Profesores</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/gestor/asignaciones" className={nav(['/gestor/asignaciones'])}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </span>
                <span className="nav-text">Asignaciones</span>
              </Link>
            </li>

            <li className="nav-section-label">GENERAL</li>

            <li className="nav-item">
              <Link to="/comunicados" className={nav(['/comunicados'])}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </span>
                <span className="nav-text">Comunicados</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/nexia-ia" className={nav(['/nexia-ia'])}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
                <span className="nav-text">Nexia IA</span>
                <span className="nav-badge plus">PLUS</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link to="/configuracion" className={nav(['/configuracion'])}>
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </span>
                <span className="nav-text">Configuración</span>
              </Link>
            </li>

          </ul>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            <span className="user-avatar-fallback" style={{ display: 'flex' }}>
              {userInitials}
            </span>
            <span className="status-indicator" />
          </div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">GESTOR</span>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
};

export default SidebarGestor;
