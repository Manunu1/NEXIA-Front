import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './sidebar.css';
import logoEscuela from '../../assets/Logo.png';
import LogoutButton from '../Logout';
import ProfileImage from '../ProfileImage';
import { useSesionUsuario } from '../../hooks/useSesionUsuario';
import { getRolActual, HOME_BY_ROL, IconConfig, NAV_BY_ROL } from './navConfig';
import type { NavItem } from './navConfig';

/* ─────────────────────────────────────────────
   SIDEBAR — navegación principal de la app.
   Única para todos los roles: el contenido se
   deriva siempre del rol de la sesión activa
   (ver navConfig), nunca de la página que la monta.
───────────────────────────────────────────── */

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const [rol] = useState(getRolActual);
  // Reactivo: al editar el perfil, el nombre y la imagen se actualizan sin recargar.
  const usuario = useSesionUsuario();

  const nombreCompleto = `${usuario?.nombre ?? ''} ${usuario?.apellido ?? ''}`.trim() || 'Usuario';
  const sections = NAV_BY_ROL[rol];

  // En mobile, cerrar el panel al navegar a otra sección
  const closeOnNavigate = () => setIsOpen(false);

  /* El panel de mobile es un overlay: tiene que cerrarse con Escape. Sin esto,
     quien navega con teclado queda atrapado detrás de la capa oscura, con el
     único cierre disponible en un botón que ya pasó de largo. */
  useEffect(() => {
    if (!isOpen) return;

    const alEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('keydown', alEscape);
    return () => document.removeEventListener('keydown', alEscape);
  }, [isOpen]);

  const isActive = (item: NavItem) =>
    item.match.some(p =>
      p.endsWith('*')
        ? location.pathname.startsWith(p.slice(0, -1))
        : location.pathname === p
    );

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
        aria-expanded={isOpen}
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
          <Link to={HOME_BY_ROL[rol]} onClick={closeOnNavigate}>
            <img src={logoEscuela} alt="Logo" onError={handleImageError} />
            <span className="sidebar-logo-fallback" style={{ display: 'none' }}>NEXIA</span>
          </Link>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <ul className="nav-list">
            {sections.map(section => (
              <React.Fragment key={section.label ?? 'main'}>
                {section.label && (
                  <li className="nav-section-label">{section.label}</li>
                )}
                {section.items.map(item => (
                  <li className="nav-item" key={item.to}>
                    <Link
                      to={item.to}
                      className={`nav-link${isActive(item) ? ' active' : ''}`}
                      aria-current={isActive(item) ? 'page' : undefined}
                      onClick={closeOnNavigate}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-text">{item.label}</span>
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                    </Link>
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
        </nav>

        {/* Bloque de cuenta. El avatar y el nombre ahora SON el acceso al
            perfil: es donde todo el mundo hace clic para eso, y así
            "Configuración" sale de la lista de navegación de contenido. */}
        <div className="sidebar-user">
          <Link
            to="/configuracion"
            className={`sidebar-user-link${location.pathname === '/configuracion' ? ' active' : ''}`}
            onClick={closeOnNavigate}
            aria-current={location.pathname === '/configuracion' ? 'page' : undefined}
          >
            <span className="user-avatar">
              <ProfileImage
                usuario={usuario}
                size={36}
                nombre={usuario?.nombre}
                apellido={usuario?.apellido}
              />
              <span className="status-indicator" />
            </span>
            <span className="user-info">
              <span className="user-name">{nombreCompleto}</span>
              <span className="user-role">{rol.toUpperCase()}</span>
            </span>
            <span className="user-config" aria-hidden="true">{IconConfig}</span>
          </Link>

          <LogoutButton />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
