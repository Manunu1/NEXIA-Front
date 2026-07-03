import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import TrabajoPracticoForm from '../../../Componentes/profesor/TrabajoPracticoForm';
import type { TrabajoPracticoFormValues } from '../../../Componentes/profesor/TrabajoPracticoForm';
import api from '../../../api';
import './crearTrabajoPractico.css';

const CrearTrabajoPractico: React.FC = () => {
  const { profeCursoMateriaId } = useParams<{ profeCursoMateriaId: string }>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicarAhora, setPublicarAhora] = useState(false);

  const handleSubmit = async (values: TrabajoPracticoFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('http://localhost:3000/api/trabajos-practicos', {
        profe_curso_materia_id: Number(profeCursoMateriaId),
        titulo: values.titulo,
        descripcion: values.descripcion,
        archivo_url: values.archivo_url || undefined,
        fecha_limite: values.fecha_limite || undefined,
      });
      const nuevoId = res.data.data.trabajo_practico_id ?? res.data.data.id;
      if (publicarAhora && nuevoId) {
        await api.patch(`http://localhost:3000/api/trabajos-practicos/${nuevoId}/estado`, { activo: true });
      }
      navigate(`/trabajos-practicos/${profeCursoMateriaId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el trabajo práctico.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header">
            <div>
              <button className="btn-back-page" onClick={() => navigate(-1)}>
                ← Volver a trabajos prácticos
              </button>
              <h1 className="page-title">📝 Crear trabajo práctico</h1>
              <p className="page-subtitle">Se crea como borrador — publicalo cuando esté listo</p>
            </div>
          </div>

          <TrabajoPracticoForm
            submitLabel="Crear trabajo práctico"
            submitting={submitting}
            submitError={error}
            onSubmit={handleSubmit}
            extraAction={
              <label className="ctp-publish-check">
                <input
                  type="checkbox"
                  checked={publicarAhora}
                  onChange={(e) => setPublicarAhora(e.target.checked)}
                />
                Publicar ahora
              </label>
            }
          />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CrearTrabajoPractico;
