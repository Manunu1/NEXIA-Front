import React from 'react';
import { materiaTheme, materiaInicial } from '../../../utils/materiaTheme';
import './materia.css';

interface MateriaProps {
  materia: string;
  grado: string;
  anio: number;
  descripcion: string;
}

const Materia: React.FC<MateriaProps> = ({ materia, grado, anio, descripcion }) => {
  const theme = materiaTheme(materia);

  return (
    <div className="mtc-card">
      {/* Banner con la identidad de color de la materia */}
      <div
        className="mtc-banner"
        style={{ background: `linear-gradient(130deg, ${theme.from} 0%, ${theme.to} 100%)` }}
      >
        <span className="mtc-watermark" aria-hidden="true">{materiaInicial(materia)}</span>
        <span className="mtc-orb" aria-hidden="true" />
        <span className="mtc-curso">{anio}° {grado}</span>
        <h2 className="mtc-title">{materia}</h2>
      </div>

      <div className="mtc-body">
        {descripcion ? (
          <p className="mtc-desc">{descripcion}</p>
        ) : (
          <p className="mtc-desc mtc-desc--empty">Sin descripción</p>
        )}
      </div>

      <div className="mtc-footer">
        <span className="mtc-footer-label" style={{ color: theme.accent }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Gestionar materia
        </span>
        <span className="mtc-arrow" style={{ background: theme.soft, color: theme.accent }} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default Materia;
