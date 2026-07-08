import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../Componentes/Sidebar';
import MateriaTabs from '../../../Componentes/profesor/MateriaTabs';
import MateriaIdentity from '../../../Componentes/MateriaIdentity';
import ListaTrabajosPracticos from '../../../Componentes/profesor/ListaTrabajosPracticos';
import type { typeTrabajoPractico } from '../../../Types/profesores/types';
import api from '../../../api';
import './trabajosPracticos.css';

const TrabajosPracticos: React.FC = () => {
  const { profeCursoMateriaId } = useParams<{ profeCursoMateriaId: string }>();
  const navigate = useNavigate();
  const [trabajos, setTrabajos] = useState<typeTrabajoPractico[]>([]);
  const [materia, setMateria] = useState<{ materia_nombre: string; anio: number; division: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publicandoId, setPublicandoId] = useState<number | null>(null);

  const publicar = async (tp: typeTrabajoPractico) => {
    setPublicandoId(tp.trabajo_practico_id);
    try {
      const res = await api.patch(`/api/trabajos-practicos/${tp.trabajo_practico_id}/estado`, { activo: true });
      const actualizado = res.data.data;
      setTrabajos(prev => prev.map(t =>
        t.trabajo_practico_id === tp.trabajo_practico_id
          ? { ...t, activo: actualizado?.activo ?? true, fecha_publicacion: actualizado?.fecha_publicacion ?? t.fecha_publicacion }
          : t
      ));
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setError(ex.response?.data?.message || 'No se pudo publicar el trabajo práctico.');
    } finally {
      setPublicandoId(null);
    }
  };

  const borradores = trabajos.filter(t => !t.activo).length;

  useEffect(() => {
    const traer = async () => {
      try {
        const res = await api.get(
          `/api/trabajos-practicos/profe-curso-materia/${profeCursoMateriaId}`
        );
        setMateria(res.data.data.materia || null);
        setTrabajos(res.data.data.trabajos_practicos || []);
      } catch (err) {
        console.error('Error al obtener los trabajos prácticos:', err);
        setError('No se pudieron cargar los trabajos prácticos.');
      } finally {
        setLoading(false);
      }
    };
    if (profeCursoMateriaId) traer();
  }, [profeCursoMateriaId]);

  return (
    <>
      <Sidebar />
      <div className="iv-page">
        <header className="iv-header">
          <button className="iv-back-btn" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </button>
          <div className="iv-header-center">
            {materia ? (
              <MateriaIdentity
                nombre={materia.materia_nombre}
                anio={materia.anio}
                division={materia.division}
                seccion="Trabajos prácticos"
              />
            ) : (
              <h1 className="iv-title">Trabajos prácticos</h1>
            )}
            {!loading && <span className="iv-count">{trabajos.length} trabajos</span>}
          </div>
          {profeCursoMateriaId && (
            <MateriaTabs profeCursoMateriaId={profeCursoMateriaId} active="trabajos-practicos" />
          )}
          <div className="iv-header-actions">
            <Link to={`/crear-trabajo-practico/${profeCursoMateriaId}`} className="iv-add-btn">
              + Crear
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="iv-loading">
            <div className="nexia-loading-spinner" />
            <span>Cargando...</span>
          </div>
        ) : error ? (
          <div className="iv-error">{error}</div>
        ) : trabajos.length === 0 ? (
          <div className="iv-empty tp-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="30" height="30">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <p>Todavía no creaste trabajos prácticos para esta materia</p>
            <Link to={`/crear-trabajo-practico/${profeCursoMateriaId}`} className="iv-empty-link">
              + Crear el primero →
            </Link>
          </div>
        ) : (
          <>
            {borradores > 0 && (
              <div className="tpp-aviso-borradores" role="status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                Tenés <strong>{borradores} {borradores === 1 ? 'trabajo en borrador' : 'trabajos en borrador'}</strong> —
                los alumnos no {borradores === 1 ? 'lo ven' : 'los ven'} hasta que {borradores === 1 ? 'lo publiques' : 'los publiques'}.
              </div>
            )}
            <ListaTrabajosPracticos
              trabajos={trabajos}
              onPublicar={publicar}
              publicandoId={publicandoId}
            />
          </>
        )}
      </div>
    </>
  );
};

export default TrabajosPracticos;
