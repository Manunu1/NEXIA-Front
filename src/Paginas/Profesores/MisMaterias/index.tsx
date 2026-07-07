import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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

const MisCursos: React.FC = () => {
  usePageTitle('Mis cursos');
  const [listaMaterias, setListaMaterias] = useState<typeCurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName] = useState(getNombreUsuario);

  useEffect(() => {
    const traerMaterias = async () => {
      try {
        const profesorId = localStorage.getItem('profesor_id');
        if (!profesorId) {
          setError('No se encontró el ID del profesor.');
          return;
        }
        const res = await api.get(`/api/profesores/${profesorId}/materias`);
        setListaMaterias(res.data.data || []);
      } catch (err) {
        console.error('Error al obtener los cursos:', err);
        setError('Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    traerMaterias();
  }, []);

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
                  ]
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
