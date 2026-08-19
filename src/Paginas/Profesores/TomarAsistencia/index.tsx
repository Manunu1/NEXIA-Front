import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MateriaIdentity from '../../../Componentes/MateriaIdentity';
import TablaAsistencia from '../../../Componentes/profesor/TablaAsistencia';
import ConfirmDialog from '../../../Componentes/ConfirmDialog';
import type { typeClaseDetalle, typeAsistenciaRoster, EstadoAsistencia } from '../../../Types/profesores/types';
import api from '../../../api';
import './tomarAsistencia.css';

/* `fecha` llega como string de fecha pura ("2026-08-19"), sin hora. Parsearla
   con `new Date(fecha)` la interpreta como medianoche UTC y en Argentina
   (UTC-3) muestra el día anterior — por eso se arma la fecha local a mano. */
function parseFechaLocal(fecha: string): Date {
  const [y, m, d] = fecha.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatFechaLarga(fecha: string): string {
  const d = parseFechaLocal(fecha);
  const texto = d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const TomarAsistencia: React.FC = () => {
  const { claseId } = useParams<{ claseId: string }>();
  const navigate = useNavigate();

  const [clase, setClase] = useState<typeClaseDetalle | null>(null);
  const [alumnos, setAlumnos] = useState<typeAsistenciaRoster[]>([]);
  const [estados, setEstados] = useState<Record<number, EstadoAsistencia>>({});
  const [observaciones, setObservaciones] = useState<Record<number, string>>({});
  const [tema, setTema] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const [mostrarCerrar, setMostrarCerrar] = useState(false);
  const [cerrando, setCerrando] = useState(false);

  useEffect(() => {
    const traer = async () => {
      try {
        const res = await api.get(`/api/clases/${claseId}/asistencias`);
        const data = res.data.data;
        const claseData: typeClaseDetalle = data.clase;
        const roster: typeAsistenciaRoster[] = data.alumnos || [];

        setClase(claseData);
        setAlumnos(roster);
        setTema(claseData.tema || '');

        const estadosIniciales: Record<number, EstadoAsistencia> = {};
        const observacionesIniciales: Record<number, string> = {};
        roster.forEach((a) => {
          estadosIniciales[a.alumno_id] = a.estado;
          observacionesIniciales[a.alumno_id] = a.observaciones || '';
        });
        setEstados(estadosIniciales);
        setObservaciones(observacionesIniciales);
      } catch (err) {
        console.error('Error al obtener la clase:', err);
        setError('No se pudo cargar la clase.');
      } finally {
        setLoading(false);
      }
    };
    if (claseId) traer();
  }, [claseId]);

  const handleEstadoChange = (alumnoId: number, estado: EstadoAsistencia) => {
    setEstados((prev) => ({ ...prev, [alumnoId]: estado }));
    setJustSaved(false);
  };

  const handleObservacionChange = (alumnoId: number, value: string) => {
    setObservaciones((prev) => ({ ...prev, [alumnoId]: value }));
    setJustSaved(false);
  };

  const handleTemaChange = (value: string) => {
    setTema(value);
    setJustSaved(false);
  };

  const handleGuardar = async () => {
    if (!clase) return;
    setSaving(true);
    setErrorGuardar(null);
    try {
      const alumnosPayload = alumnos.map((a) => ({
        alumno_id: a.alumno_id,
        estado: estados[a.alumno_id] ?? 'presente',
        observaciones: observaciones[a.alumno_id]?.trim() || undefined,
      }));

      const peticiones: Promise<unknown>[] = [
        api.post(`/api/clases/${claseId}/asistencias`, { alumnos: alumnosPayload }),
      ];
      if (tema !== (clase.tema || '')) {
        peticiones.push(api.put(`/api/clases/${claseId}`, { tema: tema || undefined }));
      }
      await Promise.all(peticiones);

      setClase((prev) => (prev ? { ...prev, tema } : prev));
      setJustSaved(true);
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setErrorGuardar(ex.response?.data?.message || 'No se pudo guardar la asistencia.');
    } finally {
      setSaving(false);
    }
  };

  const confirmarCerrar = async () => {
    setCerrando(true);
    try {
      await api.patch(`/api/clases/${claseId}/cerrar`);
      setClase((prev) => (prev ? { ...prev, lista_cerrada: true } : prev));
      setMostrarCerrar(false);
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setErrorGuardar(ex.response?.data?.message || 'No se pudo cerrar la lista.');
      setMostrarCerrar(false);
    } finally {
      setCerrando(false);
    }
  };

  const cerrada = clase?.lista_cerrada ?? false;

  return (
    <>
      <div className="iv-page">
        <header className="iv-header">
          <button
            className="iv-back-btn"
            onClick={() => (clase ? navigate(`/asistencia/${clase.profe_curso_materia_id}`) : navigate(-1))}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </button>
          <div className="iv-header-center">
            {clase ? (
              <MateriaIdentity
                nombre={clase.materia_nombre}
                anio={clase.anio}
                division={clase.division}
                seccion={formatFechaLarga(clase.fecha)}
              />
            ) : (
              <h1 className="iv-title">Tomar asistencia</h1>
            )}
            {cerrada && <span className="ta-cerrada-badge">Lista cerrada</span>}
          </div>
          {!loading && !error && !cerrada && (
            <div className="iv-header-actions">
              <button className="ta-guardar-btn" onClick={handleGuardar} disabled={saving || alumnos.length === 0}>
                {saving ? 'Guardando...' : justSaved ? 'Guardado ✓' : 'Guardar asistencia'}
              </button>
              <button className="ta-cerrar-btn" onClick={() => setMostrarCerrar(true)} disabled={alumnos.length === 0}>
                Cerrar lista
              </button>
            </div>
          )}
        </header>

        {loading ? (
          <div className="iv-loading">
            <div className="nexia-loading-spinner" />
            <span>Cargando...</span>
          </div>
        ) : error ? (
          <div className="iv-error">{error}</div>
        ) : alumnos.length === 0 ? (
          <div className="iv-empty ta-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="30" height="30">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p>No hay alumnos asociados al curso de esta materia.</p>
          </div>
        ) : (
          <div className="ta-body">
            <div className="ta-tema-wrap">
              <label className="ta-tema-label" htmlFor="ta-tema">Tema de la clase</label>
              <input
                id="ta-tema"
                type="text"
                className="ta-tema-input"
                placeholder="Ej: Ecuaciones de segundo grado"
                value={tema}
                disabled={cerrada}
                onChange={(e) => handleTemaChange(e.target.value)}
              />
            </div>

            {errorGuardar && <div className="iv-error">{errorGuardar}</div>}

            <TablaAsistencia
              rows={alumnos}
              estados={estados}
              observaciones={observaciones}
              onEstadoChange={handleEstadoChange}
              onObservacionChange={handleObservacionChange}
              disabled={cerrada}
            />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={mostrarCerrar}
        title="¿Cerrar la lista de esta clase?"
        message={<>Una vez cerrada no vas a poder editar la asistencia de esta clase. Guardá los cambios pendientes antes de cerrarla.</>}
        confirmLabel="Cerrar lista"
        danger
        busy={cerrando}
        onConfirm={confirmarCerrar}
        onCancel={() => setMostrarCerrar(false)}
      />
    </>
  );
};

export default TomarAsistencia;
