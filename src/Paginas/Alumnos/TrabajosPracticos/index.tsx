import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import MateriaTabsAlumno from '../../../Componentes/alumnos/MateriaTabsAlumno';
import TarjetaTrabajoPractico from '../../../Componentes/alumnos/TarjetaTrabajoPractico';
import type { typeTrabajoPracticoAlumno } from '../../../Types/profesores/types';
import api from '../../../api';
import './trabajosPracticos.css';

type Filtro = 'todos' | 'pendientes' | 'corregidos';

function normalizar(raw: any): typeTrabajoPracticoAlumno {
  return {
    trabajo_practico_id: raw.trabajo_practico_id,
    profe_curso_materia_id: raw.profe_curso_materia_id,
    titulo: raw.titulo,
    descripcion: raw.descripcion,
    archivo_url: raw.archivo_url ?? null,
    fecha_limite: raw.fecha_limite ?? null,
    activo: raw.activo ?? true,
    fecha_publicacion: raw.fecha_publicacion ?? null,
    materia_id: raw.materia_id,
    materia_nombre: raw.materia_nombre ?? '',
    entrega_id: raw.entrega_id ?? null,
    estado: raw.estado ?? null,
    nota: raw.nota ?? null,
    comentario_correccion: raw.comentario_correccion ?? null,
    fecha_correccion: raw.fecha_correccion ?? null,
    fecha_entrega: raw.fecha_entrega ?? null,
    entrega_archivo_url: raw.entrega_archivo_url ?? null,
    comentario_alumno: raw.comentario_alumno ?? null,
  };
}

const TrabajosPracticosAlumno: React.FC = () => {
  const { profeCursoMateriaId } = useParams<{ profeCursoMateriaId: string }>();
  const navigate = useNavigate();
  const [trabajos, setTrabajos] = useState<typeTrabajoPracticoAlumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  useEffect(() => {
    const traer = async () => {
      try {
        const session = localStorage.getItem('usuario');
        const alumnoId = session ? JSON.parse(session).alumno_id : localStorage.getItem('alumno_id');
        if (!alumnoId) { setError('No se encontró el ID del alumno.'); return; }
        const res = await api.get(`http://localhost:3000/api/trabajos-practicos/alumno/${alumnoId}`);
        const lista: typeTrabajoPracticoAlumno[] = (res.data.data || []).map(normalizar);
        const deLaMateria = lista.filter(
          (tp) => String(tp.profe_curso_materia_id) === String(profeCursoMateriaId)
        );
        setTrabajos(deLaMateria);
      } catch (err) {
        console.error('Error al obtener los trabajos prácticos:', err);
        setError('No se pudieron cargar los trabajos prácticos.');
      } finally {
        setLoading(false);
      }
    };
    if (profeCursoMateriaId) traer();
  }, [profeCursoMateriaId]);

  const filtrados = useMemo(() => {
    if (filtro === 'pendientes') return trabajos.filter(t => t.estado !== 'corregido');
    if (filtro === 'corregidos') return trabajos.filter(t => t.estado === 'corregido');
    return trabajos;
  }, [trabajos, filtro]);

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header">
            <div>
              <button className="btn-back-page" onClick={() => navigate(-1)}>
                ← Volver a la materia
              </button>
              <h1 className="page-title">Trabajos prácticos</h1>
              <p className="page-subtitle">Los trabajos publicados por tu docente en esta materia</p>
            </div>
            {profeCursoMateriaId && (
              <MateriaTabsAlumno profeCursoMateriaId={profeCursoMateriaId} active="trabajos-practicos" />
            )}
          </div>

          {!loading && trabajos.length > 0 && (
            <div className="tpa-filtros">
              {([
                ['todos', 'Todos'],
                ['pendientes', 'Por entregar / en corrección'],
                ['corregidos', 'Corregidos'],
              ] as [Filtro, string][]).map(([key, label]) => (
                <button
                  key={key}
                  className={`tpa-filtro-btn${filtro === key ? ' tpa-filtro-btn--active' : ''}`}
                  onClick={() => setFiltro(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {error && <div className="alert-error">{error}</div>}

          {loading ? (
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <p>Cargando trabajos prácticos...</p>
            </div>
          ) : trabajos.length === 0 && !error ? (
            <div className="no-materias-fallback">
              <div className="fallback-icon">🗂️</div>
              <h3>Sin trabajos prácticos</h3>
              <p>Tu docente todavía no publicó trabajos prácticos en esta materia.</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="no-materias-fallback">
              <div className="fallback-icon">✨</div>
              <h3>Nada por acá</h3>
              <p>No hay trabajos prácticos en este filtro.</p>
            </div>
          ) : (
            <div className="tpa-grid">
              {filtrados.map((tp) => (
                <TarjetaTrabajoPractico key={tp.trabajo_practico_id} trabajo={tp} />
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default TrabajosPracticosAlumno;
