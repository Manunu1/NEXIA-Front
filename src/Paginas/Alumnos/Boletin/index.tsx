import React, { useEffect, useMemo, useState } from 'react';
import Footer from '../../../Componentes/footer';
import CompaneroCoach from '../../../Componentes/Companero/Coach';
import EmptyState from '../../../Componentes/EmptyState';
import type { typeBimestre, typeBoletin } from '../../../Types/profesores/types';
import api from '../../../api';
import { mensajeDeError } from '../../../utils/apiError';
import { mensajesBoletin } from '../../../utils/buddy';
import {
  aNota,
  formatearNota,
  materiasFlojas,
  materiasFuertes,
  promediar,
  promedioGeneral,
  promediosPorBimestre,
} from '../../../utils/boletin';
import { usePageTitle } from '../../../hooks/usePageTitle';
import './boletin.css';

/* ─────────────────────────────────────────────
   MI BOLETÍN.

   El problema que tenía esta pantalla no era de
   estilo sino de datos: las columnas de bimestre se
   armaban a partir de las notas cargadas. Un alumno
   con notas sólo en el primer bimestre veía UNA
   columna, y otro con las cuatro veía cuatro. Cada
   boletín tenía una forma distinta y, sobre todo,
   era imposible ver qué faltaba: un bimestre sin
   cargar y un bimestre inexistente se veían igual.

   Ahora los bimestres salen de la institución
   (/api/bimestres) y siempre están las cuatro
   columnas; la celda vacía dice que esa nota
   todavía no está.
───────────────────────────────────────────── */

