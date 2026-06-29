import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import type { typeContenido } from '../../Types/profesores/types';
import Sidebar from '../../Componentes/alumnos/Sidebar';
import './verContenido.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getEmbedUrl(url: string): string {
  if (!url) return '';

  // YouTube watch / short links
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;

  // Google Drive file/d/
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([^/\s?]+)/);
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`;

  // Google Drive open?id=
  const driveOpen = url.match(/drive\.google\.com\/open\?id=([^&\s]+)/);
  if (driveOpen) return `https://drive.google.com/file/d/${driveOpen[1]}/preview`;

  // Google Docs / Slides / Sheets
  if (url.includes('docs.google.com')) {
    return url.replace(/\/(edit|view|pub)(\?.*)?$/, '/preview');
  }

  // Default: try to embed as-is (works for PDFs, etc.)
  return url;
}

function canEmbed(url: string): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes('youtube.com') ||
    u.includes('youtu.be') ||
    u.includes('drive.google.com') ||
    u.includes('docs.google.com') ||
    u.endsWith('.pdf') ||
    u.includes('.pdf?')
  );
}

function getIcon(tipo: string, url: string): string {
  const u = (url || '').toLowerCase();
  const t = (tipo || '').toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return '▶';
  if (u.includes('docs.google.com/presentation')) return '📊';
  if (u.includes('drive.google.com') || u.includes('docs.google.com')) return '📁';
  if (t.includes('video')) return '🎬';
  if (t.includes('pdf') || u.endsWith('.pdf')) return '📄';
  if (t.includes('presentac') || t.includes('slides')) return '📊';
  if (t.includes('audio')) return '🎵';
  return '📎';
}

function getTypeLabel(tipo: string, url: string): string {
  const u = (url || '').toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'Video YouTube';
  if (u.includes('docs.google.com/presentation')) return 'Presentación';
  if (u.includes('drive.google.com')) return 'Google Drive';
  if (u.includes('docs.google.com')) return 'Google Docs';
  return tipo || 'Recurso';
}

// ── Component ─────────────────────────────────────────────────────────────────

const VerContenido: React.FC = () => {
  const { contenidoId } = useParams<{ contenidoId: string }>();
  const navigate = useNavigate();

  const [contenido, setContenido] = useState<typeContenido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const traer = async () => {
      try {
        const res = await api.get(
          `http://localhost:3000/api/contenidos/contenido/${contenidoId}`
        );
        const db = res.data.data || res.data;
        setContenido({
          contenido_id: db.contenido_id,
          titulo: db.titulo,
          descripcion: db.descripcion,
          tipo_contenido: db.tipo_contenido,
          url: db.archivo_url,
        });
      } catch (e) {
        console.error('Error al cargar el contenido:', e);
      } finally {
        setLoading(false);
      }
    };
    if (contenidoId) traer();
  }, [contenidoId]);

  const embedUrl   = contenido ? getEmbedUrl(contenido.url) : '';
  const showIframe = contenido ? canEmbed(contenido.url) : false;
  const icon       = contenido ? getIcon(contenido.tipo_contenido, contenido.url) : '📎';
  const typeLabel  = contenido ? getTypeLabel(contenido.tipo_contenido, contenido.url) : '';

  return (
    <div className="vc-page">
      <Sidebar />

      <div className="vc-wrapper">

        {/* ── Top bar ── */}
        <header className="vc-header">
          <button className="vc-back-btn" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Volver
          </button>

          <div className="vc-header-center">
            {!loading && contenido && (
              <>
                <span className="vc-type-badge">{icon} {typeLabel}</span>
                <h1 className="vc-header-title">{contenido.titulo}</h1>
              </>
            )}
          </div>

          {!loading && contenido?.url && (
            <a
              href={contenido.url}
              target="_blank"
              rel="noopener noreferrer"
              className="vc-external-btn"
            >
              Abrir en nueva pestaña
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          )}
        </header>

        {/* ── Body ── */}
        <div className="vc-body">

          {/* Left info panel */}
          <aside className="vc-info-panel">
            {loading ? (
              <div className="vc-panel-loading">
                <div className="vc-spinner" />
              </div>
            ) : contenido ? (
              <>
                <div className="vc-icon-display">{icon}</div>

                <div className="vc-meta-badge">{typeLabel}</div>

                <h2 className="vc-info-title">{contenido.titulo}</h2>

                {contenido.descripcion && (
                  <p className="vc-info-desc">{contenido.descripcion}</p>
                )}

                <div className="vc-divider" />

                <div className="vc-panel-tip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>Si el visor no carga, usá el botón de abrir en nueva pestaña.</span>
                </div>

                <a
                  href={contenido.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vc-open-external"
                >
                  Abrir externamente ↗
                </a>
              </>
            ) : (
              <p className="vc-error-text">No se encontró el contenido.</p>
            )}
          </aside>

          {/* Right viewer */}
          <div className="vc-viewer">
            {loading ? (
              <div className="vc-viewer-state">
                <div className="vc-spinner vc-spinner-light" />
                <p>Cargando contenido...</p>
              </div>
            ) : showIframe ? (
              <div className="vc-iframe-container">
                <iframe
                  src={embedUrl}
                  title={contenido?.titulo}
                  className="vc-iframe"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              </div>
            ) : contenido?.url ? (
              <div className="vc-fallback">
                <div className="vc-fallback-icon">{icon}</div>
                <h3 className="vc-fallback-title">{contenido.titulo}</h3>
                <p className="vc-fallback-sub">
                  Este tipo de contenido no se puede previsualizar aquí.<br />
                  Abrilo directamente para verlo.
                </p>
                <a
                  href={contenido.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="vc-fallback-btn"
                >
                  Abrir contenido ↗
                </a>
              </div>
            ) : (
              <div className="vc-viewer-state">
                <span style={{ fontSize: '3rem' }}>🔗</span>
                <p>No hay URL asociada a este contenido.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerContenido;
