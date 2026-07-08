import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../../Componentes/Sidebar';
import Footer from '../../../Componentes/footer';
import type { typeBoletin } from '../../../Types/profesores/types';
import api from '../../../api';
import './boletin.css';
import EmptyState from '../../../Componentes/EmptyState';

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

const NotaPill: React.FC<{ nota: number }> = ({ nota }) => (
  <span className={`bol-nota-pill bol-nota-pill--${notaTier(nota)}`}>{nota}</span>
);

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
  const [boletin, setBoletin] = useState<typeBoletin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const traer = async () => {
      try {
        const alumnoId = getAlumnoId();
        if (!alumnoId) { setError('No se encontró el ID del alumno.'); return; }
        const res = await api.get(`/api/boletin/alumno/${alumnoId}`);
        setBoletin(res.data.data);
      } catch (err) {
        console.error('Error al obtener el boletín:', err);
        setError('No se pudo cargar el boletín.');
      } finally {
        setLoading(false);
      }
    };
    traer();
  }, []);

  const { materias, bimestres, notaPorCelda } = useMemo(() => {
    const notasFinales = boletin?.notas_finales || [];
    const materiasSet = new Set<string>((boletin?.materias || []).map((m) => m.materia_nombre));
    const bimestresMap = new Map<number, { bimestre_id: number; nombre: string; orden: number }>();
    const celda = new Map<string, number | null>();

    notasFinales.forEach((n) => {
      materiasSet.add(n.materia_nombre);
      if (!bimestresMap.has(n.bimestre_id)) {
        bimestresMap.set(n.bimestre_id, { bimestre_id: n.bimestre_id, nombre: n.bimestre_nombre, orden: n.orden });
      }
      celda.set(`${n.materia_nombre}__${n.bimestre_id}`, n.nota);
    });

    return {
      materias: Array.from(materiasSet).sort((a, b) => a.localeCompare(b)),
      bimestres: Array.from(bimestresMap.values()).sort((a, b) => a.orden - b.orden),
      notaPorCelda: celda,
    };
  }, [boletin]);

  const notasTP = boletin?.notas_trabajos_practicos || [];

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Mi boletín</h1>
              <p className="page-subtitle">Notas finales por materia y detalle de trabajos prácticos corregidos</p>
            </div>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {loading ? (
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <p>Cargando boletín...</p>
            </div>
          ) : (
            <>
              <section className="bol-section">
                <h2 className="bol-section-title">Notas finales</h2>
                {materias.length === 0 ? (
                  <EmptyState
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>}
              title="Sin materias asignadas"
              description="No te encontrás inscrito en ninguna materia para este ciclo lectivo."
            />
                ) : (
                  <div className="bol-table-wrap">
                    <table className="bol-table">
                      <thead>
                        <tr>
                          <th className="bol-th-materia">Materia</th>
                          {bimestres.map((b) => (
                            <th key={b.bimestre_id}>{b.nombre}</th>
                          ))}
                          <th>Promedio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {materias.map((materia) => {
                          const notasMateria = bimestres
                            .map((b) => notaPorCelda.get(`${materia}__${b.bimestre_id}`))
                            .filter((n): n is number => n != null);
                          const promedio = notasMateria.length
                            ? Math.round((notasMateria.reduce((a, b) => a + b, 0) / notasMateria.length) * 100) / 100
                            : null;
                          return (
                            <tr key={materia}>
                              <td className="bol-td-materia">{materia}</td>
                              {bimestres.map((b) => {
                                const nota = notaPorCelda.get(`${materia}__${b.bimestre_id}`);
                                return (
                                  <td key={b.bimestre_id} className="bol-td-nota">
                                    {nota != null ? <NotaPill nota={nota} /> : <span className="bol-sin-nota">—</span>}
                                  </td>
                                );
                              })}
                              <td className="bol-td-nota bol-td-promedio">
                                {promedio != null ? <NotaPill nota={promedio} /> : <span className="bol-sin-nota">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="bol-section">
                <h2 className="bol-section-title">Trabajos prácticos corregidos</h2>
                {notasTP.length === 0 ? (
                  <EmptyState
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>}
              title="Sin trabajos corregidos"
              description="Todavía no tenés trabajos prácticos corregidos."
            />
                ) : (
                  <div className="bol-table-wrap">
                    <table className="bol-table">
                      <thead>
                        <tr>
                          <th>Materia</th>
                          <th>Trabajo práctico</th>
                          <th>Nota</th>
                          <th>Fecha</th>
                          <th>Comentario</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notasTP.map((tp, i) => (
                          <tr key={i}>
                            <td>{tp.materia_nombre}</td>
                            <td className="bol-td-materia">{tp.titulo}</td>
                            <td className="bol-td-nota">{tp.nota != null && <NotaPill nota={tp.nota} />}</td>
                            <td>{formatFecha(tp.fecha_correccion)}</td>
                            <td className="bol-td-comentario">{tp.comentario_correccion || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
