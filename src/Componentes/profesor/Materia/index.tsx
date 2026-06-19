import React from 'react';
import './materia.css';

interface MateriaProps {
  materia: string;
  grado: string;
  anio: number;
  descripcion: string;
}

const Materia: React.FC<MateriaProps> = ({ materia, grado, anio, descripcion }) => {
  return (
    <div className="card">
      <span className="card-chip">{anio}° {grado}</span>

      <div className="cardBody">
        <h2>{materia}</h2>
        {descripcion && <p className="card-desc">{descripcion}</p>}
      </div>

      <div className="card-footer">
        <span className="card-footer-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Ver contenidos
        </span>
        <div className="card-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Materia;
