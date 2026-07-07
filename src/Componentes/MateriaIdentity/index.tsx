import React from 'react';
import { materiaTheme, materiaInicial } from '../../utils/materiaTheme';
import './materiaIdentity.css';

/* ─────────────────────────────────────────────
   MATERIA IDENTITY — sello compacto de la materia
   (color + inicial + nombre + curso). Da continuidad
   a la identidad de color dentro de cada materia.
───────────────────────────────────────────── */

interface MateriaIdentityProps {
  nombre: string;
  anio?: number | string;
  division?: string;
  /** Línea secundaria (ej: "Contenidos", "Trabajos prácticos") */
  seccion?: string;
}

const MateriaIdentity: React.FC<MateriaIdentityProps> = ({ nombre, anio, division, seccion }) => {
  const theme = materiaTheme(nombre);
  const curso = anio && division ? `${anio}° ${division}` : '';
  const sub = [curso, seccion].filter(Boolean).join(' · ');

  return (
    <div className="mid">
      <span
        className="mid-tile"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
        aria-hidden="true"
      >
        {materiaInicial(nombre)}
      </span>
      <span className="mid-text">
        <span className="mid-nombre">{nombre}</span>
        {sub && <span className="mid-sub">{sub}</span>}
      </span>
    </div>
  );
};

export default MateriaIdentity;
