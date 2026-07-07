import React from 'react';
import './emptyState.css';

/* ─────────────────────────────────────────────
   EMPTY STATE — estado vacío unificado con ícono
   SVG (nunca emojis), título, descripción y una
   acción opcional.
───────────────────────────────────────────── */

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="es">
    <div className="es-icon" aria-hidden="true">{icon}</div>
    <h3 className="es-title">{title}</h3>
    <p className="es-desc">{description}</p>
    {action && <div className="es-action">{action}</div>}
  </div>
);

export default EmptyState;
