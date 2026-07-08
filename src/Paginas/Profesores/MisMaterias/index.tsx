import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Materia from '../../../Componentes/profesor/Materia';
import Sidebar from '../../../Componentes/Sidebar';
import Footer from '../../../Componentes/footer';
import HomeHero from '../../../Componentes/HomeHero';
import QuickLinks from '../../../Componentes/QuickLinks';
import type { QuickLinkItem } from '../../../Componentes/QuickLinks';
import NexiaPromo from '../../../Componentes/NexiaPromo';
import EmptyState from '../../../Componentes/EmptyState';
import type { typeCurso } from '../../../Types/profesores/types';
import api from '../../../api';
import { getNombreUsuario } from '../../../utils/session';
import './misCursos.css';
import { usePageTitle } from '../../../hooks/usePageTitle';

const QUICK_LINKS: QuickLinkItem[] = [
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
    to: '/calendario',
    title: 'Calendario',
    description: 'Fechas y eventos del ciclo lectivo',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    to: '/mensajes',
    title: 'Mensajes',
    description: 'Comunicación con tus alumnos',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

interface AlumnoRiesgo {
  alumno_id: number;
  alumno_nombre: string;
  alumno_apellido: string;
  materia_nombre: string;
  anio: number;
  division: string;
  promedio: number | null;
  tps_sin_entregar: number;
}

function motivoRiesgo(a: AlumnoRiesgo): string {
  const motivos: string[] = [];
  if (a.promedio != null) motivos.push(`Promedio ${a.promedio} en TPs`);
  if (a.tps_sin_entregar > 0) {
    motivos.push(`${a.tps_sin_entregar} ${a.tps_sin_entregar === 1 ? 'TP vencido sin entregar' : 'TPs vencidos sin entregar'}`);
  }
  return motivos.join(' · ');
}

const MisCursos: React.FC = () => {
  usePageTitle('Mis cursos');
  const navigate = useNavigate();
  const [listaMaterias, setListaMaterias] = useState<typeCurso[]>([]);
  const [enRiesgo, setEnRiesgo] = useState<AlumnoRiesgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName] = useState(getNombreUsuario);

  useEffect(() => {
    const traerDatos = async () => {
      const profesorId = localStorage.getItem('profesor_id');
      if (!profesorId) {
        setError('No se encontró el ID del profesor.');
        setLoading(false);
        return;
      }

      // Cursos (contenido principal) y alumnos en riesgo en paralelo;
      // si el segundo falla, el inicio no se rompe.
      const [materiasRes, riesgoRes] = await Promise.allSettled([
        api.get(`/api/profesores/${profesorId}/materias`),
        api.get(`/api/profesores/${profesorId}/alumnos-en-riesgo`),
      ]);

      if (materiasRes.status === 'fulfilled') {
        setListaMaterias(materiasRes.value.data.data || []);
      } else {
        setError('Error al conectar con el servidor.');
      }

      if (riesgoRes.status === 'fulfilled') {
        setEnRiesgo(riesgoRes.value.data.data || []);
      }

      setLoading(false);
    };
    traerDatos();
  }, []);

  const irAMensaje = (a: AlumnoRiesgo) => {
    const nombre = `${a.alumno_nombre} ${a.alumno_apellido}`.trim();
    navigate(`/mensajes?alumno=${a.alumno_id}&nombre=${encodeURIComponent(nombre)}`);
  };

  const cursosUnicos = useMemo(
    () => new Set(listaMaterias.map(m => `${m.anio}-${m.division}`)).size,
    [listaMaterias]
  );

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">

          <HomeHero
            userName={userName}
            tagline="Panel del docente"
            stats={
              loading
                ? undefined
                : [
                    { value: listaMaterias.length, label: listaMaterias.length === 1 ? 'Materia' : 'Materias' },
                    { value: cursosUnicos, label: cursosUnicos === 1 ? 'Curso' : 'Cursos' },
                    { value: enRiesgo.length, label: 'En riesgo' },
                  ]
            }
            notice={
              !loading && enRiesgo.length > 0 ? (
                <div className="hh-notice-inner">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  {enRiesgo.length === 1 ? 'Hay ' : 'Hay '}
                  <strong>{enRiesgo.length} {enRiesgo.length === 1 ? 'alumno que necesita' : 'alumnos que necesitan'} acompañamiento</strong>
                  <a href="#acompanar" className="hh-notice-link">
                    Ver alumnos
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

              {/* ── Columna principal: cursos ── */}
              <div className="home-main">
                {/* Alumnos a acompañar — datos reales de TPs y notas */}
                <section className="ar-panel" id="acompanar" aria-label="Alumnos a acompañar">
                  <div className="ar-head">
                    <span className="ql-title">Alumnos a acompañar</span>
                    {enRiesgo.length > 0 && <span className="ar-count">{enRiesgo.length}</span>}
                  </div>

                  {enRiesgo.length === 0 ? (
                    <div className="ar-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      <p>Ningún alumno en riesgo por ahora — todos al día.</p>
                    </div>
                  ) : (
                    <ul className="ar-list">
                      {enRiesgo.slice(0, 5).map((a) => (
                        <li className="ar-item" key={`${a.alumno_id}-${a.materia_nombre}`}>
                          <span className="ar-avatar" aria-hidden="true">
                            {a.alumno_nombre.charAt(0)}{a.alumno_apellido.charAt(0)}
                          </span>
                          <div className="ar-info">
                            <span className="ar-nombre">{a.alumno_nombre} {a.alumno_apellido}</span>
                            <span className="ar-materia">{a.materia_nombre} · {a.anio}° {a.division}</span>
                            <span className="ar-motivo">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                              </svg>
                              {motivoRiesgo(a)}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="ar-msg-btn"
                            onClick={() => irAMensaje(a)}
                            title={`Enviar mensaje a ${a.alumno_nombre}`}
                            aria-label={`Enviar mensaje a ${a.alumno_nombre} ${a.alumno_apellido}`}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <div className="section-head">
                  <div>
                    <h2 className="section-title">Mis cursos</h2>
                    <p className="section-sub">Gestioná contenidos, trabajos y notas de tus materias</p>
                  </div>
                  <span className="section-count">
                    {listaMaterias.length} {listaMaterias.length === 1 ? 'materia' : 'materias'}
                  </span>
                </div>

                {listaMaterias.length === 0 && !error ? (
                  <EmptyState
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    }
                    title="Sin cursos asignados"
                    description="No tenés materias asignadas para este ciclo lectivo. El gestor de tu institución puede asignártelas."
                  />
                ) : (
                  <div className="cursos-grid">
                    {listaMaterias.map((item) => (
                      <Link
                        key={item.profe_curso_materia_id}
                        to={`/contenidos/${item.profe_curso_materia_id}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Materia
                          materia={item.materia_nombre}
                          grado={item.division}
                          anio={item.anio}
                          descripcion={item.materia_descripcion}
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Rail lateral ── */}
              <aside className="home-rail">

                <QuickLinks items={QUICK_LINKS} />

                <NexiaPromo
                  title="Potenciá tus clases"
                  description="Nexia IA conoce el material que publicás y acompaña a tus alumnos con explicaciones guiadas, sin resolverles las consignas."
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

export default MisCursos;
