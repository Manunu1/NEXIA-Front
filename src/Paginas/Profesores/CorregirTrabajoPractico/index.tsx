import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import RosterEntregas from '../../../Componentes/profesor/RosterEntregas';
import type { typeEntregaRoster, typeTrabajoPractico } from '../../../Types/profesores/types';
import api from '../../../api';
import './corregirTrabajoPractico.css';

function formatFecha(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

const CorregirTrabajoPractico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tp, setTp] = useState<typeTrabajoPractico | null>(null);
  const [rows, setRows] = useState<typeEntregaRoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const traer = async () => {
      try {
        const [tpRes, entregasRes] = await Promise.all([
          api.get(`http://localhost:3000/api/trabajos-practicos/${id}`),
          api.get(`http://localhost:3000/api/trabajos-practicos/${id}/entregas`),
        ]);
        setTp(tpRes.data.data);
        setRows(entregasRes.data.data.entregas || entregasRes.data.data || []);
      } catch (err) {
        console.error('Error al obtener las entregas:', err);
        setError('No se pudieron cargar las entregas.');
      } finally {
        setLoading(false);
      }
    };
    if (id) traer();
  }, [id]);

  const handleGrade = async (alumnoId: number, nota: number, comentario: string) => {
    await api.put(`http://localhost:3000/api/trabajos-practicos/${id}/notas/${alumnoId}`, {
      nota,
      comentario_correccion: comentario || undefined,
    });
    setRows((prev) => prev.map((r) => r.alumno_id === alumnoId
      ? { ...r, nota, comentario_correccion: comentario, estado: 'corregido', fecha_correccion: new Date().toISOString() }
      : r));
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="main-wrapper">
          <main className="main-content">
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <p>Cargando entregas...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error || !tp) {
    return (
      <>
        <Sidebar />
        <div className="main-wrapper">
          <main className="main-content">
            <div className="alert-error">{error || 'Trabajo práctico no encontrado.'}</div>
          </main>
        </div>
      </>
    );
  }

  const corregidas = rows.filter((r) => r.estado === 'corregido').length;

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header">
            <div>
              <button className="btn-back-page" onClick={() => navigate(`/trabajos-practicos/${tp.profe_curso_materia_id}`)}>
                ← Volver a trabajos prácticos
              </button>
              <h1 className="page-title">{tp.titulo}</h1>
              <p className="page-subtitle">
                {corregidas} de {rows.length} entregas corregidas
                {tp.fecha_limite && ` · Vence ${formatFecha(tp.fecha_limite)}`}
              </p>
            </div>
            <Link to={`/trabajo-practico/${id}/editar`} className="ctp-editar-link">
              Editar trabajo práctico
            </Link>
          </div>

          {tp.descripcion && <p className="ctp-descripcion">{tp.descripcion}</p>}

          {rows.length === 0 ? (
            <div className="no-materias-fallback">
              <div className="fallback-icon">👥</div>
              <h3>Sin alumnos en este curso</h3>
              <p>No hay alumnos asociados al curso de esta materia.</p>
            </div>
          ) : (
            <RosterEntregas rows={rows} onGrade={handleGrade} />
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CorregirTrabajoPractico;
