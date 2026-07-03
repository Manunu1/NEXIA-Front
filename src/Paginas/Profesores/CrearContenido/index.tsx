import React, { useEffect, useRef, useState } from 'react';
import type { typeContenido, typeContenidoForm, typeTipoContenido } from '../../../Types/profesores/types';
import './crearContenido.css';
import api from '../../../api';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

function getEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([^/\s?]+)/);
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`;
  if (url.includes('docs.google.com')) return url.replace(/\/(edit|view|pub)(\?.*)?$/, '/preview');
  return url;
}

function isMediaEmbed(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.includes('youtube.com') || u.includes('youtu.be') ||
    u.includes('drive.google.com') || u.includes('docs.google.com') ||
    u.endsWith('.pdf') || u.includes('.pdf?');
}

function getTypeIcon(nombre: string): string {
  const n = (nombre || '').toLowerCase();
  if (n.includes('video')) return '▶';
  if (n.includes('pdf')) return '📄';
  if (n.includes('presentac') || n.includes('slides')) return '📊';
  if (n.includes('audio')) return '🎵';
  if (n.includes('enlace') || n.includes('link') || n.includes('url')) return '🔗';
  return '📁';
}

function isVideoUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('youtube.com') || u.includes('youtu.be') || u.includes('vimeo.com');
}

// Avisa (sin bloquear) cuando el tipo elegido no coincide con la fuente cargada,
// por ejemplo: tipo "PDF" pero se pegó un link que no es un PDF.
function getTipoFuenteWarning(tipoNombre: string | undefined, mode: SourceMode, url: string): string | null {
  if (!tipoNombre) return null;
  const tipo = tipoNombre.toUpperCase();

  if (mode === 'pdf' && tipo !== 'PDF') {
    return `Subiste un archivo PDF pero el tipo elegido es "${tipoNombre}". Cambiá el tipo a "PDF" para que se muestre correctamente.`;
  }

  if (mode === 'url' && url) {
    const esUrlPdf = url.toLowerCase().includes('.pdf');

    if (tipo === 'PDF' && !esUrlPdf) {
      return 'Elegiste el tipo "PDF" pero el enlace no parece apuntar a un archivo PDF.';
    }
    if (tipo === 'VIDEO' && !isVideoUrl(url)) {
      return 'Elegiste el tipo "VIDEO" pero el enlace no parece ser de YouTube ni de otra plataforma de video.';
    }
  }

  return null;
}

type SourceMode   = 'url' | 'pdf';
type UploadState  = 'idle' | 'uploading' | 'done' | 'error';

const CrearContenido: React.FC = () => {
  const { profeCursoMateriaId, contenidoId } = useParams<{ profeCursoMateriaId?: string; contenidoId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!contenidoId;
  const editState = location.state as { contenido?: typeContenido; profeCursoMateriaId?: string } | null;
  const contenidoOriginal = editState?.contenido ?? null;
  const materiaId = profeCursoMateriaId ?? editState?.profeCursoMateriaId;

  const [formData, setFormData] = useState<typeContenidoForm>({
    profe_curso_materia_id: Number(materiaId),
    tipo_contenido_id: contenidoOriginal?.tipo_contenido_id ? Number(contenidoOriginal.tipo_contenido_id) : 0,
    titulo: contenidoOriginal?.titulo ?? '',
    descripcion: contenidoOriginal?.descripcion ?? '',
    archivo_url: contenidoOriginal?.url ?? '',
  });
  const [tipos, setTipos] = useState<typeTipoContenido[]>([]);
  const [urlPreview, setUrlPreview] = useState(
    contenidoOriginal?.url && isMediaEmbed(contenidoOriginal.url) ? getEmbedUrl(contenidoOriginal.url) : ''
  );
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const [sourceMode, setSourceMode]   = useState<SourceMode>('url');
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const traerTipos = async () => {
      try {
        const res = await api.get('http://localhost:3000/api/tipos-contenido');
        const lista: typeTipoContenido[] = res.data.data;
        setTipos(lista);
        // Si el objeto original no traía tipo_contenido_id por algún motivo,
        // como red de seguridad lo resolvemos por nombre.
        if (!contenidoOriginal?.tipo_contenido_id && contenidoOriginal?.tipo_contenido) {
          const match = lista.find(t => t.nombre === contenidoOriginal.tipo_contenido);
          if (match) setFormData(prev => ({ ...prev, tipo_contenido_id: match.id }));
        }
      } catch (err) {
        console.error('Error al obtener tipos de contenido:', err);
      }
    };
    traerTipos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'tipo_contenido_id' ? Number(value) : value }));
    if (name === 'archivo_url') {
      setUrlPreview(isMediaEmbed(value) ? getEmbedUrl(value) : '');
    }
  };

  const handleSwitchMode = (mode: SourceMode) => {
    setSourceMode(mode);
    setFormData(prev => ({ ...prev, archivo_url: '' }));
    setUrlPreview('');
    setUploadState('idle');
    setUploadedFileName('');
    setUploadError('');
  };

  const uploadPDF = async (file: File) => {
    const isPdf = file.type === 'application/pdf' ||
                  file.type === 'application/octet-stream' ||
                  file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setUploadError('El archivo seleccionado no es un PDF.');
      setUploadState('error');
      return;
    }
    setUploadState('uploading');
    setUploadedFileName(file.name);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      const res = await api.post('http://localhost:3000/api/contenidos/upload', fd);
      const url: string = res.data.data.url;
      setFormData(prev => ({ ...prev, archivo_url: url }));
      setUrlPreview(url);
      setUploadState('done');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al conectar con el servidor.';
      console.error('[Upload error]', err.response?.status, msg);
      setUploadError(msg);
      setUploadState('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPDF(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadPDF(file);
  };

  const selectedTipo = tipos.find(t => t.id === formData.tipo_contenido_id);
  const tipoFuenteWarning = getTipoFuenteWarning(selectedTipo?.nombre, sourceMode, formData.archivo_url);

  const Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.archivo_url) return;
    setSubmitStatus('loading');
    try {
      if (isEditMode) {
        await api.put(`http://localhost:3000/api/contenidos/${contenidoId}`, {
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          archivo_url: formData.archivo_url,
          tipo_contenido_id: formData.tipo_contenido_id,
        });
      } else {
        await api.post('http://localhost:3000/api/contenidos', {
          ...formData,
          profe_curso_materia_id: Number(materiaId),
        });
      }
      setSubmitStatus('success');
    } catch (err) {
      console.error('Error al guardar contenido:', err);
      setSubmitStatus('error');
    }
  };

  if (isEditMode && !contenidoOriginal) {
    return (
      <>
        <Sidebar />
        <div className="main-wrapper">
          <main className="main-content">
            <div className="alert-error">
              No se encontró la información del contenido a editar. Volvé a la lista de contenidos e intentá de nuevo desde ahí.
            </div>
          </main>
        </div>
      </>
    );
  }

  if (submitStatus === 'success') {
    return (
      <>
        <Sidebar />
        <div className="main-wrapper">
          <main className="main-content">
            <div className="cc-success-screen">
              <div className="cc-success-icon">🎉</div>
              <h2>{isEditMode ? '¡Contenido actualizado!' : '¡Contenido publicado!'}</h2>
              <p>{isEditMode ? 'Los cambios ya están disponibles para tus alumnos.' : 'Tus alumnos ya pueden ver el material en la materia.'}</p>
              <div className="cc-success-actions">
                <button className="btn-simple" onClick={() => navigate(`/contenidos/${materiaId}`)}>
                  Ver contenidos →
                </button>
                {!isEditMode && (
                  <button className="btn-secondary" onClick={() => {
                    setSubmitStatus('idle');
                    setFormData({ profe_curso_materia_id: Number(materiaId), tipo_contenido_id: 0, titulo: '', descripcion: '', archivo_url: '' });
                    setUrlPreview('');
                    setUploadState('idle');
                    setUploadedFileName('');
                  }}>
                    Publicar otro
                  </button>
                )}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header">
            <div>
              <button className="btn-back-page" onClick={() => navigate(`/contenidos/${materiaId}`)}>
                ← Volver a contenidos
              </button>
              <h1 className="page-title">{isEditMode ? '✎ Editar contenido' : '📤 Publicar contenido'}</h1>
              <p className="page-subtitle">
                {isEditMode ? 'Actualizá el material ya publicado' : 'Compartí material educativo con tus alumnos'}
              </p>
            </div>
          </div>

          {submitStatus === 'error' && (
            <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
              Hubo un error al guardar el contenido. Revisá los datos e intentá de nuevo.
            </div>
          )}

          <div className="cc-layout">
            {/* ── Columna izquierda: formulario ── */}
            <div className="cc-form-col">
              <form onSubmit={Submit} className="cc-form">

                <div className="cc-form-section">
                  <label className="cc-label">Título del contenido *</label>
                  <input
                    name="titulo"
                    className="cc-input"
                    placeholder="Ej: Clase 1 — Introducción al álgebra"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="cc-form-section">
                  <label className="cc-label">Descripción</label>
                  <textarea
                    name="descripcion"
                    className="cc-input cc-textarea"
                    placeholder="Breve descripción del contenido (opcional)"
                    value={formData.descripcion}
                    onChange={handleChange}
                  />
                </div>

                <div className="cc-form-section">
                  <label className="cc-label">Tipo de contenido *</label>
                  <div className="cc-select-wrap">
                    {selectedTipo && (
                      <span className="cc-select-icon">{getTypeIcon(selectedTipo.nombre)}</span>
                    )}
                    <select
                      name="tipo_contenido_id"
                      className={`cc-input cc-select ${selectedTipo ? 'has-icon' : ''}`}
                      value={formData.tipo_contenido_id}
                      onChange={handleChange}
                      required
                    >
                      <option value={0}>Seleccioná un tipo...</option>
                      {tipos.map(t => (
                        <option key={t.id} value={t.id}>
                          {getTypeIcon(t.nombre)} {t.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── Source selector ── */}
                <div className="cc-form-section">
                  <label className="cc-label">Fuente del contenido *</label>
                  <div className="cc-source-tabs">
                    <button
                      type="button"
                      className={`cc-source-tab${sourceMode === 'url' ? ' cc-source-tab--active' : ''}`}
                      onClick={() => handleSwitchMode('url')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                      </svg>
                      Pegar URL
                    </button>
                    <button
                      type="button"
                      className={`cc-source-tab${sourceMode === 'pdf' ? ' cc-source-tab--active' : ''}`}
                      onClick={() => handleSwitchMode('pdf')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      Subir PDF
                    </button>
                  </div>

                  {/* URL mode */}
                  {sourceMode === 'url' && (
                    <>
                      <input
                        name="archivo_url"
                        className="cc-input"
                        style={{ marginTop: '0.5rem' }}
                        placeholder="https://youtube.com/watch?v=... o enlace de Drive"
                        value={formData.archivo_url}
                        onChange={handleChange}
                        required
                        type="url"
                      />
                      {formData.archivo_url && !isMediaEmbed(formData.archivo_url) && (
                        <p className="cc-url-hint">
                          🔗 Este enlace se abrirá en una nueva pestaña (no se puede previsualizar)
                        </p>
                      )}
                      {formData.archivo_url && isMediaEmbed(formData.archivo_url) && (
                        <p className="cc-url-hint cc-url-hint--ok">
                          ✓ Vista previa disponible →
                        </p>
                      )}
                    </>
                  )}

                  {/* PDF upload mode */}
                  {sourceMode === 'pdf' && (
                    <>
                      {uploadState === 'idle' || uploadState === 'error' ? (
                        <div
                          className={`cc-drop-zone${dragOver ? ' cc-drop-zone--over' : ''}${uploadState === 'error' ? ' cc-drop-zone--error' : ''}`}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleDrop}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28" className="cc-drop-icon">
                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          {uploadState === 'error' ? (
                            <p className="cc-drop-text cc-drop-text--error">
                              {uploadError || 'Error al subir. Intentá de nuevo.'}
                            </p>
                          ) : (
                            <>
                              <p className="cc-drop-text">Arrastrá un PDF o hacé clic para seleccionar</p>
                              <p className="cc-drop-sub">Máximo 20 MB · Solo archivos .pdf</p>
                            </>
                          )}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                          />
                        </div>
                      ) : uploadState === 'uploading' ? (
                        <div className="cc-upload-status cc-upload-status--loading">
                          <div className="nexia-loading-spinner" />
                          <div>
                            <p className="cc-upload-name">{uploadedFileName}</p>
                            <p className="cc-upload-sub">Subiendo archivo...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="cc-upload-status cc-upload-status--done">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <div>
                            <p className="cc-upload-name">{uploadedFileName}</p>
                            <p className="cc-upload-sub">PDF subido correctamente</p>
                          </div>
                          <button
                            type="button"
                            className="cc-upload-remove"
                            onClick={() => { setUploadState('idle'); setUploadError(''); setFormData(p => ({ ...p, archivo_url: '' })); setUrlPreview(''); }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {tipoFuenteWarning && (
                    <div className="cc-mismatch-warning">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      {tipoFuenteWarning}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="cc-submit-btn"
                  disabled={submitStatus === 'loading' || !formData.archivo_url || (sourceMode === 'pdf' && uploadState !== 'done')}
                >
                  {submitStatus === 'loading'
                    ? (isEditMode ? 'Guardando...' : 'Publicando...')
                    : (isEditMode ? '✓ Guardar cambios' : '📤 Publicar contenido')}
                </button>
              </form>
            </div>

            {/* ── Columna derecha: preview + guía ── */}
            <div className="cc-preview-col">
              {urlPreview ? (
                <div className="cc-preview-frame">
                  <div className="cc-preview-header">
                    <span className="cc-preview-label">Vista previa</span>
                    <a href={formData.archivo_url} target="_blank" rel="noopener noreferrer" className="cc-preview-open">
                      Abrir ↗
                    </a>
                  </div>
                  <div className="cc-iframe-wrap">
                    <iframe
                      src={urlPreview}
                      title="Vista previa del contenido"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              ) : (
                <div className="cc-preview-placeholder">
                  <span className="cc-ph-emoji">{sourceMode === 'pdf' ? '📄' : '🔗'}</span>
                  <p className="cc-ph-title">Vista previa del contenido</p>
                  <p className="cc-ph-sub">
                    {sourceMode === 'pdf'
                      ? 'Subí un PDF para ver una previsualización aquí.'
                      : 'Pegá una URL de YouTube, Google Drive o Google Docs para ver una previsualización aquí.'
                    }
                  </p>
                </div>
              )}

              <div className="cc-guide">
                <h4 className="cc-guide-title">Formatos compatibles</h4>
                <div className="cc-guide-list">
                  {[
                    { icon: '📄', label: 'PDF', desc: 'Subí directo o enlace a PDF' },
                    { icon: '▶', label: 'YouTube', desc: 'Videos educativos' },
                    { icon: '📊', label: 'Google Slides', desc: 'Presentaciones' },
                    { icon: '📁', label: 'Google Drive', desc: 'Archivos compartidos' },
                    { icon: '🔗', label: 'Cualquier URL', desc: 'Abre en nueva pestaña' },
                  ].map(({ icon, label, desc }) => (
                    <div key={label} className="cc-guide-item">
                      <span className="cc-guide-icon">{icon}</span>
                      <div>
                        <span className="cc-guide-name">{label}</span>
                        <span className="cc-guide-desc">{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CrearContenido;
