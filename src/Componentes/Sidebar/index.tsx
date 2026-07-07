import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './sidebar.css';
import logoEscuela from '../../assets/Logo.png';
import LogoutButton from '../Logout';
import { getRolActual, HOME_BY_ROL, NAV_BY_ROL } from './navConfig';
import type { NavItem } from './navConfig';

/* ─────────────────────────────────────────────
   SIDEBAR — navegación principal de la app.
   Única para todos los roles: el contenido se
   deriva siempre del rol de la sesión activa
   (ver navConfig), nunca de la página que la monta.
───────────────────────────────────────────── */

interface SessionInfo {
  name: string;
  initials: string;
  roleLabel: string;
}

function getSessionInfo(roleLabel: string): SessionInfo {
  try {
    const session = localStorage.getItem('usuario');
    if (session) {
      const user = JSON.parse(session);
      const nombre = `${user.nombre || ''} ${user.apellido || ''}`.trim();
      if (nombre) {
        const initials = nombre
          .split(' ')
          .filter(Boolean)
          .map((p: string) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        return { name: nombre, initials, roleLabel };
      }
    }
  } catch {
    /* sesión ilegible → datos de fallback */
  }
  return { name: 'Usuario', initials: 'US', roleLabel };
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const [rol] = useState(getRolActual);
  const [session] = useState(() => getSessionInfo(rol.toUpperCase()));

  const sections = NAV_BY_ROL[rol];

  // En mobile, cerrar el panel al navegar a otra sección
  const closeOnNavigate = () => setIsOpen(false);

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
                      {item.badge === 'plus' && <span className="nav-badge plus">PLUS</span>}
                    </Link>
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            <span className="user-avatar-fallback" style={{ display: 'flex' }}>
              {session.initials}
            </span>
            <span className="status-indicator" />
          </div>
          <div className="user-info">
            <span className="user-name">{session.name}</span>
            <span className="user-role">{session.roleLabel}</span>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
