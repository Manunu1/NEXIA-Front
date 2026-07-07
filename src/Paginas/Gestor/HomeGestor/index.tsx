import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../Componentes/Sidebar";
import HomeHero from "../../../Componentes/HomeHero";
import api from '../../../api';
import { getNombreUsuario } from '../../../utils/session';
import "./homeGestor.css";
import { usePageTitle } from '../../../hooks/usePageTitle';

function HomeGestor() {
  usePageTitle('Panel de gestión');
  const navigate = useNavigate();
  const [alumnos, setAlumnos] = useState(0);
  const [profesores, setProfesores] = useState(0);
  const [cursos, setCursos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userName] = useState(() => getNombreUsuario(true));

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const institucionId = localStorage.getItem("institucion_id");
        if (!institucionId) return;

        const [alumnosRes, profesoresRes, cursosRes] = await Promise.all([
          api.get(`/api/alumnos?institucion_id=${institucionId}`),
          api.get(`/api/profesores?institucion_id=${institucionId}`),
          api.get(`/api/cursos?institucion_id=${institucionId}`),
        ]);

        setAlumnos(alumnosRes.data.data?.length || 0);
        setProfesores(profesoresRes.data.data?.length || 0);
        setCursos(cursosRes.data.data?.length || 0);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const maxVal = Math.max(alumnos, profesores, cursos, 1);
  const total = alumnos + profesores + cursos || 1;
  const aDeg = (alumnos / total) * 360;
  const pDeg = (profesores / total) * 360;

  const donutBg = loading
    ? 'var(--border)'
    : `conic-gradient(#1A237E 0deg ${aDeg}deg, #FF9800 ${aDeg}deg ${aDeg + pDeg}deg, #3949AB ${aDeg + pDeg}deg 360deg)`;

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">

          <HomeHero
            userName={userName || 'Gestor'}
            tagline="Panel administrativo"
            stats={
              loading
                ? undefined
                : [
                    { value: alumnos, label: 'Alumnos' },
                    { value: profesores, label: 'Profesores' },
                    { value: cursos, label: 'Cursos' },
                  ]
            }
          />

          {/* Page header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Panel de Gestión</h1>
              <p className="page-subtitle">Resumen de tu institución en tiempo real</p>
            </div>
          </div>

          {/* KPI cards */}
          <div className="g-kpi-grid">

            <div className="g-kpi-card">
              <div className="g-kpi-icon g-kpi-icon--navy">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="g-kpi-body">
                <span className="g-kpi-value">{loading ? '—' : alumnos}</span>
                <span className="g-kpi-label">Alumnos</span>
              </div>
              <button className="g-kpi-cta" onClick={() => navigate('/gestor/alumnos')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            <div className="g-kpi-card g-kpi-card--orange">
              <div className="g-kpi-icon g-kpi-icon--orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div className="g-kpi-body">
                <span className="g-kpi-value">{loading ? '—' : profesores}</span>
                <span className="g-kpi-label">Profesores</span>
              </div>
              <button className="g-kpi-cta" onClick={() => navigate('/gestor/profesores')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            <div className="g-kpi-card g-kpi-card--indigo">
              <div className="g-kpi-icon g-kpi-icon--indigo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div className="g-kpi-body">
                <span className="g-kpi-value">{loading ? '—' : cursos}</span>
                <span className="g-kpi-label">Cursos</span>
              </div>
              <button className="g-kpi-cta" onClick={() => navigate('/gestor/asignaciones')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

          </div>

          {/* Charts row */}
          <div className="g-charts-row">

            {/* Bar chart */}
            <div className="g-chart-card">
              <div className="g-chart-head">
                <span className="g-chart-title">Distribución general</span>
                <span className="g-chart-sub">Comparativa por categoría</span>
              </div>
              <div className="g-bar-chart">
                <div className="g-bar-item">
                  <div className="g-bar-track">
                    <div
                      className="g-bar-fill g-bar-fill--navy"
                      style={{ height: loading ? '4px' : `${(alumnos / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className="g-bar-value">{loading ? '—' : alumnos}</span>
                  <span className="g-bar-label">Alumnos</span>
                </div>
                <div className="g-bar-item">
                  <div className="g-bar-track">
                    <div
                      className="g-bar-fill g-bar-fill--orange"
                      style={{ height: loading ? '4px' : `${(profesores / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className="g-bar-value">{loading ? '—' : profesores}</span>
                  <span className="g-bar-label">Profesores</span>
                </div>
                <div className="g-bar-item">
                  <div className="g-bar-track">
                    <div
                      className="g-bar-fill g-bar-fill--indigo"
                      style={{ height: loading ? '4px' : `${(cursos / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className="g-bar-value">{loading ? '—' : cursos}</span>
                  <span className="g-bar-label">Cursos</span>
                </div>
              </div>
            </div>

            {/* Donut chart */}
            <div className="g-chart-card">
              <div className="g-chart-head">
                <span className="g-chart-title">Composición</span>
                <span className="g-chart-sub">Proporción de la institución</span>
              </div>
              <div className="g-donut-section">
                <div className="g-donut-wrap">
                  <div className="g-donut" style={{ background: donutBg }} />
                  <div className="g-donut-center">
                    <span className="g-donut-total">{loading ? '—' : alumnos + profesores + cursos}</span>
                    <span className="g-donut-total-label">total</span>
                  </div>
                </div>
                <div className="g-donut-legend">
                  <div className="g-legend-item">
                    <span className="g-legend-dot g-legend-dot--navy" />
                    <span className="g-legend-label">Alumnos</span>
                    <span className="g-legend-val">{loading ? '—' : alumnos}</span>
                  </div>
                  <div className="g-legend-item">
                    <span className="g-legend-dot g-legend-dot--orange" />
                    <span className="g-legend-label">Profesores</span>
                    <span className="g-legend-val">{loading ? '—' : profesores}</span>
                  </div>
                  <div className="g-legend-item">
                    <span className="g-legend-dot g-legend-dot--indigo" />
                    <span className="g-legend-label">Cursos</span>
                    <span className="g-legend-val">{loading ? '—' : cursos}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Quick actions */}
          <div className="g-actions-section">
            <h2 className="g-section-title">Acciones rápidas</h2>
            <div className="g-actions-grid">

              <button className="g-action-card" onClick={() => navigate('/gestor/alumnos')}>
                <div className="g-action-icon g-action-icon--navy">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <div className="g-action-body">
                  <span className="g-action-title">Nuevo alumno</span>
                  <span className="g-action-desc">Registrar un estudiante</span>
                </div>
                <span className="g-action-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </button>

              <button className="g-action-card" onClick={() => navigate('/gestor/profesores')}>
                <div className="g-action-icon g-action-icon--orange">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <div className="g-action-body">
                  <span className="g-action-title">Nuevo profesor</span>
                  <span className="g-action-desc">Registrar un docente</span>
                </div>
                <span className="g-action-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </button>

              <button className="g-action-card" onClick={() => navigate('/gestor/asignaciones')}>
                <div className="g-action-icon g-action-icon--indigo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </div>
                <div className="g-action-body">
                  <span className="g-action-title">Asignar materia</span>
                  <span className="g-action-desc">Vincular docente a curso</span>
                </div>
                <span className="g-action-arrow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </button>

            </div>
          </div>

        </main>
      </div>
    </>
  );
}

export default HomeGestor;
