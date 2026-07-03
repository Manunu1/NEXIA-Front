import React from 'react';
import { Link } from 'react-router-dom';
import './materiaTabs.css';

type Tab = 'contenidos' | 'trabajos-practicos' | 'notas';

interface Props {
  profeCursoMateriaId: string | number;
  active: Tab;
}

const MateriaTabs: React.FC<Props> = ({ profeCursoMateriaId, active }) => {
  const tabs: { key: Tab; label: string; to: string }[] = [
    { key: 'contenidos', label: 'Contenidos', to: `/contenidos/${profeCursoMateriaId}` },
    { key: 'trabajos-practicos', label: 'Trabajos prácticos', to: `/trabajos-practicos/${profeCursoMateriaId}` },
    { key: 'notas', label: 'Notas', to: `/notas/${profeCursoMateriaId}` },
  ];

  return (
    <nav className="mt-tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          to={tab.to}
          className={`mt-tab${active === tab.key ? ' mt-tab--active' : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
};

export default MateriaTabs;