function formatFecha(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function notaTier(nota: number): 'alta' | 'media' | 'baja' {
  if (nota >= 7) return 'alta';
  if (nota >= 4) return 'media';
  return 'baja';
}

const NotaPill: React.FC<{ nota: unknown; grande?: boolean }> = ({ nota, grande }) => {
  const n = aNota(nota);
  if (n === null) return <span className="bol-sin-nota" aria-label="Sin nota cargada">—</span>;

  return (
    <span className={`bol-nota-pill bol-nota-pill--${notaTier(n)}${grande ? ' bol-nota-pill--grande' : ''}`}>
      {formatearNota(n)}
    </span>
  );
};

function getAlumnoId(): string | null {
  try {
    const session = localStorage.getItem('usuario');
    if (session) {
      const alumnoId = JSON.parse(session).alumno_id;
      if (alumnoId) return String(alumnoId);
    }
  } catch { /* sesión ilegible */ }
  return localStorage.getItem('alumno_id');
}

const Boletin: React.FC = () => {
  usePageTitle('Mi boletín');

  const [boletin, setBoletin] = useState<typeBoletin | null>(null);
  const [bimestresInst, setBimestresInst] = useState<typeBimestre[]>([]);
  const [anioActivo, setAnioActivo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;

    const traer = async () => {
      const alumnoId = getAlumnoId();
      if (!alumnoId) {
        if (vigente) { setError('No se encontró el ID del alumno.'); setLoading(false); }
        return;
      }

      /* allSettled: si fallara el listado de bimestres, el boletín se puede
         dibujar igual con los que aparezcan en las notas. Es peor mostrar
         un error que una tabla incompleta. */
      const [boletinRes, bimestresRes] = await Promise.allSettled([
        api.get(`/api/boletin/alumno/${alumnoId}`),
        api.get('/api/bimestres'),
      ]);

      if (!vigente) return;

      if (boletinRes.status === 'rejected') {
        setError(mensajeDeError(boletinRes.reason, 'No se pudo cargar el boletín.'));
      } else {
        setBoletin(boletinRes.value.data.data);
      }

      if (bimestresRes.status === 'fulfilled') {
        setBimestresInst(bimestresRes.value.data.data || []);
      }

      setLoading(false);
    };

    traer();
    return () => { vigente = false; };
  }, []);

  const notasFinales = useMemo(() => boletin?.notas_finales || [], [boletin]);

  /* Años con actividad: los de la institución más los que aparezcan en las
     notas del alumno (por si quedó una nota de un bimestre ya dado de baja). */
  const anios = useMemo(() => {
    const set = new Set<number>();
    bimestresInst.forEach((b) => set.add(b.anio));
    notasFinales.forEach((n) => { if (n.anio) set.add(n.anio); });
    return Array.from(set).sort((a, b) => b - a);
  }, [bimestresInst, notasFinales]);

  const anio = anioActivo ?? anios[0] ?? null;

  const { materias, bimestres, notaPorCelda, general, notasDelAnio } = useMemo(() => {
    const delAnio = anio === null
      ? notasFinales
      : notasFinales.filter((n) => (n.anio ?? anio) === anio);

    /* Las columnas salen de los bimestres de la institución. Antes salían de
       las notas cargadas, que es la causa del bug: sin nota, no había columna.

       Los ids se comparan como texto a propósito: las claves son BIGINT y el
       driver pg las entrega como string ("4"), aunque el tipo declare number.
       Mezclar 4 con "4" en un Map da fallos silenciosos — la columna existe
       pero ninguna nota la encuentra. */
    const clave = (id: unknown) => String(id);

    const mapa = new Map<string, { bimestre_id: string; nombre: string; orden: number }>();

    bimestresInst
      .filter((b) => anio === null || b.anio === anio)
      .forEach((b) => {
        mapa.set(clave(b.id), { bimestre_id: clave(b.id), nombre: b.nombre, orden: b.orden });
      });

    // Red de seguridad: un bimestre con notas que ya no esté en la lista
    // institucional igual tiene que verse.
    delAnio.forEach((n) => {
      if (!mapa.has(clave(n.bimestre_id))) {
        mapa.set(clave(n.bimestre_id), {
          bimestre_id: clave(n.bimestre_id),
          nombre: n.bimestre_nombre,
          orden: n.orden,
        });
      }
    });

    const materiasSet = new Set<string>((boletin?.materias || []).map((m) => m.materia_nombre));
    const celda = new Map<string, number | null>();

    delAnio.forEach((n) => {
      materiasSet.add(n.materia_nombre);
      celda.set(`${n.materia_nombre}__${clave(n.bimestre_id)}`, aNota(n.nota));
    });

    return {
      materias: Array.from(materiasSet).sort((a, b) => a.localeCompare(b, 'es')),
      bimestres: Array.from(mapa.values()).sort((a, b) => a.orden - b.orden),
      notaPorCelda: celda,
      general: promedioGeneral(delAnio),
      notasDelAnio: delAnio,
    };
  }, [boletin, notasFinales, bimestresInst, anio]);

  /* Cuántas materias están en riesgo. Es el dato que convierte la tabla en
     algo accionable: sin él, el alumno tiene que comparar 12 promedios a ojo. */
  const { enRiesgo, conNota } = useMemo(() => {
    const promedios = materias
      .map((m) => promediar(bimestres.map((b) => notaPorCelda.get(`${m}__${b.bimestre_id}`))))
      .filter((p): p is number => p !== null);

    return {
      enRiesgo: promedios.filter((p) => p < 6).length,
      conNota: promedios.length,
    };
  }, [materias, bimestres, notaPorCelda]);

  const notasTP = boletin?.notas_trabajos_practicos || [];

  const mensajesCoach = useMemo(
    () =>
      mensajesBoletin({
        promedios: promediosPorBimestre(notasDelAnio),
        flojas: materiasFlojas(notasDelAnio),
        fuertes: materiasFuertes(notasDelAnio),
        hayNotas: notasDelAnio.some((n) => aNota(n.nota) !== null),
      }),
    [notasDelAnio]
  );

  return (
    <>
      <div className="main-wrapper">
        <main className="main-content">

          <div className="page-header">
            <div>
              <h1 className="page-title">Mi boletín</h1>
              <p className="page-subtitle">
                Notas finales por materia y detalle de trabajos prácticos corregidos
              </p>
            </div>

            {/* El selector aparece sólo si hay más de un ciclo lectivo: en el
                caso normal sería un control con una sola opción. */}
            {anios.length > 1 && (
              <div className="bol-anios" role="group" aria-label="Ciclo lectivo">
                {anios.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`bol-anio${a === anio ? ' bol-anio--activo' : ''}`}
                    onClick={() => setAnioActivo(a)}
                    aria-pressed={a === anio}
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <div className="alert-error" role="alert">{error}</div>}

          {loading ? (
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <p>Cargando boletín…</p>
            </div>
          ) : (
            <>
              {/* ── Resumen ── */}
              {general !== null && (
                <section className="bol-resumen" aria-label="Resumen del boletín">
                  <div className="bol-resumen-general">
                    <span className="bol-resumen-rotulo">Promedio general</span>
                    <NotaPill nota={general} grande />
                    <span className="bol-resumen-detalle">
                      sobre {conNota} {conNota === 1 ? 'materia' : 'materias'} con nota
                    </span>
                  </div>

                  <div className="bol-resumen-datos">
                    <div className="bol-resumen-dato">
                      <span className="bol-resumen-valor">{materias.length}</span>
                      <span className="bol-resumen-label">Materias</span>
                    </div>
                    <div className={`bol-resumen-dato${enRiesgo > 0 ? ' bol-resumen-dato--riesgo' : ''}`}>
                      <span className="bol-resumen-valor">{enRiesgo}</span>
                      <span className="bol-resumen-label">
                        {enRiesgo === 1 ? 'En riesgo' : 'En riesgo'}
                      </span>
                    </div>
                    <div className="bol-resumen-dato">
                      <span className="bol-resumen-valor">{conNota - enRiesgo}</span>
                      <span className="bol-resumen-label">Al día</span>
                    </div>
                  </div>
                </section>
              )}

              <div className="bol-coach">
                <CompaneroCoach mensajes={mensajesCoach} rotulo="Cómo leer esto" />
              </div>

              {/* ── Notas finales ── */}
              <section className="bol-section">
                <h2 className="bol-section-title">Notas finales</h2>

                {materias.length === 0 ? (
                  <EmptyState
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                      </svg>
                    }
                    title="Sin materias asignadas"
                    description="No te encontrás inscrito en ninguna materia para este ciclo lectivo."
                  />
                ) : (
                  <>
                    <div className="bol-table-wrap">
                      <table className="bol-table">
                        <caption className="bol-sr">
                          Notas finales por materia y bimestre del ciclo lectivo {anio ?? ''}
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col" className="bol-th-materia">Materia</th>
                            {bimestres.map((b) => (
                              <th scope="col" key={b.bimestre_id}>{b.nombre}</th>
                            ))}
                            <th scope="col" className="bol-th-promedio">Promedio</th>
                          </tr>
                        </thead>

                        <tbody>
                          {materias.map((materia) => {
                            const promedio = promediar(
                              bimestres.map((b) => notaPorCelda.get(`${materia}__${b.bimestre_id}`))
                            );
                            return (
                              <tr key={materia}>
                                <th scope="row" className="bol-td-materia">{materia}</th>
                                {bimestres.map((b) => (
                                  <td key={b.bimestre_id} className="bol-td-nota">
                                    <NotaPill nota={notaPorCelda.get(`${materia}__${b.bimestre_id}`)} />
                                  </td>
                                ))}
                                <td className="bol-td-nota bol-td-promedio">
                                  <NotaPill nota={promedio} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>

                        {general !== null && (
                          <tfoot>
                            <tr className="bol-tr-general">
                              <th scope="row" className="bol-td-materia">Promedio general</th>
                              {bimestres.map((b) => (
                                <td key={b.bimestre_id} className="bol-td-nota">
                                  <NotaPill
                                    nota={promediar(
                                      materias.map((m) => notaPorCelda.get(`${m}__${b.bimestre_id}`))
                                    )}
                                  />
                                </td>
                              ))}
                              <td className="bol-td-nota bol-td-promedio">
                                <NotaPill nota={general} />
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>

                    <p className="bol-leyenda">
                      El guion indica que esa nota todavía no fue cargada por el docente.
                    </p>
                  </>
                )}
              </section>

              {/* ── Trabajos prácticos ── */}
              <section className="bol-section">
                <h2 className="bol-section-title">Trabajos prácticos corregidos</h2>

                {notasTP.length === 0 ? (
                  <EmptyState
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    }
                    title="Sin trabajos corregidos"
                    description="Todavía no tenés trabajos prácticos corregidos."
                  />
                ) : (
                  /* Lista de tarjetas y no tabla: no son datos que se comparen
                     entre sí columna a columna, y el comentario del docente
                     necesita ancho para leerse. Como tabla, en el teléfono
                     quedaba una columna de dos palabras por línea. */
                  <ul className="bol-tps">
                    {notasTP.map((tp, i) => (
                      <li key={i} className="bol-tp">
                        <div className="bol-tp-nota">
                          <NotaPill nota={tp.nota} />
                        </div>

                        <div className="bol-tp-cuerpo">
                          <div className="bol-tp-top">
                            <h3 className="bol-tp-titulo">{tp.titulo}</h3>
                            <span className="bol-tp-materia">{tp.materia_nombre}</span>
                          </div>

                          {tp.comentario_correccion && (
                            <p className="bol-tp-comentario">{tp.comentario_correccion}</p>
                          )}

                          {tp.fecha_correccion && (
                            <span className="bol-tp-fecha">
                              Corregido el {formatFecha(tp.fecha_correccion)}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Boletin;
