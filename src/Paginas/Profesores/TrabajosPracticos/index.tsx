import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import MateriaTabs from '../../../Componentes/profesor/MateriaTabs';
import ListaTrabajosPracticos from '../../../Componentes/profesor/ListaTrabajosPracticos';
import type { typeTrabajoPractico } from '../../../Types/profesores/types';
import api from '../../../api';
import './trabajosPracticos.css';

const TrabajosPracticos: React.FC = () => {
  const { profeCursoMateriaId } = useParams<{ profeCursoMateriaId: string }>();
  const navigate = useNavigate();
  const [trabajos, setTrabajos] = useState<typeTrabajoPractico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const traer = async () => {
      try {
        const res = await api.get(
          `http://localhost:3000/api/trabajos-practicos/profe-curso-materia/${profeCursoMateriaId}`
        );
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
            <h1 className="iv-title">Trabajos prácticos</h1>
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
            <span>🗂️</span>
            <p>Todavía no creaste trabajos prácticos para esta materia</p>
            <Link to={`/crear-trabajo-practico/${profeCursoMateriaId}`} className="iv-empty-link">
              + Crear el primero →
            </Link>
          </div>
        ) : (
          <ListaTrabajosPracticos trabajos={trabajos} />
        )}
      </div>
    </>
  );
};

export default TrabajosPracticos;
