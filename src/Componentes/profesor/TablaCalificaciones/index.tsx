import React, { useState } from 'react';
import type { typeCalificacionRoster } from '../../../Types/profesores/types';
import './tablaCalificaciones.css';

type RowState = { nota: string; observaciones: string; saving: boolean; error: string | null; saved: boolean };

type Props = {
  rows: typeCalificacionRoster[];
  onSave: (alumnoId: number, nota: number, observaciones: string) => Promise<void>;
};

function buildRowState(rows: typeCalificacionRoster[]): Record<number, RowState> {
  const initial: Record<number, RowState> = {};
  rows.forEach((r) => {
    initial[r.alumno_id] = {
      nota: r.nota != null ? String(r.nota) : '',
      observaciones: r.observaciones ?? '',
      saving: false,
      error: null,
      saved: false,
    };
  });
  return initial;
}

const TablaCalificaciones: React.FC<Props> = ({ rows, onSave }) => {
  const [rowState, setRowState] = useState<Record<number, RowState>>(() => buildRowState(rows));

  // Resincronizar cuando cambian las filas (patrón "derived state" en render,
  // en lugar de un efecto que provoca doble render)
  const [prevRows, setPrevRows] = useState(rows);
  if (rows !== prevRows) {
    setPrevRows(rows);
    setRowState(buildRowState(rows));
  }

  const patchRow = (alumnoId: number, patch: Partial<RowState>) => {
    setRowState((prev) => ({ ...prev, [alumnoId]: { ...prev[alumnoId], ...patch } }));
  };

  const handleGuardar = async (row: typeCalificacionRoster) => {
    const state = rowState[row.alumno_id];
    const notaNum = Number(state.nota);
    if (state.nota === '' || isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      patchRow(row.alumno_id, { error: 'La nota debe ser un número entre 0 y 10.' });
      return;
    }
    patchRow(row.alumno_id, { saving: true, error: null, saved: false });
    try {
      await onSave(row.alumno_id, notaNum, state.observaciones);
      patchRow(row.alumno_id, { saving: false, saved: true });
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      patchRow(row.alumno_id, { saving: false, error: ex.response?.data?.message || 'No se pudo guardar la nota.' });
    }
  };

  return (
    <div className="tc-table">
      <div className="tc-row tc-row--head">
        <span className="tc-col tc-col--alumno">Alumno</span>
        <span className="tc-col tc-col--nota">Nota</span>
        <span className="tc-col tc-col--obs">Observaciones</span>
        <span className="tc-col tc-col--accion" />
      </div>

      {rows.map((row) => {
        const state = rowState[row.alumno_id];
        if (!state) return null;
        return (
          <div key={row.alumno_id} className="tc-row">
            <span className="tc-col tc-col--alumno">{row.alumno_nombre} {row.alumno_apellido}</span>
            <span className="tc-col tc-col--nota">
              <input
                type="number"
                className="tc-nota-input"
                placeholder="—"
                min={0}
                max={10}
                step={0.5}
                value={state.nota}
                onChange={(e) => patchRow(row.alumno_id, { nota: e.target.value, saved: false })}
              />
            </span>
            <span className="tc-col tc-col--obs">
              <input
                type="text"
                className="tc-obs-input"
                placeholder="Observaciones (opcional)"
                value={state.observaciones}
                onChange={(e) => patchRow(row.alumno_id, { observaciones: e.target.value, saved: false })}
              />
            </span>
            <span className="tc-col tc-col--accion">
              <button className="tc-guardar-btn" disabled={state.saving} onClick={() => handleGuardar(row)}>
                {state.saving ? '...' : state.saved ? '✓' : 'Guardar'}
              </button>
            </span>
            {state.error && <span className="tc-row-error">{state.error}</span>}
          </div>
        );
      })}
    </div>
  );
};

export default TablaCalificaciones;
