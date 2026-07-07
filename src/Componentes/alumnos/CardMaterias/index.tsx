import React from 'react';
import { materiaTheme, materiaInicial } from '../../../utils/materiaTheme';
import './cardmaterias.css';

interface CardMateriaProps {
  curso: string | number;
  titulo: string;
  profesor: string;
  avatarUrl: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const CardMateria: React.FC<CardMateriaProps> = ({ curso, titulo, profesor, avatarUrl }) => {
  const nombreProfe = profesor && profesor.trim() && profesor !== 'undefined undefined' ? profesor : '';
  const initials = nombreProfe ? getInitials(nombreProfe) : 'P';
  const [imgOk, setImgOk] = React.useState(!!avatarUrl);
  const theme = materiaTheme(titulo);

  return (
    <div className="card-materia">
      {/* Banner con la identidad de color de la materia */}
      <div
        className="cm-banner"
        style={{ background: `linear-gradient(130deg, ${theme.from} 0%, ${theme.to} 100%)` }}
      >
        <span className="cm-watermark" aria-hidden="true">{materiaInicial(titulo)}</span>
        <span className="cm-orb" aria-hidden="true" />
        <span className="cm-curso">{curso}</span>
        <h2 className="cm-title">{titulo}</h2>
      </div>

      <div className="cm-body">
        {nombreProfe ? (
          <div className="cm-profesor">
            <div className="cm-avatar" style={{ background: theme.soft, color: theme.accent }}>
              {imgOk && avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={nombreProfe}
                  className="cm-avatar-img"
                  onError={() => setImgOk(false)}
                />
              ) : (
                <span className="cm-avatar-initials">{initials}</span>
              )}
            </div>
            <div className="cm-profesor-info">
              <span className="cm-profesor-nombre">{nombreProfe}</span>
              <span className="cm-profesor-rol">Docente</span>
            </div>
          </div>
        ) : (
          <span className="cm-sin-profe">Sin docente asignado</span>
        )}

        <span className="cm-arrow" style={{ background: theme.soft, color: theme.accent }} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default CardMateria;
