import React from 'react';
import { Link } from 'react-router-dom';
import './quickLinks.css';

/* ─────────────────────────────────────────────
   QUICK LINKS — panel de accesos rápidos a otras
   secciones. Usado en los inicios de cada rol.

   Absorbió a la vieja tarjeta de promoción de
   Nexia IA: las dos hacían exactamente lo mismo
   —llevarte a otro lado— y juntas dejaban el rail
   con cuatro cajas compitiendo entre sí. Ahora
   Nexia IA es un ítem destacado más, y el rail
   tiene una sola lista de "a dónde ir".
───────────────────────────────────────────── */

export interface QuickLinkItem {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  /**
   * Le da el acento naranja de la marca. Como mucho uno por lista: si todo
   * está destacado, no hay nada destacado.
   */
  destacado?: boolean;
}

interface QuickLinksProps {
  title?: string;
  items: QuickLinkItem[];
}

const QuickLinks: React.FC<QuickLinksProps> = ({ title = 'Accesos rápidos', items }) => (
  <nav className="ql" aria-label={title}>
    <span className="nx-rotulo ql-title">{title}</span>
    <ul className="ql-list">
      {items.map((item) => (
        <li key={item.to}>
          <Link
            to={item.to}
            className={`ql-item${item.destacado ? ' ql-item--destacado' : ''}`}
          >
            <span className="ql-icon">{item.icon}</span>
            <span className="ql-body">
              <span className="ql-item-title">{item.title}</span>
              <span className="ql-item-desc">{item.description}</span>
            </span>
            <svg className="ql-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  </nav>
);

export default QuickLinks;
