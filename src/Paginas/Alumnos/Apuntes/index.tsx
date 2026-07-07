import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../../Componentes/Sidebar';
import Footer from '../../../Componentes/footer';
import Modal from '../../../Componentes/Modal';
import ConfirmDialog from '../../../Componentes/ConfirmDialog';
import EmptyState from '../../../Componentes/EmptyState';
import api from '../../../api';
import { usePageTitle } from '../../../hooks/usePageTitle';
import './apuntes.css';

/* ─────────────────────────────────────────────
   MIS APUNTES — notas personales del alumno.
   Privadas: el backend las limita al alumno del token.
───────────────────────────────────────────── */

interface Apunte {
  id: number;
  titulo: string;
  contenido: string;
  color: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

const COLORES = [
  { key: 'blanco', label: 'Blanco' },
  { key: 'arena', label: 'Arena' },
  { key: 'cielo', label: 'Cielo' },
  { key: 'menta', label: 'Menta' },
] as const;

function formatFecha(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

const FORM_VACIO = { titulo: '', contenido: '', color: 'blanco' };

const Apuntes: React.FC = () => {
  usePageTitle('Mis apuntes');

  const [apuntes, setApuntes] = useState<Apunte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Modal crear/editar
  const [editorAbierto, setEditorAbierto] = useState(false);
  const [editando, setEditando] = useState<Apunte | null>(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');

  // Eliminación
  const [aEliminar, setAEliminar] = useState<Apunte | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const traer = async () => {
      try {
        const res = await api.get('/api/apuntes');
        setApuntes(res.data.data || []);
      } catch (err: unknown) {
        const ex = err as { response?: { status?: number; data?: { message?: string } } };
        if (!ex.response) {
          setError('No se pudo conectar con el servidor. Verificá que el backend esté corriendo.');
        } else if (ex.response.status === 404) {
          setError('El servidor todavía no tiene la función de apuntes — reiniciá el backend para aplicar la actualización.');
        } else {
          setError(ex.response.data?.message || 'No se pudieron cargar tus apuntes.');
        }
      } finally {
        setLoading(false);
      }
    };
    traer();
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return apuntes;
    return apuntes.filter(a =>
      a.titulo.toLowerCase().includes(q) || a.contenido.toLowerCase().includes(q)
    );
  }, [apuntes, busqueda]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(FORM_VACIO);
    setFormError('');
    setEditorAbierto(true);
  };

  const abrirEdicion = (apunte: Apunte) => {
    setEditando(apunte);
    setForm({ titulo: apunte.titulo, contenido: apunte.contenido, color: apunte.color });
    setFormError('');
    setEditorAbierto(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      setFormError('El título es obligatorio.');
      return;
    }
    setGuardando(true);
    setFormError('');
    const body = {
      titulo: form.titulo.trim(),
      contenido: form.contenido.trim(),
      color: form.color,
    };
    try {
      if (editando) {
        const res = await api.put(`/api/apuntes/${editando.id}`, body);
        setApuntes(prev => prev.map(a => (a.id === editando.id ? res.data.data : a)));
      } else {
        const res = await api.post('/api/apuntes', body);
        setApuntes(prev => [res.data.data, ...prev]);
      }
      setEditorAbierto(false);
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setFormError(ex.response?.data?.message || 'No se pudo guardar el apunte.');
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      await api.delete(`/api/apuntes/${aEliminar.id}`);
      setApuntes(prev => prev.filter(a => a.id !== aEliminar.id));
      setAEliminar(null);
    } catch {
      setError('No se pudo eliminar el apunte. Intentá nuevamente.');
      setAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">

          <div className="page-header">
            <div>
              <h1 className="page-title">Mis apuntes</h1>
              <p className="page-subtitle">Tu espacio personal de notas — solo vos podés verlas</p>
            </div>
            <button className="ap-new-btn" onClick={abrirNuevo}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo apunte
            </button>
          </div>

          {error && <div className="alert-error">{error}</div>}

          {!loading && apuntes.length > 0 && (
            <div className="ap-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                placeholder="Buscar en tus apuntes…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar apuntes"
              />
            </div>
          )}

          {loading ? (
            <div className="ap-grid" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="sk ap-sk" />
              ))}
            </div>
          ) : apuntes.length === 0 && !error ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              }
              title="Todavía no tenés apuntes"
              description="Creá tu primer apunte para guardar ideas, resúmenes o recordatorios de clase."
              action={
                <button className="ap-new-btn" onClick={abrirNuevo}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Crear mi primer apunte
                </button>
              }
            />
          ) : filtrados.length === 0 ? (
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
              title="Sin resultados"
              description={`Ningún apunte coincide con "${busqueda}".`}
            />
          ) : (
            <div className="ap-grid">
              {filtrados.map((apunte) => (
                <article
                  key={apunte.id}
                  className={`ap-card ap-card--${apunte.color}`}
                  onClick={() => abrirEdicion(apunte)}
                >
                  <div className="ap-card-top">
                    <h2 className="ap-card-titulo">{apunte.titulo}</h2>
                    <div className="ap-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="ap-icon-btn"
                        onClick={() => abrirEdicion(apunte)}
                        aria-label={`Editar apunte: ${apunte.titulo}`}
                        title="Editar"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="ap-icon-btn ap-icon-btn--danger"
                        onClick={() => setAEliminar(apunte)}
                        aria-label={`Eliminar apunte: ${apunte.titulo}`}
                        title="Eliminar"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {apunte.contenido && (
                    <p className="ap-card-contenido">{apunte.contenido}</p>
                  )}

                  <span className="ap-card-fecha">
                    Editado el {formatFecha(apunte.fecha_actualizacion)}
                  </span>
                </article>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>

      {/* ── Editor (crear / editar) ── */}
      <Modal
        open={editorAbierto}
        onClose={guardando ? () => {} : () => setEditorAbierto(false)}
        size="md"
        labelledBy="ap-editor-title"
      >
        <div className="com-form-header ecm-header">
          <div className="com-form-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div>
            <span id="ap-editor-title" className="com-form-title">
              {editando ? 'Editar apunte' : 'Nuevo apunte'}
            </span>
            <span className="com-form-sub">Solo vos podés ver tus apuntes</span>
          </div>
          <button
            type="button"
            className="ecm-close"
            onClick={() => setEditorAbierto(false)}
            disabled={guardando}
            aria-label="Cerrar sin guardar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={guardar} className="ap-editor">
          <div className="ap-editor-body">
            {formError && <div className="com-form-error">{formError}</div>}

            <div className="form-field">
              <label htmlFor="ap-titulo">Título</label>
              <input
                id="ap-titulo"
                type="text"
                placeholder="Ej: Resumen de fotosíntesis"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                disabled={guardando}
                autoFocus
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="ap-contenido">
                Contenido
                <span className="com-field-optional">opcional</span>
              </label>
              <textarea
                id="ap-contenido"
                className="com-textarea ap-editor-textarea"
                placeholder="Escribí acá tus notas, ideas o recordatorios…"
                value={form.contenido}
                onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                disabled={guardando}
                rows={8}
              />
            </div>

            <div className="form-field">
              <label id="ap-color-label">Color de la nota</label>
              <div className="ap-colores" role="radiogroup" aria-labelledby="ap-color-label">
                {COLORES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className={`ap-color ap-color--${c.key}${form.color === c.key ? ' ap-color--active' : ''}`}
                    onClick={() => setForm({ ...form, color: c.key })}
                    disabled={guardando}
                    role="radio"
                    aria-checked={form.color === c.key}
                    aria-label={c.label}
                    title={c.label}
                  >
                    {form.color === c.key && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="ecm-footer">
            <div className="ecm-footer-actions">
              <button
                type="button"
                className="ecm-btn ecm-btn--ghost"
                onClick={() => setEditorAbierto(false)}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button type="submit" className="ecm-btn ecm-btn--primary" disabled={guardando}>
                {guardando && <span className="ecm-btn-spinner" aria-hidden="true" />}
                {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear apunte'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Confirmación de eliminación ── */}
      <ConfirmDialog
        open={aEliminar !== null}
        danger
        busy={eliminando}
        title="Eliminar apunte"
        message={
          <>
            ¿Estás seguro de que querés eliminar <strong>{aEliminar?.titulo}</strong>?
            Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />
    </>
  );
};

export default Apuntes;
