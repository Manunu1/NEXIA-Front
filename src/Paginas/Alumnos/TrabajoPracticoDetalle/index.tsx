import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../../Componentes/Sidebar';
import Footer from '../../../Componentes/footer';
import type { typeEntregaRoster, typeTrabajoPractico } from '../../../Types/profesores/types';
import api from '../../../api';
import { getUsuarioSesion } from '../../../utils/session';
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
  const alumnoId = getUsuarioSesion()?.alumno_id;
  if (alumnoId) return String(alumnoId);
  return localStorage.getItem('alumno_id');
}

function estaVencido(fechaLimite?: string | null): boolean {
  return !!fechaLimite && new Date(fechaLimite).getTime() < Date.now();
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
        const tpRes = await api.get(`/api/trabajos-practicos/${id}`);
        setTp(tpRes.data.data);
        if (alumnoId) {
          try {
            const entregaRes = await api.get(`/api/trabajos-practicos/${id}/entregas/${alumnoId}`);
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
      const res = await api.post('/api/trabajos-practicos/upload', fd);
      setArchivoUrl(res.data.data.url);
      setUploadState('done');
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setSubmitError(ex.response?.data?.message || 'Error al subir el archivo.');
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
      const res = await api.post(`/api/trabajos-practicos/${id}/entregas`, {
        archivo_url: archivoUrl,
        comentario_alumno: comentario || undefined,
      });
      const data = res.data.data;
      setEntrega({ ...data, entrega_id: data.id });
      setUploadState('idle');
      setArchivoUrl('');
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setSubmitError(ex.response?.data?.message || 'No se pudo enviar la entrega.');
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
  const enCorreccion = entrega?.estado === 'pendiente';
  const vencido = estaVencido(tp.fecha_limite);
  const puedeEntregar = !corregido && !vencido;

  const estadoChip = corregido
    ? { label: 'Corregido', className: 'tpd-chip--corregido' }
    : enCorreccion
      ? { label: 'En corrección', className: 'tpd-chip--pendiente' }
      : vencido
        ? { label: 'Vencido', className: 'tpd-chip--vencido' }
        : { label: 'Por entregar', className: 'tpd-chip--activo' };

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
              <div className="tpd-title-row">
                <h1 className="page-title">{tp.titulo}</h1>
                <span className={`tpd-chip ${estadoChip.className}`}>{estadoChip.label}</span>
              </div>
              {tp.fecha_limite && (
                <p className={`tpd-fecha-chip${vencido ? ' tpd-fecha-chip--vencido' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {vencido ? 'Venció el ' : 'Fecha límite: '}{formatFecha(tp.fecha_limite)}
                </p>
              )}
            </div>
          </div>

          <div className="tpd-layout">

            {/* ── Consigna ── */}
            <section className="tpd-panel">
              <div className="tpd-panel-header">
                <div className="tpd-panel-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <h2 className="tpd-panel-title">Consigna</h2>
              </div>

              <div className="tpd-panel-body">
                {tp.descripcion ? (
                  <p className="tpd-descripcion">{tp.descripcion}</p>
                ) : (
                  <p className="tpd-descripcion tpd-descripcion--empty">
                    El docente no cargó una descripción para este trabajo.
                  </p>
                )}
                {tp.archivo_url && (
                  <a href={tp.archivo_url} target="_blank" rel="noopener noreferrer" className="tpd-material-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                    Ver material de la consigna
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                )}
              </div>
            </section>

            {/* ── Tu entrega ── */}
            <section className={`tpd-panel${corregido ? ' tpd-panel--corregido' : ''}`}>
              <div className="tpd-panel-header">
                <div className={`tpd-panel-icon${corregido ? ' tpd-panel-icon--ok' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <h2 className="tpd-panel-title">Tu entrega</h2>
              </div>

              <div className="tpd-panel-body">
                {corregido ? (
                  <div className="tpd-corregido">
                    <div className="tpd-nota-box">
                      <span className="tpd-nota-label">Nota</span>
                      <span className="tpd-nota-value">{entrega?.nota}</span>
                    </div>
                    {entrega?.comentario_correccion && (
                      <blockquote className="tpd-comentario-docente">
                        {entrega.comentario_correccion}
                        <cite>Comentario del docente</cite>
                      </blockquote>
                    )}
                    {entrega?.fecha_correccion && (
                      <p className="tpd-fecha-correccion">Corregido el {formatFecha(entrega.fecha_correccion)}</p>
                    )}
                    {entrega?.archivo_url && (
                      <a href={entrega.archivo_url} target="_blank" rel="noopener noreferrer" className="tpd-material-btn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                        Ver mi entrega
                      </a>
                    )}
                  </div>
                ) : (
                  <>
                    {enCorreccion && (
                      <div className="tpd-estado-banner tpd-estado-banner--pendiente">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <div>
                          <strong>Ya entregaste este trabajo</strong>
                          <p>Tu docente lo está revisando. Vas a ver la nota acá cuando lo corrija.</p>
                          {entrega?.archivo_url && (
                            <a href={entrega.archivo_url} target="_blank" rel="noopener noreferrer">
                              Ver mi entrega actual ↗
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {vencido ? (
                      !enCorreccion && (
                        <div className="tpd-estado-banner tpd-estado-banner--vencido">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                          </svg>
                          <div>
                            <strong>La fecha límite ya pasó</strong>
                            <p>No es posible entregar este trabajo. Si creés que es un error, hablá con tu docente.</p>
                          </div>
                        </div>
                      )
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
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
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
                            <div>
                              <p className="tpd-upload-name">{uploadedFileName}</p>
                              <p className="tpd-upload-sub">Subiendo archivo…</p>
                            </div>
                          </div>
                        ) : (
                          <div className="tpd-upload-status tpd-upload-status--done">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <div>
                              <p className="tpd-upload-name">{uploadedFileName}</p>
                              <p className="tpd-upload-sub">Listo para entregar</p>
                            </div>
                            <button
                              type="button"
                              className="tpd-upload-remove"
                              aria-label="Quitar archivo"
                              onClick={() => { setUploadState('idle'); setArchivoUrl(''); setUploadedFileName(''); }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
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
                          {submitting && <span className="tpd-btn-spinner" aria-hidden="true" />}
                          {submitting ? 'Enviando…' : entrega ? 'Reemplazar entrega' : 'Entregar trabajo'}
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default TrabajoPracticoDetalle;
