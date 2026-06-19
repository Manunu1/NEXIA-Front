import React from 'react';
import type { typeContenido } from '../../../Types/profesores/types';
import './contenido.css';

function getIcon(tipo: string, url: string): string {
  const u = (url || '').toLowerCase();
  const t = (tipo || '').toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return '▶';
  if (u.includes('docs.google.com/presentation')) return '📊';
  if (u.includes('drive.google.com') || u.includes('docs.google.com')) return '📁';
  if (t.includes('video')) return '🎬';
  if (t.includes('pdf') || u.endsWith('.pdf')) return '📄';
  if (t.includes('presentac') || t.includes('slides')) return '📊';
  if (t.includes('audio')) return '🎵';
  return '📎';
}

function getIconBg(tipo: string, url: string): string {
  const u = (url || '').toLowerCase();
  const t = (tipo || '').toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return '#FFF1F1';
  if (u.includes('drive.google.com') || u.includes('docs.google.com')) return '#E8F5E9';
  if (t.includes('pdf') || u.endsWith('.pdf')) return '#FFF8E6';
  return 'var(--navy-ghost)';
}

const Contenido: React.FC<typeContenido> = ({ titulo, descripcion, tipo_contenido, url }) => {
  const icon = getIcon(tipo_contenido, url);
  const iconBg = getIconBg(tipo_contenido, url);

  return (
    <div className="contenido-card-pro">
      <div className="contenido-card-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="contenido-card-body">
        <h3 className="contenido-card-title">{titulo}</h3>
        {descripcion && <p className="contenido-card-desc">{descripcion}</p>}
        <span className="contenido-card-badge">{tipo_contenido}</span>
      </div>
      <div className="contenido-card-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </div>
  );
};

export default Contenido;
