import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import type { typeBoletin } from '../../../Types/profesores/types';
import api from '../../../api';
import './boletin.css';

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
  } catch {}
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
        const res = await api.get(`http://localhost:3000/api/boletin/alumno/${alumnoId}`);
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
    const materiasSet = new Set<string>();
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
                  <div className="no-materias-fallback">
                    <div className="fallback-icon">📋</div>
                    <h3>Sin notas cargadas</h3>
                    <p>Todavía no hay notas finales cargadas para ningún bimestre.</p>
                  </div>
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
                  <div className="no-materias-fallback">
                    <div className="fallback-icon">🗂️</div>
                    <h3>Sin trabajos corregidos</h3>
                    <p>Todavía no tenés trabajos prácticos corregidos.</p>
                  </div>
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
