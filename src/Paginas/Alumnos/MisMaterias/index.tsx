import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CardMateria from '../../../Componentes/alumnos/CardMaterias';
import Sidebar from '../../../Componentes/Sidebar';
import Footer from '../../../Componentes/footer';
import HomeHero from '../../../Componentes/HomeHero';
import QuickLinks from '../../../Componentes/QuickLinks';
import type { QuickLinkItem } from '../../../Componentes/QuickLinks';
import NexiaPromo from '../../../Componentes/NexiaPromo';
import EmptyState from '../../../Componentes/EmptyState';
import type { typeTrabajoPracticoAlumno, typeBoletinNotaFinal } from '../../../Types/profesores/types';
import api from '../../../api';
import { getNombreUsuario, getUsuarioSesion } from '../../../utils/session';
import { materiaTheme } from '../../../utils/materiaTheme';
import './misMaterias.css';
import { usePageTitle } from '../../../hooks/usePageTitle';

interface MateriaBackend {
  materia_id: string;
  materia_nombre: string;
  curso_id: string;
  anio: number;
  division: string;
  profesor_nombre: string;
  profesor_apellido: string;
  profe_curso_materia_id?: string;
  avatar_url?: string;
}

const QUICK_LINKS: QuickLinkItem[] = [
  {
    to: '/boletin',
    title: 'Mi boletín',
    description: 'Notas y seguimiento académico',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    to: '/comunicados',
    title: 'Comunicados',
    description: 'Novedades de tu institución',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    to: '/apuntes',
    title: 'Mis apuntes',
    description: 'Tus notas personales de estudio',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
];

interface PromedioBimestre {
  orden: number;
  nombre: string;
  promedio: number;
}

interface MateriaFloja {
  materia: string;
  promedio: number;
}

/** Promedio general por bimestre a partir de las notas finales del boletín */
function promediosPorBimestre(notas: typeBoletinNotaFinal[]): PromedioBimestre[] {
  const porBimestre = new Map<number, { nombre: string; notas: number[] }>();
  for (const n of notas) {
    if (n.nota == null) continue;
    const entry = porBimestre.get(n.orden) ?? { nombre: n.bimestre_nombre, notas: [] };
    entry.notas.push(Number(n.nota));
    porBimestre.set(n.orden, entry);
  }
  return Array.from(porBimestre.entries())
    .map(([orden, { nombre, notas: ns }]) => ({
      orden,
      nombre,
      promedio: Math.round((ns.reduce((a, b) => a + b, 0) / ns.length) * 10) / 10,
    }))
    .sort((a, b) => a.orden - b.orden);
}

/** Materias con promedio de notas finales por debajo de 6 */
function materiasEnRojo(notas: typeBoletinNotaFinal[]): MateriaFloja[] {
  const porMateria = new Map<string, number[]>();
  for (const n of notas) {
    if (n.nota == null) continue;
    const arr = porMateria.get(n.materia_nombre) ?? [];
    arr.push(Number(n.nota));
    porMateria.set(n.materia_nombre, arr);
  }
  return Array.from(porMateria.entries())
    .map(([materia, ns]) => ({
      materia,
      promedio: Math.round((ns.reduce((a, b) => a + b, 0) / ns.length) * 10) / 10,
    }))
    .filter((m) => m.promedio < 6)
    .sort((a, b) => a.promedio - b.promedio);
}

/** Etiqueta de vencimiento legible ("Vence hoy", "Vence en 3 días", …) */
function vencimiento(fechaLimite: string | null | undefined): { label: string; urgente: boolean } {
  if (!fechaLimite) return { label: 'Sin fecha límite', urgente: false };
  const limite = new Date(fechaLimite);
  if (isNaN(limite.getTime())) return { label: 'Sin fecha límite', urgente: false };

  const hoy = new Date();
  const dias = Math.ceil((limite.getTime() - hoy.getTime()) / 86_400_000);

  if (dias < 0) return { label: 'Vencido', urgente: true };
  if (dias === 0) return { label: 'Vence hoy', urgente: true };
  if (dias === 1) return { label: 'Vence mañana', urgente: true };
  if (dias <= 7) return { label: `Vence en ${dias} días`, urgente: false };
  return {
    label: `Vence el ${limite.getDate()}/${limite.getMonth() + 1}`,
    urgente: false,
  };
}

const MisMaterias: React.FC = () => {
  usePageTitle('Mis materias');
  const [materias, setMaterias] = useState<MateriaBackend[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName] = useState(getNombreUsuario);
  const [pendientes, setPendientes] = useState<typeTrabajoPracticoAlumno[]>([]);
  const [corregidos, setCorregidos] = useState(0);
  const [tpTotales, setTpTotales] = useState(0);
  const [promedios, setPromedios] = useState<PromedioBimestre[]>([]);
  const [flojas, setFlojas] = useState<MateriaFloja[]>([]);

  useEffect(() => {
    const traerDatos = async () => {
      const usuario = getUsuarioSesion();
      if (!usuario) { setError('No se detectó una sesión activa.'); return; }
      const alumnoId = usuario.alumno_id;
      if (!alumnoId) { setError('El perfil no corresponde a un alumno válido.'); return; }

      // Materias, trabajos prácticos y boletín en paralelo; si alguno
      // secundario falla, el inicio no se rompe.
      const [materiasRes, tpsRes, boletinRes] = await Promise.allSettled([
        api.get(`/api/alumnos/${alumnoId}/materias`),
        api.get(`/api/trabajos-practicos/alumno/${alumnoId}`),
        api.get(`/api/boletin/alumno/${alumnoId}`),
      ]);

      if (materiasRes.status === 'fulfilled') {
        setMaterias(materiasRes.value.data.data || []);
      } else {
        setError('Error al conectar con el servidor.');
      }

      if (tpsRes.status === 'fulfilled') {
        const tps: typeTrabajoPracticoAlumno[] = tpsRes.value.data.data || [];
        const activos = tps.filter((tp) => tp.activo !== false);
        const sinEntregar = activos
          .filter((tp) => !tp.entrega_id)
          .sort((a, b) => {
            if (!a.fecha_limite) return 1;
            if (!b.fecha_limite) return -1;
            return new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime();
          });
        setPendientes(sinEntregar);
        setTpTotales(activos.length);
        setCorregidos(tps.filter((tp) => tp.estado === 'corregido').length);
      }

      if (boletinRes.status === 'fulfilled') {
        const notasFinales: typeBoletinNotaFinal[] = boletinRes.value.data.data?.notas_finales || [];
        setPromedios(promediosPorBimestre(notasFinales));
        setFlojas(materiasEnRojo(notasFinales));
      }

      setLoading(false);
    };
    traerDatos();
  }, []);

  const entregados = tpTotales - pendientes.length;

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">

          <HomeHero
            userName={userName}
            tagline="Campus del alumno"
            stats={
              loading
                ? undefined
                : [
                    { value: materias.length, label: materias.length === 1 ? 'Materia' : 'Materias' },
                    { value: pendientes.length, label: 'Por entregar' },
                    { value: corregidos, label: 'Corregidos' },
                  ]
            }
            notice={
              !loading && pendientes.length > 0 ? (
                <div className="hh-notice-inner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Te {pendientes.length === 1 ? 'falta entregar' : 'faltan entregar'}{' '}
                  <strong>{pendientes.length} {pendientes.length === 1 ? 'trabajo práctico' : 'trabajos prácticos'}</strong>
                  <a href="#proximas-entregas" className="hh-notice-link">
                    Ver entregas
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                    </svg>
                  </a>
                </div>
              ) : undefined
            }
          />

          {error && <div className="alert-error">{error}</div>}

          {loading ? (
            <div className="materias-grid" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="sk sk-materia" />
              ))}
            </div>
          ) : (
            <div className="home-layout">

              {/* ── Columna principal: materias ── */}
              <div className="home-main">
                <div className="home-row">
                {/* Próximas entregas — datos reales del alumno */}
                <section className="pe-panel" id="proximas-entregas" aria-label="Próximas entregas">
                  <div className="pe-head">
                    <span className="ql-title">Próximas entregas</span>
                    {pendientes.length > 0 && (
                      <span className="pe-count">{pendientes.length}</span>
                    )}
                  </div>

                  {pendientes.length === 0 ? (
                    <div className="pe-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <p>Estás al día — no tenés entregas pendientes.</p>
                    </div>
                  ) : (
                    <ul className="pe-list">
                      {pendientes.slice(0, 4).map((tp) => {
                        const { label, urgente } = vencimiento(tp.fecha_limite);
                        return (
                          <li key={tp.trabajo_practico_id}>
                            <Link to={`/trabajo-practico/${tp.trabajo_practico_id}`} className="pe-item">
                              <span className="pe-item-top">
                                {tp.materia_nombre && (
                                  <span
                                    className="pe-materia"
                                    style={{ color: materiaTheme(tp.materia_nombre).accent }}
                                  >
                                    {tp.materia_nombre}
                                  </span>
                                )}
                                <span className={`pe-fecha${urgente ? ' pe-fecha--urgente' : ''}`}>{label}</span>
                              </span>
                              <span className="pe-titulo">{tp.titulo}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>

                {/* Mi rendimiento — promedios reales del boletín */}
                <section className="rp-panel" aria-label="Mi rendimiento">
                  <span className="ql-title">Mi rendimiento</span>

                  {promedios.length > 0 ? (
                    <div
                      className="rp-chart"
                      role="img"
                      aria-label={`Promedio general por bimestre: ${promedios.map(p => `${p.nombre}: ${p.promedio}`).join(', ')}`}
                    >
                      {promedios.map((p) => (
                        <div
                          className="rp-col"
                          key={p.orden}
                          title={`${p.nombre}: promedio ${p.promedio}`}
                        >
                          <span className="rp-valor">{p.promedio}</span>
                          <div className="rp-track">
                            <div
                              className="rp-fill"
                              style={{ height: `${Math.max((p.promedio / 10) * 100, 6)}%` }}
                            />
                          </div>
                          <span className="rp-etiqueta">B{p.orden}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rp-sin-datos">Cuando tus docentes carguen notas, acá vas a ver tu promedio por bimestre.</p>
                  )}

                  {tpTotales > 0 && (
                    <div className="rp-entregas">
                      <div className="rp-entregas-head">
                        <span>Entregas al día</span>
                        <strong>{entregados} de {tpTotales}</strong>
                      </div>
                      <div
                        className="rp-progress"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={tpTotales}
                        aria-valuenow={entregados}
                        aria-label={`${entregados} de ${tpTotales} trabajos entregados`}
                      >
                        <div
                          className="rp-progress-fill"
                          style={{ width: `${tpTotales ? (entregados / tpTotales) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {flojas.slice(0, 3).map((m) => (
                    <div className="rp-alerta" key={m.materia} role="status">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <span>
                        Reforzá <strong>{m.materia}</strong> — promedio {m.promedio}
                      </span>
                    </div>
                  ))}
                </section>
                </div>

                <div className="section-head">
                  <div>
                    <h2 className="section-title">Mis materias</h2>
                    <p className="section-sub">Accedé a los contenidos y trabajos de cada materia</p>
                  </div>
                  <span className="section-count">
                    {materias.length} {materias.length === 1 ? 'materia' : 'materias'}
                  </span>
                </div>

                {materias.length === 0 && !error ? (
                  <EmptyState
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    }
                    title="Sin materias asignadas"
                    description="No te encontrás inscripto en ninguna materia para este ciclo lectivo."
                  />
                ) : (
                  <div className="materias-grid">
                    {materias.map((item) => {
                      const destino = item.profe_curso_materia_id || item.materia_id;
                      const profe = [item.profesor_nombre, item.profesor_apellido]
                        .filter(x => x && x !== 'undefined')
                        .join(' ');
                      return (
                        <Link key={item.materia_id} to={`/materia/${destino}`} style={{ textDecoration: 'none' }}>
                          <CardMateria
                            titulo={item.materia_nombre}
                            curso={`${item.anio}° "${item.division}"`}
                            profesor={profe}
                            avatarUrl={item.avatar_url || ''}
                          />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Rail lateral ── */}
              <aside className="home-rail">

                <QuickLinks items={QUICK_LINKS} />

                <NexiaPromo
                  title="¿Trabado con una consigna?"
                  description="Nexia IA te guía paso a paso con el material de tus materias, sin darte la respuesta servida."
                />
              </aside>

            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default MisMaterias;
