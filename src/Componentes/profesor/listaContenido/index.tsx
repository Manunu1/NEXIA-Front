import React from 'react';
import Contenido from '../Contenido';
import type { typeContenido } from '../../../Types/profesores/types';
import { Link } from 'react-router-dom';
import './listaContenido.css';

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

type Props = {
  contenidos: typeContenido[];
  selectedId?: number;
  onSelect?: (contenido: typeContenido) => void;
};

const ListaContenido: React.FC<Props> = ({ contenidos, selectedId, onSelect }) => {
  if (onSelect) {
    return (
      <div className="lc-compact-list">
        {contenidos.map((item) => {
          const isSelected = selectedId === item.contenido_id;
          return (
            <button
              key={item.contenido_id}
              className={`lc-item ${isSelected ? 'lc-item--selected' : ''}`}
              onClick={() => onSelect(item)}
            >
              <span className="lc-item-icon">{getIcon(item.tipo_contenido, item.url)}</span>
              <div className="lc-item-info">
                <span className="lc-item-title">{item.titulo}</span>
                {item.tipo_contenido && (
                  <span className="lc-item-type">{item.tipo_contenido}</span>
                )}
              </div>
              {isSelected && <span className="lc-item-playing">▶</span>}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="lista-contenido">
      {contenidos.map((item) => (
        <Link
          key={item.contenido_id}
          to={`/verContenido/${item.contenido_id}`}
          style={{ textDecoration: 'none' }}
        >
          <Contenido
            contenido_id={item.contenido_id}
            titulo={item.titulo}
            descripcion={item.descripcion}
            tipo_contenido={item.tipo_contenido}
            url={item.url}
          />
        </Link>
      ))}
    </div>
  );
};

export default ListaContenido;
