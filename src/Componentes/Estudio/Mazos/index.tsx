import React, { useCallback, useEffect, useState } from 'react';
import Modal from '../../Modal';
import ConfirmDialog from '../../ConfirmDialog';
import EmptyState from '../../EmptyState';
import Repaso from '../Repaso';
import api from '../../../api';
import { mensajeDeError } from '../../../utils/apiError';
import type { Mazo, Tarjeta } from '../../../Types/estudio';
import './mazos.css';

/* ─────────────────────────────────────────────
   MAZOS DE TARJETAS.

   Un mazo por tema. Lo que la tarjeta del mazo
   comunica no es cuántas tarjetas tiene, sino
   cuántas TOCAN HOY: en repetición espaciada, el
   total es una curiosidad y lo accionable es lo
   que vence.
───────────────────────────────────────────── */

const COLORES = ['navy', 'naranja', 'verde', 'violeta'] as const;

interface PanelMazosProps {
  /** Avisa al hub para que refresque los contadores del resumen. */
  onCambio: () => void;
}

const PanelMazos: React.FC<PanelMazosProps> = ({ onCambio }) => {
  const [mazos, setMazos] = useState<Mazo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Mazo | null>(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', color: 'navy' });
  const [guardando, setGuardando] = useState(false);

  const [aEliminar, setAEliminar] = useState<Mazo | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const [abierto, setAbierto] = useState<Mazo | null>(null);
  const [repasando, setRepasando] = useState<{ mazoId: number | null } | null>(null);

  /* `cargar` se usa también al volver del repaso y del detalle, así que
     queda como callback; el efecto sólo la dispara una vez al montar. */
  const cargar = useCallback(async () => {
    try {
      const res = await api.get('/api/mazos');
      setMazos(res.data.data || []);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudieron cargar tus mazos.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const res = await api.get('/api/mazos');
        if (vigente) setMazos(res.data.data || []);
      } catch (err) {
        if (vigente) setError(mensajeDeError(err, 'No se pudieron cargar tus mazos.'));
      } finally {
        if (vigente) setCargando(false);
      }
    })();
    return () => { vigente = false; };
  }, []);

  const totalPendientes = mazos.reduce((s, m) => s + m.pendientes, 0);

  const abrirNuevo = () => {
    setEditando(null);
    setForm({ nombre: '', descripcion: '', color: 'navy' });
    setFormAbierto(true);
  };

  const abrirEdicion = (mazo: Mazo) => {
    setEditando(mazo);
    setForm({ nombre: mazo.nombre, descripcion: mazo.descripcion, color: mazo.color });
    setFormAbierto(true);
  };

  const guardarMazo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return;

    setGuardando(true);
    setError('');
    try {
      if (editando) {
        const res = await api.put(`/api/mazos/${editando.id}`, form);
        setMazos((prev) => prev.map((m) => (m.id === editando.id ? { ...m, ...res.data.data } : m)));
      } else {
        const res = await api.post('/api/mazos', form);
        setMazos((prev) => [res.data.data, ...prev]);
      }
      setFormAbierto(false);
      onCambio();
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar el mazo.'));
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      await api.delete(`/api/mazos/${aEliminar.id}`);
      setMazos((prev) => prev.filter((m) => m.id !== aEliminar.id));
      setAEliminar(null);
      onCambio();
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo eliminar el mazo.'));
      setAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const trasRepaso = () => {
    cargar();
    onCambio();
  };

  return (
    <div className="mz">
      <header className="mz-top">
        <div>
          <h2 className="mz-titulo">Tarjetas de estudio</h2>
          <p className="mz-sub">
            Recuperación activa con repaso espaciado: cada tarjeta vuelve justo antes
            de que la olvides.
          </p>
        </div>

        <div className="mz-top-acciones">
          {totalPendientes > 0 && (
            <button type="button" className="mz-repasar-todo" onClick={() => setRepasando({ mazoId: null })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><polyline points="21 3 21 8 16 8" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><polyline points="3 21 3 16 8 16" />
              </svg>
              Repasar {totalPendientes}
            </button>
          )}
          <button type="button" className="mz-nuevo" onClick={abrirNuevo}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo mazo
          </button>
        </div>
      </header>

      {error && <div className="alert-error" role="alert">{error}</div>}

      {cargando ? (
        <div className="nexia-status-container">
          <div className="nexia-loading-spinner" />
          <p>Cargando tus mazos…</p>
        </div>
      ) : mazos.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="14" height="14" rx="2" />
              <path d="M8 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
            </svg>
          }
          title="Todavía no tenés mazos"
          description="Una tarjeta con la pregunta de un lado y la respuesta del otro. Ideal para fórmulas, fechas, definiciones y vocabulario."
          action={<button className="mz-nuevo" onClick={abrirNuevo}>Crear mi primer mazo</button>}
        />
      ) : (
        <ul className="mz-grid stagger-in">
          {mazos.map((m) => (
            <li key={m.id} className={`mz-card mz-card--${m.color}`}>
              <button type="button" className="mz-card-abrir" onClick={() => setAbierto(m)}>
                <span className="mz-card-nombre">{m.nombre}</span>
                {m.descripcion && <span className="mz-card-desc">{m.descripcion}</span>}
              </button>

              <div className="mz-card-datos">
                {m.pendientes > 0 ? (
                  <span className="mz-pendientes">
                    {m.pendientes} para hoy
                  </span>
                ) : (
                  <span className="mz-aldia">Al día</span>
                )}
                <span className="mz-total">
                  {m.total_tarjetas} {m.total_tarjetas === 1 ? 'tarjeta' : 'tarjetas'}
                </span>
              </div>

              <div className="mz-card-acciones">
                <button
                  type="button"
                  className="mz-accion mz-accion--principal"
                  onClick={() => setRepasando({ mazoId: m.id })}
                  disabled={m.pendientes === 0}
                  title={m.pendientes === 0 ? 'No hay tarjetas venciendo hoy' : undefined}
                >
                  Repasar
                </button>
                <button type="button" className="mz-accion" onClick={() => setAbierto(m)}>
                  Tarjetas
                </button>
                <button
                  type="button"
                  className="mz-accion mz-accion--icono"
                  onClick={() => abrirEdicion(m)}
                  aria-label={`Editar mazo ${m.nombre}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="mz-accion mz-accion--icono mz-accion--danger"
                  onClick={() => setAEliminar(m)}
                  aria-label={`Eliminar mazo ${m.nombre}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ── Alta / edición de mazo ── */}
      {formAbierto && (
        <Modal open onClose={guardando ? () => {} : () => setFormAbierto(false)} size="sm" labelledBy="mz-form-titulo">
          <form className="mz-form" onSubmit={guardarMazo}>
            <div className="mz-form-header">
              <span id="mz-form-titulo" className="mz-form-titulo">
                {editando ? 'Editar mazo' : 'Nuevo mazo'}
              </span>
            </div>

            <div className="mz-form-body">
              <div className="nx-field">
                <label className="nx-label" htmlFor="mz-nombre">Nombre</label>
                <input
                  id="mz-nombre"
                  className="nx-control"
                  type="text"
                  maxLength={120}
                  placeholder="Ej: Biología — Célula"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  disabled={guardando}
                  autoFocus
                  required
                />
              </div>

              <div className="nx-field">
                <label className="nx-label" htmlFor="mz-desc">
                  Descripción <span className="nx-optional">Opcional</span>
                </label>
                <input
                  id="mz-desc"
                  className="nx-control"
                  type="text"
                  maxLength={200}
                  placeholder="De qué trata este mazo"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  disabled={guardando}
                />
              </div>

              <div className="nx-field">
                <span className="nx-label" id="mz-color-label">Color</span>
                <div className="mz-colores" role="radiogroup" aria-labelledby="mz-color-label">
                  {COLORES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`mz-color mz-color--${c}${form.color === c ? ' mz-color--activo' : ''}`}
                      onClick={() => setForm({ ...form, color: c })}
                      role="radio"
                      aria-checked={form.color === c}
                      aria-label={c}
                      disabled={guardando}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mz-form-footer">
              <button type="button" className="mz-btn mz-btn--ghost" onClick={() => setFormAbierto(false)} disabled={guardando}>
                Cancelar
              </button>
              <button type="submit" className="mz-btn mz-btn--primary" disabled={guardando || !form.nombre.trim()}>
                {guardando ? 'Guardando…' : editando ? 'Guardar' : 'Crear mazo'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Tarjetas del mazo ── */}
      {abierto && (
        <DetalleMazo
          mazo={abierto}
          onCerrar={() => { setAbierto(null); cargar(); onCambio(); }}
        />
      )}

      {/* ── Repaso ── */}
      {repasando && (
        <Repaso
          mazoId={repasando.mazoId}
          onCerrar={() => setRepasando(null)}
          onTerminado={trasRepaso}
        />
      )}

      <ConfirmDialog
        open={aEliminar !== null}
        danger
        busy={eliminando}
        title="Eliminar mazo"
        message={
          <>
            ¿Eliminar <strong>{aEliminar?.nombre}</strong> y sus{' '}
            {aEliminar?.total_tarjetas} tarjetas? Se pierde también el progreso de repaso.
          </>
        }
        confirmLabel="Eliminar"
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   DETALLE DEL MAZO — alta y edición de tarjetas.
───────────────────────────────────────────── */

const DetalleMazo: React.FC<{ mazo: Mazo; onCerrar: () => void }> = ({ mazo, onCerrar }) => {
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [nueva, setNueva] = useState({ frente: '', reverso: '' });
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [edicion, setEdicion] = useState({ frente: '', reverso: '' });

  useEffect(() => {
    let vigente = true;
    const traer = async () => {
      try {
        const res = await api.get(`/api/mazos/${mazo.id}/tarjetas`);
        if (vigente) setTarjetas(res.data.data?.tarjetas || []);
      } catch (err) {
        if (vigente) setError(mensajeDeError(err, 'No se pudieron cargar las tarjetas.'));
      } finally {
        if (vigente) setCargando(false);
      }
    };
    traer();
    return () => { vigente = false; };
  }, [mazo.id]);

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nueva.frente.trim() || !nueva.reverso.trim() || guardando) return;

    setGuardando(true);
    setError('');
    try {
      const res = await api.post(`/api/mazos/${mazo.id}/tarjetas`, {
        frente: nueva.frente.trim(),
        reverso: nueva.reverso.trim(),
      });
      setTarjetas((prev) => [...prev, res.data.data]);
      setNueva({ frente: '', reverso: '' });
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo crear la tarjeta.'));
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async (id: number) => {
    if (!edicion.frente.trim() || !edicion.reverso.trim()) return;
    try {
      const res = await api.put(`/api/mazos/tarjetas/${id}`, {
        frente: edicion.frente.trim(),
        reverso: edicion.reverso.trim(),
      });
      setTarjetas((prev) => prev.map((t) => (t.id === id ? res.data.data : t)));
      setEditandoId(null);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar la tarjeta.'));
    }
  };

  const borrar = async (id: number) => {
    try {
      await api.delete(`/api/mazos/tarjetas/${id}`);
      setTarjetas((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo eliminar la tarjeta.'));
    }
  };

  return (
    <Modal open onClose={onCerrar} size="lg" labelledBy="mz-det-titulo">
      <div className="mzd">
        <header className="mzd-top">
          <div>
            <span id="mz-det-titulo" className="mzd-titulo">{mazo.nombre}</span>
            <span className="mzd-sub">
              {tarjetas.length} {tarjetas.length === 1 ? 'tarjeta' : 'tarjetas'}
            </span>
          </div>
          <button type="button" className="rep-cerrar" onClick={onCerrar} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="mzd-body">
          {error && <div className="alert-error" role="alert">{error}</div>}

          <form className="mzd-alta" onSubmit={agregar}>
            <div className="mzd-alta-campos">
              <div className="nx-field">
                <label className="nx-label" htmlFor="mzd-frente">Pregunta</label>
                <textarea
                  id="mzd-frente"
                  className="nx-control mzd-textarea"
                  rows={2}
                  maxLength={1000}
                  placeholder="¿Cuál es la capital de Francia?"
                  value={nueva.frente}
                  onChange={(e) => setNueva({ ...nueva, frente: e.target.value })}
                  disabled={guardando}
                />
              </div>
              <div className="nx-field">
                <label className="nx-label" htmlFor="mzd-reverso">Respuesta</label>
                <textarea
                  id="mzd-reverso"
                  className="nx-control mzd-textarea"
                  rows={2}
                  maxLength={1000}
                  placeholder="París"
                  value={nueva.reverso}
                  onChange={(e) => setNueva({ ...nueva, reverso: e.target.value })}
                  disabled={guardando}
                />
              </div>
            </div>
            <button
              type="submit"
              className="mz-btn mz-btn--primary mzd-agregar"
              disabled={guardando || !nueva.frente.trim() || !nueva.reverso.trim()}
            >
              {guardando ? 'Agregando…' : 'Agregar tarjeta'}
            </button>
          </form>

          {cargando ? (
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
            </div>
          ) : tarjetas.length === 0 ? (
            <p className="mzd-vacio">
              Este mazo todavía no tiene tarjetas. Agregá la primera con el formulario de arriba.
            </p>
          ) : (
            <ul className="mzd-lista">
              {tarjetas.map((t) => (
                <li key={t.id} className="mzd-item">
                  {editandoId === t.id ? (
                    <div className="mzd-item-edicion">
                      <textarea
                        className="nx-control mzd-textarea"
                        rows={2}
                        value={edicion.frente}
                        onChange={(e) => setEdicion({ ...edicion, frente: e.target.value })}
                        aria-label="Pregunta"
                      />
                      <textarea
                        className="nx-control mzd-textarea"
                        rows={2}
                        value={edicion.reverso}
                        onChange={(e) => setEdicion({ ...edicion, reverso: e.target.value })}
                        aria-label="Respuesta"
                      />
                      <div className="mzd-item-edicion-acciones">
                        <button type="button" className="mz-btn mz-btn--ghost" onClick={() => setEditandoId(null)}>
                          Cancelar
                        </button>
                        <button type="button" className="mz-btn mz-btn--primary" onClick={() => guardarEdicion(t.id)}>
                          Guardar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mzd-item-caras">
                        <p className="mzd-item-frente">{t.frente}</p>
                        <p className="mzd-item-reverso">{t.reverso}</p>
                      </div>

                      <div className="mzd-item-meta">
                        {/* El estado de repaso es lo que distingue una tarjeta
                            estudiada de una que todavía no entró al ciclo. */}
                        {t.repeticiones === 0 ? (
                          <span className="mzd-estado mzd-estado--nueva">Nueva</span>
                        ) : (
                          <span className="mzd-estado" title={`Próximo repaso: ${t.proximo_repaso}`}>
                            cada {t.intervalo_dias} {t.intervalo_dias === 1 ? 'día' : 'días'}
                          </span>
                        )}

                        <button
                          type="button"
                          className="mz-accion mz-accion--icono"
                          onClick={() => { setEditandoId(t.id); setEdicion({ frente: t.frente, reverso: t.reverso }); }}
                          aria-label="Editar tarjeta"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="mz-accion mz-accion--icono mz-accion--danger"
                          onClick={() => borrar(t.id)}
                          aria-label="Eliminar tarjeta"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PanelMazos;
