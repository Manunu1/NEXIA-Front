import React from 'react';
import { Link } from 'react-router-dom';
import type { typeTrabajoPractico } from '../../../Types/profesores/types';
import './listaTrabajosPracticos.css';

function formatFecha(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

type Props = {
  trabajos: typeTrabajoPractico[];
  /** Publica un borrador directamente desde la lista */
  onPublicar?: (tp: typeTrabajoPractico) => void;
  /** Id del TP que se está publicando (para el spinner del botón) */
  publicandoId?: number | null;
};

const ListaTrabajosPracticos: React.FC<Props> = ({ trabajos, onPublicar, publicandoId }) => {
  return (
    <div className="ltp-grid">
      {trabajos.map((tp) => (
        <div key={tp.trabajo_practico_id} className="ltp-card">
          <div className="ltp-card-top">
            <span className={`ltp-badge ${tp.activo ? 'ltp-badge--activo' : 'ltp-badge--borrador'}`}>
              {tp.activo ? 'Publicado' : 'Borrador'}
            </span>
            {!tp.activo && onPublicar && (
              <button
                type="button"
                className="ltp-publicar-btn"
                onClick={() => onPublicar(tp)}
                disabled={publicandoId === tp.trabajo_practico_id}
              >
                {publicandoId === tp.trabajo_practico_id ? (
                  <span className="ltp-publicar-spinner" aria-hidden="true" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
                Publicar
              </button>
            )}
            <Link
              to={`/trabajo-practico/${tp.trabajo_practico_id}/editar`}
              className="ltp-edit-btn"
              aria-label="Editar trabajo práctico"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
          </div>

          <Link to={`/trabajo-practico/${tp.trabajo_practico_id}/entregas`} className="ltp-card-body">
            <h3 className="ltp-title">{tp.titulo}</h3>
            {tp.descripcion && <p className="ltp-desc">{tp.descripcion}</p>}
            <div className="ltp-meta">
              {tp.fecha_limite && (
                <span className="ltp-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  Vence {formatFecha(tp.fecha_limite)}
                </span>
              )}
              {typeof tp.cantidad_entregas === 'number' && (
                <span className="ltp-meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                  {tp.cantidad_entregas} entregas
                </span>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ListaTrabajosPracticos;
