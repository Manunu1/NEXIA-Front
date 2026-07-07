import { useEffect, useState } from "react";
import Sidebar from "../../Componentes/Sidebar";
import Footer from "../../Componentes/footer";
import ConfirmDialog from "../../Componentes/ConfirmDialog";
import EditarComunicadoModal from "../../Componentes/Gestor/EditarComunicadoModal";
import type { ComunicadoCambios } from "../../Componentes/Gestor/EditarComunicadoModal";
import api from "../../api";
import "./comunicados.css";
import { usePageTitle } from '../../hooks/usePageTitle';

interface Comunicado {
  id: number;
  titulo: string;
  contenido: string;
  fecha_publicacion: string;
  activo: boolean;
  imagen_url: string | null;
  gestor_id: number;
  gestor_nombre: string;
  institucion_id: number;
  institucion_nombre: string;
}

const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function formatFecha(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

function Comunicados() {
  usePageTitle('Comunicados');
  const [comunicados, setComunicados] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rol, setRol] = useState("");
  const [institucionId, setInstitucionId] = useState("");
  const [institucionNombre, setInstitucionNombre] = useState("");
  const [userName, setUserName] = useState("");

  // Form state (GESTOR only)
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: "", contenido: "", imagen_url: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Edición / eliminación (GESTOR only)
  const [editTarget, setEditTarget] = useState<Comunicado | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Comunicado | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    try {
      const session = localStorage.getItem('usuario');
      const rolStored = (localStorage.getItem('rol') || '').toUpperCase();
      const instId = localStorage.getItem('institucion_id') || '';
      setRol(rolStored);
      setInstitucionId(instId);
      if (session) {
        const user = JSON.parse(session);
        setInstitucionNombre(user.institucion_nombre || '');
        setUserName(`${user.nombre || ''} ${user.apellido || ''}`.trim());
        if (!instId && user.institucion_id) setInstitucionId(String(user.institucion_id));
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!institucionId) return;
    const fetchComunicados = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/comunicados/${institucionId}`);
        setComunicados(res.data.data || []);
      } catch {
        setError("Error al cargar los comunicados. Verificá tu conexión.");
      } finally {
        setLoading(false);
      }
    };
    fetchComunicados();
  }, [institucionId]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!form.titulo.trim() || !form.contenido.trim()) {
      setSubmitError("El título y el contenido son obligatorios.");
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
      };
      if (form.imagen_url.trim()) body.imagen_url = form.imagen_url.trim();

      const res = await api.post('/api/comunicados', body);

      const newCom: Comunicado = {
        ...res.data.data,
        gestor_nombre: userName,
        institucion_nombre: institucionNombre,
      };
      setComunicados(prev => [newCom, ...prev]);
      setForm({ titulo: "", contenido: "", imagen_url: "" });
      setSubmitSuccess(true);
      setTimeout(() => { setSubmitSuccess(false); setShowForm(false); }, 2500);
    } catch (err: unknown) {
      const e = err as any;
      setSubmitError(e?.response?.data?.message || e?.message || 'Error al publicar el comunicado');
    } finally {
      setSubmitting(false);
    }
  };

  const isGestor = rol === 'GESTOR';

  const guardarEdicion = (cambios: ComunicadoCambios) => {
    if (!editTarget) return;
    setComunicados(prev =>
      prev.map(c => (c.id === editTarget.id ? { ...c, ...cambios } : c))
    );
  };

  const confirmarEliminacion = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError("");
    try {
      await api.delete(`/api/comunicados/${deleteTarget.id}`);
      setComunicados(prev => prev.filter(c => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setActionError(ex?.response?.data?.message || 'Error al eliminar el comunicado. Intentá nuevamente.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">

          {/* Page header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Comunicados</h1>
              <p className="page-subtitle">
                {institucionNombre ? `Publicaciones de ${institucionNombre}` : 'Novedades institucionales'}
              </p>
            </div>
            {isGestor && (
              <button
                className={`com-new-btn${showForm ? ' com-new-btn--active' : ''}`}
                onClick={() => { setShowForm(v => !v); setSubmitError(""); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {showForm
                    ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                    : <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>
                  }
                </svg>
                {showForm ? 'Cancelar' : 'Nuevo comunicado'}
              </button>
            )}
          </div>

          {/* Form panel — GESTOR only */}
          {isGestor && showForm && (
            <form onSubmit={handleSubmit} className="com-form-card">
              <div className="com-form-header">
                <div className="com-form-header-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div>
                  <span className="com-form-title">Publicar comunicado</span>
                  <span className="com-form-sub">Visible para todos los usuarios de la institución</span>
                </div>
              </div>

              <div className="com-form-body">
                {submitError && <div className="com-form-error">{submitError}</div>}

                <div className="form-field">
                  <label htmlFor="com-titulo">Título</label>
                  <input
                    id="com-titulo"
                    name="titulo"
                    type="text"
                    placeholder="Ej: Inicio de clases 2026"
                    value={form.titulo}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="com-contenido">Contenido</label>
                  <textarea
                    id="com-contenido"
                    name="contenido"
                    placeholder="Escribí el mensaje del comunicado..."
                    value={form.contenido}
                    onChange={handleFormChange}
                    rows={5}
                    required
                    className="com-textarea"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="com-imagen">
                    Imagen — URL
                    <span className="com-field-optional">opcional</span>
                  </label>
                  <input
                    id="com-imagen"
                    name="imagen_url"
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={form.imagen_url}
                    onChange={handleFormChange}
                  />
                </div>

                {form.imagen_url.trim() && (
                  <div className="com-img-preview">
                    <img
                      src={form.imagen_url}
                      alt="Vista previa"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              <div className="com-form-footer">
                {submitSuccess && (
                  <div className="com-success-msg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Comunicado publicado exitosamente
                  </div>
                )}
                <button type="submit" className="form-submit" disabled={submitting}>
                  {submitting ? "Publicando..." : "Publicar comunicado"}
                </button>
              </div>
            </form>
          )}

          {/* Error state */}
          {error && <div className="alert-error">{error}</div>}
          {actionError && <div className="alert-error">{actionError}</div>}

          {/* Loading state */}
          {loading ? (
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <span>Cargando comunicados...</span>
            </div>
          ) : comunicados.length === 0 && !error ? (
            /* Empty state */
            <div className="nexia-status-container">
              <div className="com-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <span>No hay comunicados publicados aún</span>
              {isGestor && (
                <span style={{ fontSize: '0.82rem', color: 'var(--t4)' }}>
                  Usá el botón "Nuevo comunicado" para publicar el primero.
                </span>
              )}
            </div>
          ) : (
            /* Comunicados feed */
            <div className="com-grid">
              {comunicados.map((com) => (
                <article key={com.id} className="com-card">
                  {com.imagen_url && (
                    <div className="com-card-img-wrap">
                      <img
                        src={com.imagen_url}
                        alt={com.titulo}
                        className="com-card-img"
                        onError={(e) => {
                          const wrap = (e.currentTarget as HTMLImageElement).parentElement;
                          if (wrap) wrap.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="com-card-body">
                    <div className="com-card-meta">
                      <span className="com-card-date">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        {formatFecha(com.fecha_publicacion)}
                      </span>
                      {com.institucion_nombre && (
                        <span className="com-card-inst">{com.institucion_nombre}</span>
                      )}
                    </div>

                    <h2 className="com-card-title">{com.titulo}</h2>
                    <p className="com-card-text">{com.contenido}</p>

                    {(com.gestor_nombre || isGestor) && (
                      <div className="com-card-footer">
                        {com.gestor_nombre && (
                          <div className="com-card-author">
                            <div className="com-card-author-avatar">
                              {com.gestor_nombre.charAt(0).toUpperCase()}
                            </div>
                            <span className="com-card-author-name">{com.gestor_nombre}</span>
                          </div>
                        )}
                        {isGestor && (
                          <div className="com-card-actions">
                            <button
                              type="button"
                              className="com-action-btn"
                              onClick={() => setEditTarget(com)}
                              aria-label={`Editar comunicado: ${com.titulo}`}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Editar
                            </button>
                            <button
                              type="button"
                              className="com-action-btn com-action-btn--danger"
                              onClick={() => setDeleteTarget(com)}
                              aria-label={`Eliminar comunicado: ${com.titulo}`}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6M14 11v6" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

        </main>
        <Footer />
      </div>

      {/* Modal de edición — GESTOR only */}
      {editTarget && (
        <EditarComunicadoModal
          comunicado={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={guardarEdicion}
        />
      )}

      {/* Confirmación de eliminación — GESTOR only */}
      <ConfirmDialog
        open={deleteTarget !== null}
        danger
        busy={deleting}
        title="Eliminar comunicado"
        message={
          <>
            ¿Estás seguro de que querés eliminar{' '}
            <strong>{deleteTarget?.titulo}</strong>? Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmarEliminacion}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

export default Comunicados;
