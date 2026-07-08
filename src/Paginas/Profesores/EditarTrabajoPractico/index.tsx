import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../../Componentes/Sidebar';
import Footer from '../../../Componentes/footer';
import TrabajoPracticoForm from '../../../Componentes/profesor/TrabajoPracticoForm';
import type { TrabajoPracticoFormValues } from '../../../Componentes/profesor/TrabajoPracticoForm';
import type { typeTrabajoPractico } from '../../../Types/profesores/types';
import api from '../../../api';
import './editarTrabajoPractico.css';
import { usePageTitle } from '../../../hooks/usePageTitle';

const EditarTrabajoPractico: React.FC = () => {
  usePageTitle('Editar trabajo práctico');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tp, setTp] = useState<typeTrabajoPractico | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [togglingEstado, setTogglingEstado] = useState(false);

  useEffect(() => {
    const traer = async () => {
      try {
        const res = await api.get(`/api/trabajos-practicos/${id}`);
        setTp(res.data.data);
      } catch (err) {
        console.error('Error al obtener el trabajo práctico:', err);
        setLoadError('No se pudo cargar el trabajo práctico.');
      } finally {
        setLoading(false);
      }
    };
    if (id) traer();
  }, [id]);

  const handleSubmit = async (values: TrabajoPracticoFormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.put(`/api/trabajos-practicos/${id}`, {
        titulo: values.titulo,
        descripcion: values.descripcion,
        archivo_url: values.archivo_url || undefined,
        fecha_limite: values.fecha_limite || null,
      });
      navigate(`/trabajos-practicos/${tp?.profe_curso_materia_id}`);
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setSubmitError(ex.response?.data?.message || 'Error al guardar los cambios.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEstado = async () => {
    if (!tp) return;
    setTogglingEstado(true);
    try {
      const res = await api.patch(`/api/trabajos-practicos/${id}/estado`, { activo: !tp.activo });
      setTp({ ...tp, activo: res.data.data?.activo ?? !tp.activo });
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setSubmitError(ex.response?.data?.message || 'Error al cambiar el estado del trabajo práctico.');
    } finally {
      setTogglingEstado(false);
    }
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <div className="main-wrapper">
          <main className="main-content">
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <p>Cargando trabajo práctico...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (loadError || !tp) {
    return (
      <>
        <Sidebar />
        <div className="main-wrapper">
          <main className="main-content">
            <div className="alert-error">{loadError || 'Trabajo práctico no encontrado.'}</div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header page-header--center">
            <div>
              <button className="btn-back-page" onClick={() => navigate(`/trabajos-practicos/${tp.profe_curso_materia_id}`)}>
                ← Volver a trabajos prácticos
              </button>
              <h1 className="page-title">Editar trabajo práctico</h1>
              <p className="page-subtitle">Los cambios se guardan tanto en borrador como publicado</p>
            </div>
            <button
              className={`etp-estado-btn ${tp.activo ? 'etp-estado-btn--activo' : ''}`}
              onClick={toggleEstado}
              disabled={togglingEstado}
            >
              {togglingEstado ? 'Actualizando...' : tp.activo ? 'Publicado · pasar a borrador' : 'Borrador · publicar'}
            </button>
          </div>

          <div className="etp-form-wrap">
            <TrabajoPracticoForm
              initialValues={{
                titulo: tp.titulo,
                descripcion: tp.descripcion,
                archivo_url: tp.archivo_url ?? '',
                fecha_limite: tp.fecha_limite ?? '',
              }}
              submitLabel="Guardar cambios"
              submitting={submitting}
              submitError={submitError}
              onSubmit={handleSubmit}
            />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default EditarTrabajoPractico;
