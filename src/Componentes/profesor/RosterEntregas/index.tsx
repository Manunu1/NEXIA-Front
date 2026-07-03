import React, { useState } from 'react';
import type { typeEntregaRoster } from '../../../Types/profesores/types';
import './rosterEntregas.css';

function formatFecha(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function estadoBadge(estado: typeEntregaRoster['estado']) {
  if (estado === 'corregido') return <span className="re-badge re-badge--corregido">Corregido</span>;
  if (estado === 'pendiente') return <span className="re-badge re-badge--pendiente">Pendiente de corrección</span>;
  return <span className="re-badge re-badge--sin-entrega">Sin entregar</span>;
}

type RowState = { nota: string; comentario: string; saving: boolean; error: string | null; saved: boolean };

type Props = {
  rows: typeEntregaRoster[];
  onGrade: (alumnoId: number, nota: number, comentario: string) => Promise<void>;
};

const RosterEntregas: React.FC<Props> = ({ rows, onGrade }) => {
  const [rowState, setRowState] = useState<Record<number, RowState>>(() => {
    const initial: Record<number, RowState> = {};
    rows.forEach((r) => {
      initial[r.alumno_id] = {
        nota: r.nota != null ? String(r.nota) : '',
        comentario: r.comentario_correccion ?? '',
        saving: false,
        error: null,
        saved: false,
      };
    });
    return initial;
  });

  const patchRow = (alumnoId: number, patch: Partial<RowState>) => {
    setRowState((prev) => ({ ...prev, [alumnoId]: { ...prev[alumnoId], ...patch } }));
  };

  const handleGuardar = async (row: typeEntregaRoster) => {
    const state = rowState[row.alumno_id];
    const notaNum = Number(state.nota);
    if (state.nota === '' || isNaN(notaNum)) {
      patchRow(row.alumno_id, { error: 'Ingresá una nota válida.' });
      return;
    }
    patchRow(row.alumno_id, { saving: true, error: null, saved: false });
    try {
      await onGrade(row.alumno_id, notaNum, state.comentario);
      patchRow(row.alumno_id, { saving: false, saved: true });
    } catch (err: any) {
      patchRow(row.alumno_id, { saving: false, error: err.response?.data?.message || 'No se pudo guardar la nota.' });
    }
  };

  return (
    <div className="re-table">
      <div className="re-row re-row--head">
        <span className="re-col re-col--alumno">Alumno</span>
        <span className="re-col re-col--estado">Estado</span>
        <span className="re-col re-col--archivo">Entrega</span>
        <span className="re-col re-col--nota">Nota</span>
        <span className="re-col re-col--comentario">Comentario</span>
        <span className="re-col re-col--accion" />
      </div>

      {rows.map((row) => {
        const state = rowState[row.alumno_id];
        const puedeCalificar = row.entrega_id != null;
        return (
          <div key={row.alumno_id} className="re-row">
            <span className="re-col re-col--alumno">
              <span className="re-alumno-nombre">{row.alumno_nombre} {row.alumno_apellido}</span>
              {row.fecha_entrega && <span className="re-alumno-fecha">Entregó {formatFecha(row.fecha_entrega)}</span>}
            </span>
            <span className="re-col re-col--estado">{estadoBadge(row.estado)}</span>
            <span className="re-col re-col--archivo">
              {row.archivo_url ? (
                <a href={row.archivo_url} target="_blank" rel="noopener noreferrer" className="re-archivo-link">
                  Ver entrega ↗
                </a>
              ) : (
                <span className="re-archivo-none">—</span>
              )}
            </span>
            <span className="re-col re-col--nota">
              <input
                type="number"
                className="re-nota-input"
                placeholder="—"
                value={state.nota}
                disabled={!puedeCalificar}
                onChange={(e) => patchRow(row.alumno_id, { nota: e.target.value, saved: false })}
              />
            </span>
            <span className="re-col re-col--comentario">
              <input
                type="text"
                className="re-comentario-input"
                placeholder="Comentario (opcional)"
                value={state.comentario}
                disabled={!puedeCalificar}
                onChange={(e) => patchRow(row.alumno_id, { comentario: e.target.value, saved: false })}
              />
            </span>
            <span className="re-col re-col--accion">
              <button
                className="re-guardar-btn"
                disabled={!puedeCalificar || state.saving}
                onClick={() => handleGuardar(row)}
              >
                {state.saving ? '...' : state.saved ? '✓' : 'Guardar'}
              </button>
            </span>
            {state.error && <span className="re-row-error">{state.error}</span>}
          </div>
        );
      })}
    </div>
  );
};

export default RosterEntregas;
