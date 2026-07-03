import React from 'react';
import { Link } from 'react-router-dom';
import './materiaTabsAlumno.css';

type Tab = 'contenidos' | 'trabajos-practicos';

interface Props {
  profeCursoMateriaId: string | number;
  active: Tab;
}

const MateriaTabsAlumno: React.FC<Props> = ({ profeCursoMateriaId, active }) => {
  const tabs: { key: Tab; label: string; to: string }[] = [
    { key: 'contenidos', label: 'Contenidos', to: `/materia/${profeCursoMateriaId}` },
    { key: 'trabajos-practicos', label: 'Trabajos prácticos', to: `/materia/${profeCursoMateriaId}/trabajos-practicos` },
  ];

  return (
    <nav className="mta-tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          to={tab.to}
          className={`mta-tab${active === tab.key ? ' mta-tab--active' : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
};

export default MateriaTabsAlumno;
