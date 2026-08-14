import { useEffect, useMemo, useState } from 'react';
import Footer from '../../../Componentes/footer';
import EmptyState from '../../../Componentes/EmptyState';
import ConfirmDialog from '../../../Componentes/ConfirmDialog';
import CursoFormModal from '../../../Componentes/Gestor/CursoFormModal';
import type { Curso, EspecialidadOpcion } from '../../../Componentes/Gestor/CursoFormModal';
import api from '../../../api';
import { mensajeDeError } from '../../../utils/apiError';
import { usePageTitle } from '../../../hooks/usePageTitle';
import './cursosGestor.css';

/* ─────────────────────────────────────────────
   CURSOS — administración del gestor.

   El curso es la pieza sobre la que se apoya todo
   lo demás: sin curso no se puede dar de alta un
   alumno ni asignarle una materia a un docente.
   Hasta ahora se creaban a mano en la base, así
   que una institución nueva quedaba bloqueada.

   La pantalla responde dos preguntas y nada más:
   qué cursos existen, y cuáles puedo modificar.
   Por eso cada tarjeta muestra alumnos y materias:
   son exactamente los datos que deciden si el
   curso se puede borrar.
───────────────────────────────────────────── */

const IconCurso = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

function CursosGestor() {
  usePageTitle('Cursos');

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [especialidades, setEspecialidades] = useState<EspecialidadOpcion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // null = cerrado · 'nuevo' = alta · Curso = edición de ese curso
  const [enFormulario, setEnFormulario] = useState<Curso | 'nuevo' | null>(null);
  const [aEliminar, setAEliminar] = useState<Curso | null>(null);
  const [eliminando, setEliminando] = useState(false);

  /* Carga inicial. El alta, la edición y el borrado actualizan la lista en
     memoria, así que no hace falta volver a pedirla: una sola llamada al
     montar alcanza. */
  useEffect(() => {
    let vigente = true;

    const cargar = async () => {
      try {
        /* allSettled y no all: las especialidades son opcionales para esta
           pantalla, y si esa consulta fallara no tiene sentido dejar al
           gestor sin ver sus cursos. */
        const [cursosRes, espRes] = await Promise.allSettled([
          api.get('/api/cursos'),
          api.get('/api/especialidades'),
        ]);

        if (!vigente) return;

        if (cursosRes.status === 'rejected') throw cursosRes.reason;

        // anio llega como string desde pg cuando la columna es numeric.
        setCursos(
          (cursosRes.value.data.data || []).map((c: Curso) => ({
            ...c,
            anio: Number(c.anio),
          }))
        );

        if (espRes.status === 'fulfilled') {
          setEspecialidades(espRes.value.data.data || []);
        }
      } catch (err) {
        if (vigente) setError(mensajeDeError(err, 'No se pudieron cargar los cursos.'));
      } finally {
        if (vigente) setCargando(false);
      }
    };

    cargar();
    return () => { vigente = false; };
  }, []);

  /* Se reordena en el cliente con el mismo criterio que el backend (año y
     después división) para que un curso recién creado caiga en su lugar
     sin volver a pedir la lista entera. */
  const ordenados = useMemo(
    () =>
      [...cursos].sort(
        (a, b) => a.anio - b.anio || a.division.localeCompare(b.division, 'es')
      ),
    [cursos]
  );

  const totalAlumnos = useMemo(
    () => cursos.reduce((suma, c) => suma + (c.cantidad_alumnos || 0), 0),
    [cursos]
  );

  const guardar = (curso: Curso) => {
    setCursos((prev) => {
      const existe = prev.some((c) => c.curso_id === curso.curso_id);
      return existe
        ? prev.map((c) => (c.curso_id === curso.curso_id ? { ...c, ...curso } : c))
        : [...prev, curso];
    });
  };

  const confirmarEliminacion = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    setError('');
    try {
      await api.delete(`/api/cursos/${aEliminar.curso_id}`);
      setCursos((prev) => prev.filter((c) => c.curso_id !== aEliminar.curso_id));
      setAEliminar(null);
    } catch (err) {
      // El backend explica el motivo exacto (por ejemplo, "tiene 24 alumnos"),
      // así que se muestra su mensaje en vez de uno genérico.
      setError(mensajeDeError(err, 'No se pudo eliminar el curso.'));
      setAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <>
      <div className="main-wrapper">
        <main className="main-content">

          <div className="page-header">
            <div>
              <h1 className="page-title">Cursos</h1>
              <p className="page-subtitle">
                {cargando
                  ? 'Cargando la estructura académica…'
                  : cursos.length === 0
                    ? 'Creá el primer curso para empezar a cargar alumnos y materias'
                    : `${cursos.length} curso${cursos.length === 1 ? '' : 's'} · ${totalAlumnos} alumno${totalAlumnos === 1 ? '' : 's'} en total`}
              </p>
            </div>
            <button className="cg-nuevo" onClick={() => setEnFormulario('nuevo')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo curso
            </button>
          </div>

          {error && <div className="alert-error" role="alert">{error}</div>}

          {cargando ? (
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <p>Cargando cursos…</p>
            </div>
          ) : ordenados.length === 0 ? (
            <EmptyState
              icon={IconCurso}
              title="Todavía no hay cursos"
              description="El curso es el punto de partida: sin él no se pueden dar de alta alumnos ni asignarle materias a un docente."
              action={
                <button className="cg-nuevo" onClick={() => setEnFormulario('nuevo')}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Crear el primer curso
                </button>
              }
            />
          ) : (
            <ul className="cg-grid stagger-in">
              {ordenados.map((curso) => {
                const bloqueado = curso.cantidad_alumnos > 0 || curso.cantidad_materias > 0;
                const nombre = `${curso.anio}° ${curso.division}`;

                return (
                  <li key={curso.curso_id} className="cg-card">
                    <div className="cg-card-head">
                      <span className="cg-nombre">{nombre}</span>
                      {curso.especialidad_nombre && (
                        <span className="cg-especialidad">{curso.especialidad_nombre}</span>
                      )}
                    </div>

                    <dl className="cg-datos">
                      <div className="cg-dato">
                        <dt>Alumnos</dt>
                        <dd>{curso.cantidad_alumnos ?? 0}</dd>
                      </div>
                      <div className="cg-dato">
                        <dt>Materias</dt>
                        <dd>{curso.cantidad_materias ?? 0}</dd>
                      </div>
                    </dl>

                    <div className="cg-acciones">
                      <button
                        type="button"
                        className="cg-accion"
                        onClick={() => setEnFormulario(curso)}
                        aria-label={`Editar curso ${nombre}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Editar
                      </button>

                      {/* Se deshabilita en vez de ocultarse: si el botón
                          desapareciera, el gestor no entendería por qué este
                          curso no se puede borrar y aquel sí. */}
                      <button
                        type="button"
                        className="cg-accion cg-accion--danger"
                        onClick={() => setAEliminar(curso)}
                        disabled={bloqueado}
                        title={
                          bloqueado
                            ? 'Primero reubicá los alumnos y quitá las materias asignadas'
                            : undefined
                        }
                        aria-label={`Eliminar curso ${nombre}`}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

        </main>
        <Footer />
      </div>

      {enFormulario && (
        <CursoFormModal
          curso={enFormulario === 'nuevo' ? null : enFormulario}
          especialidades={especialidades}
          onClose={() => setEnFormulario(null)}
          onSaved={guardar}
        />
      )}

      <ConfirmDialog
        open={aEliminar !== null}
        danger
        busy={eliminando}
        title="Eliminar curso"
        message={
          <>
            ¿Seguro que querés eliminar{' '}
            <strong>{aEliminar ? `${aEliminar.anio}° ${aEliminar.division}` : ''}</strong>?
            Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmarEliminacion}
        onCancel={() => setAEliminar(null)}
      />
    </>
  );
}

export default CursosGestor;
