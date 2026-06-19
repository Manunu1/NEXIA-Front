import React, { useEffect, useState } from 'react';
import type { typeContenidoForm, typeTipoContenido } from '../../../Types/profesores/types';
import './crearContenido.css';
import axios from 'axios';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import { useParams, useNavigate } from 'react-router-dom';

function getEmbedUrl(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([^/\s?]+)/);
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`;
  if (url.includes('docs.google.com')) return url.replace(/\/(edit|view|pub)(\?.*)?$/, '/preview');
  return url;
}

function canEmbed(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('youtube.com') || u.includes('youtu.be') ||
    u.includes('drive.google.com') || u.includes('docs.google.com') || u.endsWith('.pdf');
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

const CrearContenido: React.FC = () => {
  const { profeCursoMateriaId } = useParams<{ profeCursoMateriaId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<typeContenidoForm>({
    profe_curso_materia_id: Number(profeCursoMateriaId),
    tipo_contenido_id: 0,
    titulo: '',
    descripcion: '',
    archivo_url: '',
  });
  const [tipos, setTipos] = useState<typeTipoContenido[]>([]);
  const [urlPreview, setUrlPreview] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const traerTipos = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/tipos-contenido');
        setTipos(res.data.data);
      } catch (err) {
        console.error('Error al obtener tipos de contenido:', err);
      }
    };
    traerTipos();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'tipo_contenido_id' ? Number(value) : value }));
    if (name === 'archivo_url') {
      if (canEmbed(value)) {
        setUrlPreview(getEmbedUrl(value));
      } else {
        setUrlPreview('');
      }
    }
  };

  const selectedTipo = tipos.find(t => t.id === formData.tipo_contenido_id);

  const Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    try {
      await axios.post('http://localhost:3000/api/contenidos', {
        ...formData,
        profe_curso_materia_id: Number(profeCursoMateriaId),
      });
      setSubmitStatus('success');
    } catch (err) {
      console.error('Error al guardar contenido:', err);
      setSubmitStatus('error');
    }
  };

  if (submitStatus === 'success') {
    return (
      <>
        <Sidebar />
        <div className="main-wrapper">
          <main className="main-content">
            <div className="cc-success-screen">
              <div className="cc-success-icon">🎉</div>
              <h2>¡Contenido publicado!</h2>
              <p>Tus alumnos ya pueden ver el material en la materia.</p>
              <div className="cc-success-actions">
                <button className="btn-simple" onClick={() => navigate(-1)}>
                  Ver contenidos →
                </button>
                <button className="btn-secondary" onClick={() => {
                  setSubmitStatus('idle');
                  setFormData({ profe_curso_materia_id: Number(profeCursoMateriaId), tipo_contenido_id: 0, titulo: '', descripcion: '', archivo_url: '' });
                  setUrlPreview('');
                }}>
                  Publicar otro
                </button>
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
              <button className="btn-back-page" onClick={() => navigate(-1)}>
                ← Volver a contenidos
              </button>
              <h1 className="page-title">📤 Publicar contenido</h1>
              <p className="page-subtitle">Compartí material educativo con tus alumnos</p>
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

                <div className="cc-form-section">
                  <label className="cc-label">URL del contenido *</label>
                  <input
                    name="archivo_url"
                    className="cc-input"
                    placeholder="https://youtube.com/watch?v=... o enlace de Drive"
                    value={formData.archivo_url}
                    onChange={handleChange}
                    required
                    type="url"
                  />
                  {formData.archivo_url && !canEmbed(formData.archivo_url) && (
                    <p className="cc-url-hint">
                      🔗 Este enlace se abrirá en una nueva pestaña (no se puede previsualizar)
                    </p>
                  )}
                  {formData.archivo_url && canEmbed(formData.archivo_url) && (
                    <p className="cc-url-hint cc-url-hint--ok">
                      ✓ Vista previa disponible →
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="cc-submit-btn"
                  disabled={submitStatus === 'loading'}
                >
                  {submitStatus === 'loading' ? 'Publicando...' : '📤 Publicar contenido'}
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
                  <span className="cc-ph-emoji">🔗</span>
                  <p className="cc-ph-title">Vista previa del contenido</p>
                  <p className="cc-ph-sub">
                    Pegá una URL de YouTube, Google Drive o Google Docs para ver una previsualización aquí.
                  </p>
                </div>
              )}

              <div className="cc-guide">
                <h4 className="cc-guide-title">Formatos compatibles</h4>
                <div className="cc-guide-list">
                  {[
                    { icon: '▶', label: 'YouTube', desc: 'Videos educativos' },
                    { icon: '📊', label: 'Google Slides', desc: 'Presentaciones' },
                    { icon: '📁', label: 'Google Drive', desc: 'Archivos y carpetas' },
                    { icon: '📄', label: 'PDF', desc: 'Documentos en PDF' },
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
