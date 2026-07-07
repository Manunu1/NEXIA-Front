import React, { useState, useEffect } from 'react';
import Sidebar from '../../../Componentes/Sidebar';
import ListaContenido from '../../../Componentes/profesor/listaContenido';
import MateriaTabsAlumno from '../../../Componentes/alumnos/MateriaTabsAlumno';
import MateriaIdentity from '../../../Componentes/MateriaIdentity';
import { useParams, useNavigate } from 'react-router-dom';
import type { typeContenido } from '../../../Types/profesores/types';
import api from '../../../api';
import './ContenidosAlumnos.css';

interface MateriaDetalle {
  materia_nombre: string;
  anio: number;
  division: string;
}

function getEmbedUrl(url: string | null | undefined): string {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s?]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([^/\s?]+)/);
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`;
  const driveOpen = url.match(/drive\.google\.com\/open\?id=([^&\s]+)/);
  if (driveOpen) return `https://drive.google.com/file/d/${driveOpen[1]}/preview`;
  if (url.includes('docs.google.com')) return url.replace(/\/(edit|view|pub)(\?.*)?$/, '/preview');
  return url;
}

function isMediaEmbed(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes('youtube.com') || u.includes('youtu.be') ||
    u.includes('drive.google.com') || u.includes('docs.google.com') ||
    u.endsWith('.pdf') || u.includes('.pdf?')
  );
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

const ContenidosAlumnos: React.FC = () => {
  const { profeCursoMateriaId } = useParams<{ profeCursoMateriaId: string }>();
  const navigate = useNavigate();
  const [contenidos, setContenidos] = useState<typeContenido[]>([]);
  const [materia, setMateria] = useState<MateriaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<typeContenido | null>(null);

  useEffect(() => {
    const traerContenidos = async () => {
      try {
        const res = await api.get(
          `/api/contenidos/profe-curso-materia/${profeCursoMateriaId}`
        );
        setMateria(res.data.data.materia || null);
        const lista: typeContenido[] = (res.data.data.contenidos || []).map((c: typeContenido & { archivo_url?: string }) => ({
          ...c,
          url: c.url || c.archivo_url || '',
        }));
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

  const embedUrl   = selected?.url ? getEmbedUrl(selected.url) : '';
  const isMedia    = selected?.url ? isMediaEmbed(selected.url) : false;
  const hasUrl     = !!selected?.url;

  return (
    <>
      <Sidebar />
      <div className="iv-page">

        {/* ── Header ── */}
        <header className="iv-header">
          <button className="iv-back-btn" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </button>
          <div className="iv-header-center">
            {materia ? (
              <MateriaIdentity
                nombre={materia.materia_nombre}
                anio={materia.anio}
                division={materia.division}
                seccion="Contenidos"
              />
            ) : (
              <h1 className="iv-title">Contenidos</h1>
            )}
            {!loading && (
              <span className="iv-count">{contenidos.length} recursos</span>
            )}
          </div>
          {profeCursoMateriaId && (
            <MateriaTabsAlumno profeCursoMateriaId={profeCursoMateriaId} active="contenidos" />
          )}
          {selected?.url && (
            <a href={selected.url} target="_blank" rel="noopener noreferrer" className="iv-open-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Abrir en pestaña
            </a>
          )}
        </header>

        <div className="iv-body">

          {/* ── Lista panel ── */}
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

          {/* ── Viewer panel ── */}
          <div className="iv-viewer-panel">
            {!selected ? (
              <div className="iv-placeholder">
                <div className="iv-placeholder-icon">👆</div>
                <p className="iv-placeholder-text">Seleccioná un contenido de la lista para verlo aquí</p>
              </div>
            ) : isMedia ? (
              <div className="iv-iframe-wrap">
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  title={selected.titulo}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="iv-iframe"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
                />
              </div>
            ) : hasUrl ? (
              <div className="iv-link-card">
                <div className="iv-link-card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <div className="iv-link-card-body">
                  <p className="iv-link-card-title">{selected.titulo}</p>
                  <p className="iv-link-card-domain">{getDomain(selected.url!)}</p>
                  <p className="iv-link-card-notice">Este tipo de contenido no puede mostrarse embebido por restricciones de seguridad del sitio externo.</p>
                  <a href={selected.url} target="_blank" rel="noopener noreferrer" className="iv-link-card-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Abrir enlace
                  </a>
                </div>
              </div>
            ) : (
              <div className="iv-placeholder">
                <div className="iv-placeholder-icon">🔗</div>
                <p className="iv-placeholder-text">Este contenido no tiene URL asociada.</p>
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
