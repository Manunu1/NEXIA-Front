import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import type { typeEntregaRoster, typeTrabajoPractico } from '../../../Types/profesores/types';
import api from '../../../api';
import './trabajoPracticoDetalle.css';

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

function formatFecha(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function getAlumnoId(): string | null {
  try {
    const session = localStorage.getItem('usuario');
    if (session) {
      const alumnoId = JSON.parse(session).alumno_id;
      if (alumnoId) return String(alumnoId);
    }
  } catch {}
  return localStorage.getItem('alumno_id');
}

const TrabajoPracticoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const alumnoId = getAlumnoId();

  const [tp, setTp] = useState<typeTrabajoPractico | null>(null);
  const [entrega, setEntrega] = useState<typeEntregaRoster | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [comentario, setComentario] = useState('');
  const [archivoUrl, setArchivoUrl] = useState('');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const traer = async () => {
      try {
        const tpRes = await api.get(`http://localhost:3000/api/trabajos-practicos/${id}`);
        setTp(tpRes.data.data);
        if (alumnoId) {
          try {
            const entregaRes = await api.get(`http://localhost:3000/api/trabajos-practicos/${id}/entregas/${alumnoId}`);
            const data = entregaRes.data.data;
            // El endpoint devuelve la fila cruda de `entrega`, cuya PK es `id` (no `entrega_id`).
            if (data && data.id) {
              setEntrega({ ...data, entrega_id: data.id });
              setComentario(data.comentario_alumno ?? '');
            }
          } catch {
            // Sin entrega todavía — se mantiene null.
          }
        }
      } catch (err) {
        console.error('Error al obtener el trabajo práctico:', err);
        setLoadError('No se pudo cargar el trabajo práctico.');
      } finally {
        setLoading(false);
      }
    };
    if (id) traer();
  }, [id, alumnoId]);

  const uploadArchivo = async (file: File) => {
    setUploadState('uploading');
    setUploadedFileName(file.name);
    setSubmitError(null);
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      const res = await api.post('http://localhost:3000/api/trabajos-practicos/upload', fd);
      setArchivoUrl(res.data.data.url);
      setUploadState('done');
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Error al subir el archivo.');
      setUploadState('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadArchivo(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadArchivo(file);
  };

  const handleEntregar = async () => {
    if (!archivoUrl) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.post(`http://localhost:3000/api/trabajos-practicos/${id}/entregas`, {
        archivo_url: archivoUrl,
        comentario_alumno: comentario || undefined,
      });
      const data = res.data.data;
      setEntrega({ ...data, entrega_id: data.id });
      setUploadState('idle');
      setArchivoUrl('');
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'No se pudo enviar la entrega.');
    } finally {
      setSubmitting(false);
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

  const corregido = entrega?.estado === 'corregido';
  const vencido = !!tp.fecha_limite && new Date(tp.fecha_limite).getTime() < Date.now();
  const puedeEntregar = !corregido && !vencido;

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header">
            <div>
              <button className="btn-back-page" onClick={() => navigate(`/materia/${tp.profe_curso_materia_id}/trabajos-practicos`)}>
                ← Volver a trabajos prácticos
              </button>
              <h1 className="page-title">{tp.titulo}</h1>
              {tp.fecha_limite && (
                <p className={`page-subtitle${vencido ? ' tpd-vencido-text' : ''}`}>
                  {vencido ? 'Venció el ' : 'Fecha límite: '}{formatFecha(tp.fecha_limite)}
                </p>
              )}
            </div>
          </div>

          <div className="tpd-layout">
            <section className="tpd-consigna">
              <h2 className="tpd-section-title">Consigna</h2>
              {tp.descripcion && <p className="tpd-descripcion">{tp.descripcion}</p>}
              {tp.archivo_url && (
                <a href={tp.archivo_url} target="_blank" rel="noopener noreferrer" className="tpd-consigna-link">
                  📎 Ver material de la consigna ↗
                </a>
              )}
            </section>

            <section className="tpd-entrega">
              <h2 className="tpd-section-title">Tu entrega</h2>

              {corregido ? (
                <div className="tpd-corregido">
                  <div className="tpd-nota-chip">Nota: {entrega?.nota}</div>
                  {entrega?.comentario_correccion && (
                    <p className="tpd-comentario-docente">"{entrega.comentario_correccion}"</p>
                  )}
                  {entrega?.fecha_correccion && (
                    <p className="tpd-fecha-correccion">Corregido el {formatFecha(entrega.fecha_correccion)}</p>
                  )}
                  {entrega?.archivo_url && (
                    <a href={entrega.archivo_url} target="_blank" rel="noopener noreferrer" className="tpd-consigna-link">
                      📎 Ver mi entrega ↗
                    </a>
                  )}
                </div>
              ) : (
                <>
                  {entrega?.estado === 'pendiente' && (
                    <div className="tpd-pendiente-banner">
                      Ya entregaste este trabajo — esperando corrección del docente.
                      {entrega.archivo_url && (
                        <a href={entrega.archivo_url} target="_blank" rel="noopener noreferrer">Ver mi entrega actual ↗</a>
                      )}
                    </div>
                  )}

                  {vencido ? (
                    <div className="alert-error">La fecha límite de entrega ya pasó.</div>
                  ) : (
                    <>
                      {submitError && <div className="alert-error">{submitError}</div>}

                      {uploadState === 'idle' || uploadState === 'error' ? (
                        <div
                          className={`tpd-drop-zone${dragOver ? ' tpd-drop-zone--over' : ''}`}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleDrop}
                        >
                          <p className="tpd-drop-text">
                            {entrega ? 'Arrastrá un nuevo archivo para reemplazar tu entrega' : 'Arrastrá tu archivo o hacé clic para seleccionar'}
                          </p>
                          <p className="tpd-drop-sub">PDF, DOC, DOCX, JPG, PNG o ZIP · Máximo 20MB</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                          />
                        </div>
                      ) : uploadState === 'uploading' ? (
                        <div className="tpd-upload-status">
                          <div className="nexia-loading-spinner" />
                          <p className="tpd-upload-name">{uploadedFileName}</p>
                        </div>
                      ) : (
                        <div className="tpd-upload-status tpd-upload-status--done">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <p className="tpd-upload-name">{uploadedFileName}</p>
                        </div>
                      )}

                      <textarea
                        className="tpd-comentario-input"
                        placeholder="Comentario para tu docente (opcional)"
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                      />

                      <button
                        className="tpd-submit-btn"
                        disabled={!puedeEntregar || !archivoUrl || submitting}
                        onClick={handleEntregar}
                      >
                        {submitting ? 'Enviando...' : entrega ? 'Reemplazar entrega' : 'Entregar trabajo'}
                      </button>
                    </>
                  )}
                </>
              )}
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default TrabajoPracticoDetalle;
