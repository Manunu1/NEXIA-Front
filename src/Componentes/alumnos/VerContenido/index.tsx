import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api';
import './VerContenido.css';

// Interfaz que replica exactamente el formato de datos enviado por el Backend de NEXIA
interface Contenido {
  contenido_id: string;
  titulo: string;
  descripcion: string;
  archivo_url: string;
  fecha_creacion: string;
  tipo_contenido_id: string;
  tipo_contenido: string; // Ej: "LINK", "PDF", "VIDEO"
  materia_id: string;
  materia_nombre: string;
  curso_id: string;
  anio: number;
  division: string;
}

interface ApiResponse {
  ok: boolean;
  message: string;
  data: Contenido[];
}

export const VerContenido: React.FC = () => {
  const { materiaId, contenidoId } = useParams<{ materiaId: string; contenidoId: string }>();
  const navigate = useNavigate();

  // Estados de la aplicación
  const [contenidos, setContenidos] = useState<Contenido[]>([]);
  const [contenidoSeleccionado, setContenidoSeleccionado] = useState<Contenido | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContenidos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Recuperamos los datos del alumno logueado desde el almacenamiento local (cargados en el login)
        const sessionData = localStorage.getItem('user');
        if (!sessionData) {
          setError('No se encontró una sesión activa. Por favor, iniciá sesión.');
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(sessionData);
        const alumnoId = parsedUser.alumno_id; // Campo mapeado del backend: data.alumno_id

        if (!alumnoId || !materiaId) {
          setError('Información de navegación inválida.');
          setLoading(false);
          return;
        }

        // Consumo del endpoint tal como lo define la documentación de la API
        const response = await api.get<ApiResponse>(
          `/api/alumnos/${alumnoId}/contenidos`,
          {
            params: { materia_id: materiaId }
          }
        );

        if (response.data.ok && response.data.data) {
          const listaContenidos = response.data.data;
          setContenidos(listaContenidos);

          // Si viene un contenidoId por URL, lo seleccionamos; si no, por defecto mostramos el primero
          const actual = listaContenidos.find(c => c.contenido_id === contenidoId) || listaContenidos[0];
          setContenidoSeleccionado(actual || null);
        } else {
          setError(response.data.message || 'Error al cargar los contenidos.');
        }
      } catch (err: unknown) {
        console.error('Error al conectar con la API de NEXIA:', err);
        setError('Error de conexión con el servidor de la plataforma.');
      } finally {
        setLoading(false);
      }
    };

    fetchContenidos();
  }, [materiaId, contenidoId]);

  // Manejador para cambiar de contenido de forma fluida
  const handleSeleccionarContenido = (contenido: Contenido) => {
    setContenidoSeleccionado(contenido);
    // Actualizamos la URL para mantener la sincronía del estado de la app
    navigate(`/materia/${materiaId}/contenido/${contenido.contenido_id}`);
  };

  if (loading) {
    return (
      <div className="nexia-loading-container">
        <div className="nexia-spinner"></div>
        <p>Cargando material de estudio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="nexia-error-container">
        <p className="error-message">{error}</p>
        <button className="btn-regresar" onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  return (
    <div className="nexia-ver-contenido-page">
      {/* Barra superior de navegación interna */}
      <header className="contenido-header">
        <button className="btn-back" onClick={() => navigate(`/materia/${materiaId}`)}>
          ← Volver a la Materia
        </button>
        <div className="header-info">
          <h1>{contenidoSeleccionado?.materia_nombre || 'Visualizador de Contenidos'}</h1>
          <span className="badge-curso">{`${contenidoSeleccionado?.anio}° "${contenidoSeleccionado?.division}"`}</span>
        </div>
      </header>

      <div className="contenido-main-layout">
        {/* Panel Izquierdo: Lista de archivos y links adjuntos */}
        <aside className="contenido-sidebar">
          <h2 className="sidebar-title">Material Adicional</h2>
          <ul className="lista-materiales">
            {contenidos.map((item) => (
              <li
                key={item.contenido_id}
                className={`material-item ${contenidoSeleccionado?.contenido_id === item.contenido_id ? 'active' : ''}`}
                onClick={() => handleSeleccionarContenido(item)}
              >
                <div className="material-icon">
                  {item.tipo_contenido === 'LINK' ? '🔗' : '📄'}
                </div>
                <div className="material-meta">
                  <span className="material-item-titulo">{item.titulo}</span>
                  <span className="material-item-tipo">{item.tipo_contenido}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Panel Derecho: Visor principal (Embed) */}
        <main className="contenido-viewer-container">
          {contenidoSeleccionado ? (
            <div className="viewer-card">
              <div className="viewer-header">
                <h2>{contenidoSeleccionado.titulo}</h2>
                <p className="viewer-description">{contenidoSeleccionado.descripcion}</p>
              </div>

              {/* Contenedor del Embed del profesor */}
              <div className="embed-wrapper">
                {contenidoSeleccionado.archivo_url ? (
                  <iframe
                    src={contenidoSeleccionado.archivo_url}
                    title={contenidoSeleccionado.titulo}
                    className="nexia-iframe-embed"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="no-url-fallback">
                    <p>Este contenido no posee una URL válida de previsualización.</p>
                  </div>
                )}
              </div>

              {/* Botón de acción externa de respaldo por si el iframe se bloquea (X-Frame-Options) */}
              <div className="viewer-footer">
                <a
                  href={contenidoSeleccionado.archivo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-external-link"
                >
                  Abrir material en pestaña nueva ↗
                </a>
              </div>
            </div>
          ) : (
            <div className="no-content-selected">
              <p>Seleccioná un elemento de la lista para visualizar el contenido adjunto.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VerContenido;