import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MateriaTabs from '../../../Componentes/profesor/MateriaTabs';
import MateriaIdentity from '../../../Componentes/MateriaIdentity';
import ListaClases from '../../../Componentes/profesor/ListaClases';
import type { typeClaseHistorial, typeClaseCreada } from '../../../Types/profesores/types';
import api from '../../../api';
import './asistencia.css';

type MateriaInfo = { materia_nombre: string; anio: number; division: string };

const Asistencia: React.FC = () => {
  const { profeCursoMateriaId } = useParams<{ profeCursoMateriaId: string }>();
  const navigate = useNavigate();
  const [materia, setMateria] = useState<MateriaInfo | null>(null);
  const [clases, setClases] = useState<typeClaseHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abriendo, setAbriendo] = useState(false);
  const [errorAbrir, setErrorAbrir] = useState<string | null>(null);

  useEffect(() => {
    const traer = async () => {
      try {
        const res = await api.get(`/api/clases/profe-curso-materia/${profeCursoMateriaId}`);
        setMateria(res.data.data.materia || null);
        setClases(res.data.data.clases || []);
      } catch (err) {
        console.error('Error al obtener las clases:', err);
        setError('No se pudieron cargar las clases.');
      } finally {
        setLoading(false);
      }
    };
    if (profeCursoMateriaId) traer();
  }, [profeCursoMateriaId]);

  const tomarAsistenciaHoy = async () => {
    setAbriendo(true);
    setErrorAbrir(null);
    try {
      const res = await api.post('/api/clases', { profe_curso_materia_id: Number(profeCursoMateriaId) });
      const clase: typeClaseCreada = res.data.data;
      navigate(`/clase/${clase.id}`);
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setErrorAbrir(ex.response?.data?.message || 'No se pudo abrir la clase de hoy.');
    } finally {
      setAbriendo(false);
    }
  };

  return (
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
              seccion="Asistencia"
            />
          ) : (
            <h1 className="iv-title">Asistencia</h1>
          )}
          {!loading && <span className="iv-count">{clases.length} clases</span>}
        </div>
        {profeCursoMateriaId && (
          <MateriaTabs profeCursoMateriaId={profeCursoMateriaId} active="asistencia" />
        )}
        <div className="iv-header-actions">
          <button className="iv-add-btn" onClick={tomarAsistenciaHoy} disabled={abriendo}>
            {abriendo ? 'Abriendo...' : '+ Tomar asistencia de hoy'}
          </button>
        </div>
      </header>

      {errorAbrir && <div className="iv-error as-error-abrir">{errorAbrir}</div>}

      {loading ? (
        <div className="iv-loading">
          <div className="nexia-loading-spinner" />
          <span>Cargando...</span>
        </div>
      ) : error ? (
        <div className="iv-error">{error}</div>
      ) : clases.length === 0 ? (
        <div className="iv-empty as-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" width="30" height="30">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p>Todavía no tomaste asistencia en esta materia</p>
          <button type="button" className="iv-empty-link as-empty-btn" onClick={tomarAsistenciaHoy} disabled={abriendo}>
            {abriendo ? 'Abriendo...' : '+ Tomar la primera →'}
          </button>
        </div>
      ) : (
        <ListaClases clases={clases} />
      )}
    </div>
  );
};

export default Asistencia;
