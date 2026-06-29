import React, { useState, useEffect } from 'react';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import ListaContenido from '../../../Componentes/profesor/listaContenido';
import { useParams, useNavigate } from 'react-router-dom';
import type { typeContenido } from '../../../Types/profesores/types';
import api from '../../../api';
import './ContenidosAlumnos.css';

function getEmbedUrl(url: string | null | undefined): string {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([^/\s?]+)/);
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`;
  if (url.includes('docs.google.com')) return url.replace(/\/(edit|view|pub)(\?.*)?$/, '/preview');
  return url;
}

function canEmbed(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.includes('youtube.com') || u.includes('youtu.be') ||
    u.includes('drive.google.com') || u.includes('docs.google.com') || u.endsWith('.pdf');
}

const ContenidosAlumnos: React.FC = () => {
  const { profeCursoMateriaId } = useParams<{ profeCursoMateriaId: string }>();
  const navigate = useNavigate();
  const [contenidos, setContenidos] = useState<typeContenido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<typeContenido | null>(null);

  useEffect(() => {
    const traerContenidos = async () => {
      try {
        const res = await api.get(
          `http://localhost:3000/api/contenidos/profe-curso-materia/${profeCursoMateriaId}`
        );
        const lista: typeContenido[] = res.data.data.contenidos || [];
        setContenidos(lista);
        if (lista.length > 0) setSelected(lista[0]);
      } catch (err) {
        console.error('Error al obtener los contenidos:', err);
        setError('No se pudieron cargar los contenidos.');
      } finally {
        setLoading(false);
      }
    };
    if (profeCursoMateriaId) traerContenidos();
  }, [profeCursoMateriaId]);

  const embedUrl = selected?.url ? getEmbedUrl(selected.url) : '';
  const showIframe = selected?.url ? canEmbed(selected.url) : false;

  return (
    <>
      <Sidebar />
      <div className="iv-page">
        <header className="iv-header">
          <button className="iv-back-btn" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </button>
          <div className="iv-header-center">
            <h1 className="iv-title">Contenidos</h1>
            {!loading && (
              <span className="iv-count">{contenidos.length} recursos</span>
            )}
          </div>
          {selected?.url && (
            <a href={selected.url} target="_blank" rel="noopener noreferrer" className="iv-open-btn">
              Abrir externo ↗
            </a>
          )}
        </header>

        <div className="iv-body">
          <div className="iv-list-panel">
            <div className="iv-list-header">
              <span className="iv-list-label">Material disponible</span>
            </div>
            {loading ? (
              <div className="iv-loading">
                <div className="nexia-loading-spinner" />
                <span>Cargando...</span>
              </div>
            ) : error ? (
              <div className="iv-error">{error}</div>
            ) : contenidos.length === 0 ? (
              <div className="iv-empty">
                <span>📂</span>
                <p>Sin contenidos disponibles</p>
              </div>
            ) : (
              <ListaContenido
                contenidos={contenidos}
                selectedId={selected?.contenido_id}
                onSelect={setSelected}
              />
            )}
          </div>

          <div className="iv-viewer-panel">
            {selected ? (
              showIframe ? (
                <div className="iv-iframe-wrap">
                  <iframe
                    key={embedUrl}
                    src={embedUrl}
                    title={selected.titulo}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    className="iv-iframe"
                  />
                </div>
              ) : (
                <div className="iv-fallback">
                  <div className="iv-fallback-icon">🔗</div>
                  <h3 className="iv-fallback-title">{selected.titulo}</h3>
                  <p className="iv-fallback-desc">Este contenido no puede mostrarse en la vista previa integrada.</p>
                  <a href={selected.url} target="_blank" rel="noopener noreferrer" className="iv-fallback-btn">
                    Abrir contenido →
                  </a>
                </div>
              )
            ) : (
              <div className="iv-placeholder">
                <div className="iv-placeholder-icon">👆</div>
                <p className="iv-placeholder-text">Seleccioná un contenido de la lista para verlo aquí</p>
              </div>
            )}

            {selected && (
              <div className="iv-info-bar">
                <div className="iv-info-left">
                  <span className="iv-info-title">{selected.titulo}</span>
                  {selected.descripcion && (
                    <span className="iv-info-desc">{selected.descripcion}</span>
                  )}
                </div>
                {selected.tipo_contenido && (
                  <span className="iv-info-badge">{selected.tipo_contenido}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ContenidosAlumnos;
