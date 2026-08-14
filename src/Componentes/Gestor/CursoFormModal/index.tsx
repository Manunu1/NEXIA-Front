import React, { useMemo, useState } from 'react';
import Modal from '../../Modal';
import NexiaSelect from '../../Select';
import api from '../../../api';
import { mensajeDeError } from '../../../utils/apiError';
import './cursoFormModal.css';

/* ─────────────────────────────────────────────
   CURSO — alta y edición.

   Un solo modal para los dos casos: el formulario
   es idéntico y sólo cambian el verbo, el endpoint
   y los valores iniciales. Separarlos habría dejado
   dos copias del mismo cuerpo que se desincronizan
   a la primera validación nueva.
───────────────────────────────────────────── */

export interface Curso {
  curso_id: number;
  anio: number;
  division: string;
  especialidad_id: number | null;
  especialidad_nombre: string | null;
  cantidad_alumnos: number;
  cantidad_materias: number;
}

export interface EspecialidadOpcion {
  especialidad_id: number;
  nombre: string;
}

interface Opcion {
  value: number;
  label: string;
}

interface CursoFormModalProps {
  /** null = alta; un curso = edición de ese curso. */
  curso: Curso | null;
  especialidades: EspecialidadOpcion[];
  onClose: () => void;
  /** Recibe el curso ya persistido para refrescar la lista sin recargar. */
  onSaved: (curso: Curso) => void;
}

/* El año se elige de una lista cerrada en vez de escribirse: evita el
   "8° año" que la base aceptaría y el gestor no querría. */
const ANIOS: Opcion[] = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  value: n,
  label: `${n}° año`,
}));

const CursoFormModal: React.FC<CursoFormModalProps> = ({
  curso,
  especialidades,
  onClose,
  onSaved,
}) => {
  const esEdicion = curso !== null;

  const opcionesEspecialidad = useMemo<Opcion[]>(
    () => especialidades.map((e) => ({ value: e.especialidad_id, label: e.nombre })),
    [especialidades]
  );

  const [anio, setAnio] = useState<Opcion | null>(
    curso ? ANIOS.find((a) => a.value === Number(curso.anio)) ?? null : null
  );
  const [division, setDivision] = useState(curso?.division ?? '');
  const [especialidad, setEspecialidad] = useState<Opcion | null>(
    curso?.especialidad_id
      ? opcionesEspecialidad.find((e) => e.value === curso.especialidad_id) ?? null
      : null
  );

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const limpiarError = () => { if (error) setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!anio) {
      setError('Elegí el año del curso.');
      return;
    }
    if (!division.trim()) {
      setError('Ingresá la división (por ejemplo: A).');
      return;
    }

    const body = {
      anio: anio.value,
      division: division.trim(),
      especialidad_id: especialidad?.value ?? null,
    };

    setGuardando(true);
    try {
      const res = esEdicion
        ? await api.put(`/api/cursos/${curso.curso_id}`, body)
        : await api.post('/api/cursos', body);

      const guardado = res.data.data;

      /* La respuesta del alta/edición no trae el nombre de la especialidad ni
         los contadores — son datos del listado, no de la tabla curso. Se
         reconstruyen acá para que la tarjeta quede completa sin pedir de
         nuevo toda la lista al servidor. */
      onSaved({
        curso_id: guardado.curso_id,
        anio: Number(guardado.anio),
        division: guardado.division,
        especialidad_id: guardado.especialidad_id ?? null,
        especialidad_nombre: especialidad?.label ?? null,
        cantidad_alumnos: curso?.cantidad_alumnos ?? 0,
        cantidad_materias: curso?.cantidad_materias ?? 0,
      });
      onClose();
    } catch (err) {
      setError(mensajeDeError(err, esEdicion ? 'No se pudo guardar el curso.' : 'No se pudo crear el curso.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal open onClose={guardando ? () => {} : onClose} size="sm" labelledBy="cfm-title">
      <form onSubmit={handleSubmit} className="cfm">
        <div className="cfm-header">
          <div className="cfm-header-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div className="cfm-header-text">
            <span id="cfm-title" className="cfm-title">
              {esEdicion ? 'Editar curso' : 'Nuevo curso'}
            </span>
            <span className="cfm-sub">
              {esEdicion
                ? 'Los cambios se reflejan en alumnos y asignaciones'
                : 'Después vas a poder asignarle materias y alumnos'}
            </span>
          </div>
        </div>

        <div className="cfm-body">
          {error && (
            <div className="cfm-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div className="cfm-row">
            <NexiaSelect<Opcion>
              label="Año"
              options={ANIOS}
              value={anio}
              onChange={(opt) => { setAnio(opt); limpiarError(); }}
              placeholder="Elegir año…"
              isSearchable={false}
              isDisabled={guardando}
            />

            <div className="nx-field">
              <label className="nx-label" htmlFor="cfm-division">División</label>
              <input
                id="cfm-division"
                className="nx-control"
                type="text"
                maxLength={10}
                placeholder="Ej: A"
                value={division}
                onChange={(e) => { setDivision(e.target.value); limpiarError(); }}
                disabled={guardando}
                autoFocus={!esEdicion}
                required
              />
            </div>
          </div>

          <NexiaSelect<Opcion>
            label="Especialidad"
            options={opcionesEspecialidad}
            value={especialidad}
            onChange={(opt) => { setEspecialidad(opt); limpiarError(); }}
            placeholder="Sin especialidad"
            isClearable
            isDisabled={guardando || opcionesEspecialidad.length === 0}
            hint={
              opcionesEspecialidad.length === 0
                ? 'Tu institución todavía no tiene especialidades cargadas. Podés crear el curso igual.'
                : 'Opcional. Sirve para agrupar los cursos de una misma orientación.'
            }
          />

          {/* El nombre se arma solo: confirma al gestor cómo va a aparecer el
              curso en el resto de la plataforma antes de guardar. */}
          {anio && division.trim() && (
            <p className="cfm-preview">
              Se va a crear como <strong>{anio.value}° {division.trim()}</strong>
              {especialidad ? <> · {especialidad.label}</> : null}
            </p>
          )}
        </div>

        <div className="cfm-footer">
          <button type="button" className="cfm-btn cfm-btn--ghost" onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button type="submit" className="cfm-btn cfm-btn--primary" disabled={guardando}>
            {guardando && <span className="cfm-spinner" aria-hidden="true" />}
            {guardando ? 'Guardando…' : esEdicion ? 'Guardar cambios' : 'Crear curso'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CursoFormModal;
