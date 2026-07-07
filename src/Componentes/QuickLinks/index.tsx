import React from 'react';
import { Link } from 'react-router-dom';
import './quickLinks.css';

/* ─────────────────────────────────────────────
   QUICK LINKS — panel de accesos rápidos a otras
   secciones. Usado en los inicios de cada rol.
───────────────────────────────────────────── */

export interface QuickLinkItem {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface QuickLinksProps {
  title?: string;
  items: QuickLinkItem[];
}

const QuickLinks: React.FC<QuickLinksProps> = ({ title = 'Accesos rápidos', items }) => (
  <nav className="ql" aria-label={title}>
    <span className="ql-title">{title}</span>
    <ul className="ql-list">
      {items.map((item) => (
        <li key={item.to}>
          <Link to={item.to} className="ql-item">
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
