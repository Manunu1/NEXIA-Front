import React from 'react';
import type { typeAsistenciaRoster, EstadoAsistencia } from '../../../Types/profesores/types';
import './tablaAsistencia.css';

const ESTADOS: { key: EstadoAsistencia; label: string; short: string }[] = [
  { key: 'presente', label: 'Presente', short: 'P' },
  { key: 'ausente', label: 'Ausente', short: 'A' },
  { key: 'tardanza', label: 'Tardanza', short: 'T' },
  { key: 'justificado', label: 'Justificado', short: 'J' },
];

type Props = {
  rows: typeAsistenciaRoster[];
  estados: Record<number, EstadoAsistencia>;
  observaciones: Record<number, string>;
  onEstadoChange: (alumnoId: number, estado: EstadoAsistencia) => void;
  onObservacionChange: (alumnoId: number, value: string) => void;
  disabled?: boolean;
};

const TablaAsistencia: React.FC<Props> = ({
  rows,
  estados,
  observaciones,
  onEstadoChange,
  onObservacionChange,
  disabled = false,
}) => {
  return (
    <div className="ta-table">
      <div className="ta-row ta-row--head">
        <span className="ta-col ta-col--alumno">Alumno</span>
        <span className="ta-col ta-col--estado">Estado</span>
        <span className="ta-col ta-col--obs">Observación</span>
      </div>

      {rows.map((row) => {
        const estado = estados[row.alumno_id] ?? 'presente';
        return (
          <div key={row.alumno_id} className={`ta-row ta-row--${estado}`}>
            <span className="ta-col ta-col--alumno">
              <span className="ta-alumno-nombre">{row.alumno_nombre} {row.alumno_apellido}</span>
            </span>
            <span className="ta-col ta-col--estado">
              <div className="ta-estado-group" role="group" aria-label={`Estado de asistencia de ${row.alumno_nombre} ${row.alumno_apellido}`}>
                {ESTADOS.map((e) => (
                  <button
                    key={e.key}
                    type="button"
                    className={`ta-estado-btn ta-estado-btn--${e.key}${estado === e.key ? ' ta-estado-btn--active' : ''}`}
                    onClick={() => onEstadoChange(row.alumno_id, e.key)}
                    disabled={disabled}
                    title={e.label}
                    aria-label={e.label}
                    aria-pressed={estado === e.key}
                  >
                    {e.short}
                  </button>
                ))}
              </div>
            </span>
            <span className="ta-col ta-col--obs">
              <input
                type="text"
                className="ta-obs-input"
                placeholder="Observación (opcional)"
                value={observaciones[row.alumno_id] ?? ''}
                disabled={disabled}
                onChange={(e) => onObservacionChange(row.alumno_id, e.target.value)}
              />
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default TablaAsistencia;
