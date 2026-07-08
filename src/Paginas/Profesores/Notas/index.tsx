import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../../Componentes/Sidebar';
import Footer from '../../../Componentes/footer';
import MateriaTabs from '../../../Componentes/profesor/MateriaTabs';
import TablaCalificaciones from '../../../Componentes/profesor/TablaCalificaciones';
import type { typeBimestre, typeCalificacionRoster } from '../../../Types/profesores/types';
import api from '../../../api';
import './notas.css';
import EmptyState from '../../../Componentes/EmptyState';

const Notas: React.FC = () => {
  const { profeCursoMateriaId } = useParams<{ profeCursoMateriaId: string }>();
  const navigate = useNavigate();
  const [bimestres, setBimestres] = useState<typeBimestre[]>([]);
  const [bimestreId, setBimestreId] = useState<number | null>(null);
  const [rows, setRows] = useState<typeCalificacionRoster[]>([]);
  const [loadingBimestres, setLoadingBimestres] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const traerBimestres = async () => {
      try {
        const res = await api.get('/api/bimestres');
        const lista: typeBimestre[] = (res.data.data || []).sort((a: typeBimestre, b: typeBimestre) => a.orden - b.orden);
        setBimestres(lista);
        if (lista.length > 0) setBimestreId(lista[0].id);
      } catch (err) {
        console.error('Error al obtener bimestres:', err);
        setError('No se pudieron cargar los bimestres.');
      } finally {
        setLoadingBimestres(false);
      }
    };
    traerBimestres();
  }, []);

  useEffect(() => {
    if (!profeCursoMateriaId || bimestreId == null) return;
    const traerNotas = async () => {
      setLoadingRows(true);
      try {
        const res = await api.get(
          `/api/calificaciones/profe-curso-materia/${profeCursoMateriaId}`,
          { params: { bimestre_id: bimestreId } }
        );
        setRows(res.data.data || []);
      } catch (err) {
        console.error('Error al obtener calificaciones:', err);
        setError('No se pudieron cargar las calificaciones de este bimestre.');
      } finally {
        setLoadingRows(false);
      }
    };
    traerNotas();
  }, [profeCursoMateriaId, bimestreId]);

  const handleSave = async (alumnoId: number, nota: number, observaciones: string) => {
    await api.post('/api/calificaciones', {
      profe_curso_materia_id: Number(profeCursoMateriaId),
      alumno_id: alumnoId,
      bimestre_id: bimestreId,
      nota,
      observaciones: observaciones || undefined,
    });
  };

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header">
            <div>
              <button className="btn-back-page" onClick={() => navigate('/profesor')}>
                ← Volver a mis cursos
              </button>
              <h1 className="page-title">Notas finales</h1>
              <p className="page-subtitle">Cargá la nota final de cada alumno por bimestre</p>
            </div>
            {profeCursoMateriaId && (
              <MateriaTabs profeCursoMateriaId={profeCursoMateriaId} active="notas" />
            )}
          </div>

          {error && <div className="alert-error">{error}</div>}

          {loadingBimestres ? (
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <p>Cargando bimestres...</p>
            </div>
          ) : bimestres.length === 0 ? (
            <EmptyState
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>}
              title="Sin bimestres cargados"
              description="Todavía no hay bimestres configurados para tu institución."
            />
          ) : (
            <>
              <div className="notas-bimestre-select-wrap">
                <label className="notas-bimestre-label">Bimestre</label>
                <select
                  className="notas-bimestre-select"
                  value={bimestreId ?? ''}
                  onChange={(e) => setBimestreId(Number(e.target.value))}
                >
                  {bimestres.map((b) => (
                    <option key={b.id} value={b.id}>{b.nombre} · {b.anio}</option>
                  ))}
                </select>
              </div>

              {loadingRows ? (
                <div className="nexia-status-container">
                  <div className="nexia-loading-spinner" />
                  <p>Cargando alumnos...</p>
                </div>
              ) : rows.length === 0 ? (
                <EmptyState
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
              title="Sin alumnos en este curso"
              description="No hay alumnos asociados al curso de esta materia."
            />
              ) : (
                <TablaCalificaciones rows={rows} onSave={handleSave} />
              )}
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Notas;
