import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../../Componentes/Sidebar';
import Footer from '../../../Componentes/footer';
import TrabajoPracticoForm from '../../../Componentes/profesor/TrabajoPracticoForm';
import type { TrabajoPracticoFormValues } from '../../../Componentes/profesor/TrabajoPracticoForm';
import api from '../../../api';
import './crearTrabajoPractico.css';
import { usePageTitle } from '../../../hooks/usePageTitle';

const CrearTrabajoPractico: React.FC = () => {
  usePageTitle('Crear trabajo práctico');
  const { profeCursoMateriaId } = useParams<{ profeCursoMateriaId: string }>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicarAhora, setPublicarAhora] = useState(false);

  const handleSubmit = async (values: TrabajoPracticoFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post('/api/trabajos-practicos', {
        profe_curso_materia_id: Number(profeCursoMateriaId),
        titulo: values.titulo,
        descripcion: values.descripcion,
        archivo_url: values.archivo_url || undefined,
        fecha_limite: values.fecha_limite || undefined,
      });
      const nuevoId = res.data.data.trabajo_practico_id ?? res.data.data.id;
      if (publicarAhora && nuevoId) {
        await api.patch(`/api/trabajos-practicos/${nuevoId}/estado`, { activo: true });
      }
      navigate(`/trabajos-practicos/${profeCursoMateriaId}`);
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setError(ex.response?.data?.message || 'Error al crear el trabajo práctico.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header page-header--center">
            <div>
              <button className="btn-back-page" onClick={() => navigate(-1)}>
                ← Volver a trabajos prácticos
              </button>
              <h1 className="page-title">Crear trabajo práctico</h1>
              <p className="page-subtitle">Definí la consigna, la fecha de entrega y el material de apoyo</p>
            </div>
          </div>

          <div className="ctp-layout">

            {/* ── Panel informativo ── */}
            <aside className="ctp-aside">
              <div className="ctp-aside-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                  <rect x="9" y="3" width="6" height="4" rx="1" />
                  <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
                </svg>
              </div>
              <div>
                <h3 className="ctp-aside-title">Nuevo trabajo práctico</h3>
                <p className="ctp-aside-desc">
                  Cargá la consigna que van a recibir los alumnos de esta materia.
                  Podés adjuntar un archivo de apoyo y definir una fecha límite.
                </p>
              </div>

              <ul className="ctp-steps">
                <li className="ctp-step">
                  <span className="ctp-step-num">1</span>
                  <span className="ctp-step-text">Título y consigna del trabajo</span>
                </li>
                <li className="ctp-step">
                  <span className="ctp-step-num">2</span>
                  <span className="ctp-step-text">Fecha límite de entrega</span>
                </li>
                <li className="ctp-step">
                  <span className="ctp-step-num">3</span>
                  <span className="ctp-step-text">Archivo adjunto de la consigna</span>
                </li>
              </ul>

              <div className="ctp-tip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p>
                  El trabajo se crea como <strong>borrador</strong>: los alumnos no lo ven
                  hasta que lo publiques. Activá "Publicar ahora" para que sea visible al crearlo.
                </p>
              </div>
            </aside>

            {/* ── Formulario ── */}
            <div className="ctp-form-col">
              <TrabajoPracticoForm
                submitLabel="Crear trabajo práctico"
                submitting={submitting}
                submitError={error}
                onSubmit={handleSubmit}
                extraAction={
                  <label className="ctp-publish">
                    <input
                      type="checkbox"
                      className="ctp-publish-input"
                      checked={publicarAhora}
                      onChange={(e) => setPublicarAhora(e.target.checked)}
                    />
                    <span className="ctp-publish-track" aria-hidden="true">
                      <span className="ctp-publish-thumb" />
                    </span>
                    <span className="ctp-publish-text">
                      <strong>Publicar ahora</strong>
                      <small>{publicarAhora ? 'Visible para los alumnos al crearlo' : 'Se guardará como borrador'}</small>
                    </span>
                  </label>
                }
              />
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CrearTrabajoPractico;
