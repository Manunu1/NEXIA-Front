import React from 'react';
import { Link } from 'react-router-dom';
import './nexiaPromo.css';

/* ─────────────────────────────────────────────
   NEXIA PROMO — tarjeta que invita a usar el
   tutor pedagógico Nexia IA desde los inicios.
───────────────────────────────────────────── */

interface NexiaPromoProps {
  title: string;
  description: string;
  ctaLabel?: string;
}

const NexiaPromo: React.FC<NexiaPromoProps> = ({
  title,
  description,
  ctaLabel = 'Abrir Nexia IA',
}) => (
  <aside className="nxp">
    <div className="nxp-orb" aria-hidden="true" />
    <div className="nxp-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    </div>
    <h3 className="nxp-title">{title}</h3>
    <p className="nxp-desc">{description}</p>
    <Link to="/nexia-ia" className="nxp-cta">
      {ctaLabel}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    </Link>
  </aside>
);

export default NexiaPromo;
