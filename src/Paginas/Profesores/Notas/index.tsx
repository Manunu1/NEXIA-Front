import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import MateriaTabs from '../../../Componentes/profesor/MateriaTabs';
import TablaCalificaciones from '../../../Componentes/profesor/TablaCalificaciones';
import type { typeBimestre, typeCalificacionRoster } from '../../../Types/profesores/types';
import api from '../../../api';
import './notas.css';

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
        const res = await api.get('http://localhost:3000/api/bimestres');
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
          `http://localhost:3000/api/calificaciones/profe-curso-materia/${profeCursoMateriaId}`,
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
    await api.post('http://localhost:3000/api/calificaciones', {
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
            <div className="no-materias-fallback">
              <div className="fallback-icon">🗓️</div>
              <h3>Sin bimestres cargados</h3>
              <p>Todavía no hay bimestres configurados para tu institución.</p>
            </div>
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
                <div className="no-materias-fallback">
                  <div className="fallback-icon">👥</div>
                  <h3>Sin alumnos en este curso</h3>
                  <p>No hay alumnos asociados al curso de esta materia.</p>
                </div>
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
