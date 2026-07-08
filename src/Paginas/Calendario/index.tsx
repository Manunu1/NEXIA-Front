import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../Componentes/Sidebar';
import Footer from '../../Componentes/footer';
import Modal from '../../Componentes/Modal';
import ConfirmDialog from '../../Componentes/ConfirmDialog';
import api from '../../api';
import { getRolActual } from '../../utils/session';
import { usePageTitle } from '../../hooks/usePageTitle';
import './calendario.css';

/* ─────────────────────────────────────────────
   CALENDARIO INSTITUCIONAL
   Todos los roles lo ven; solo el Gestor crea
   y elimina eventos (visibles para todos).
───────────────────────────────────────────── */

type TipoEvento = 'evento' | 'examen' | 'entrega' | 'feriado';

interface Evento {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha: string; // YYYY-MM-DD
  tipo: TipoEvento;
}

const TIPOS: { key: TipoEvento; label: string }[] = [
  { key: 'evento', label: 'Evento' },
  { key: 'examen', label: 'Examen' },
  { key: 'entrega', label: 'Entrega' },
  { key: 'feriado', label: 'Feriado' },
];

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const pad = (n: number) => String(n).padStart(2, '0');
const clave = (anio: number, mes: number, dia: number) => `${anio}-${pad(mes + 1)}-${pad(dia)}`;

function tituloFecha(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  const fecha = new Date(a, m - 1, d);
  const s = `${DIAS_LARGO[fecha.getDay()]} ${d} de ${MESES[m - 1].toLowerCase()}`;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const FORM_VACIO = { titulo: '', descripcion: '', tipo: 'evento' as TipoEvento, fecha: '' };

const Calendario: React.FC = () => {
  usePageTitle('Calendario');
  const esGestor = getRolActual() === 'gestor';

  const [hoy] = useState(() => {
    const d = new Date();
    return { anio: d.getFullYear(), mes: d.getMonth(), iso: clave(d.getFullYear(), d.getMonth(), d.getDate()) };
  });

  const [anio, setAnio] = useState(hoy.anio);
  const [mes, setMes] = useState(hoy.mes);
  const [seleccionado, setSeleccionado] = useState<string>(hoy.iso);

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Alta (gestor)
  const [formAbierto, setFormAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');

  // Baja (gestor)
  const [aEliminar, setAEliminar] = useState<Evento | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    const traer = async () => {
      try {
        const res = await api.get('/api/eventos');
        setEventos(res.data.data || []);
      } catch (err: unknown) {
        const ex = err as { response?: { status?: number } };
        setError(
          !ex.response
            ? 'No se pudo conectar con el servidor.'
            : ex.response.status === 404
              ? 'El servidor todavía no tiene el calendario — reiniciá el backend para aplicar la actualización.'
              : 'No se pudieron cargar los eventos.'
        );
      } finally {
        setLoading(false);
      }
    };
    traer();
  }, []);

  const porFecha = useMemo(() => {
    const mapa = new Map<string, Evento[]>();
    for (const e of eventos) {
      const lista = mapa.get(e.fecha) ?? [];
      lista.push(e);
      mapa.set(e.fecha, lista);
    }
    return mapa;
  }, [eventos]);

  // Celdas del mes (semana empieza lunes); null = celda vacía
  const celdas = useMemo(() => {
    const primerDiaSemana = (new Date(anio, mes, 1).getDay() + 6) % 7;
    const diasDelMes = new Date(anio, mes + 1, 0).getDate();
    const lista: (number | null)[] = Array.from({ length: primerDiaSemana }, () => null);
    for (let d = 1; d <= diasDelMes; d++) lista.push(d);
    return lista;
  }, [anio, mes]);

  const cambiarMes = (delta: number) => {
    const fecha = new Date(anio, mes + delta, 1);
    setAnio(fecha.getFullYear());
    setMes(fecha.getMonth());
  };

  const irAHoy = () => {
    setAnio(hoy.anio);
    setMes(hoy.mes);
    setSeleccionado(hoy.iso);
  };

  const eventosDelDia = porFecha.get(seleccionado) ?? [];
  const proximos = useMemo(
    () => eventos.filter((e) => e.fecha >= hoy.iso).slice(0, 5),
    [eventos, hoy.iso]
  );

  const abrirAlta = () => {
    setForm({ ...FORM_VACIO, fecha: seleccionado });
    setFormError('');
    setFormAbierto(true);
  };

  const guardarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim() || !form.fecha) {
      setFormError('El título y la fecha son obligatorios.');
      return;
    }
    setGuardando(true);
    setFormError('');
    try {
      const res = await api.post('/api/eventos', {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || undefined,
        fecha: form.fecha,
        tipo: form.tipo,
      });
      setEventos((prev) =>
        [...prev, res.data.data].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id - b.id)
      );
      setSeleccionado(form.fecha);
      setFormAbierto(false);
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setFormError(ex.response?.data?.message || 'No se pudo crear el evento.');
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      await api.delete(`/api/eventos/${aEliminar.id}`);
      setEventos((prev) => prev.filter((e) => e.id !== aEliminar.id));
      setAEliminar(null);
    } catch {
      setError('No se pudo eliminar el evento. Intentá nuevamente.');
      setAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const renderEvento = (evento: Evento, conFecha = false) => (
    <li className={`cal-evento cal-evento--${evento.tipo}`} key={evento.id}>
      <div className="cal-evento-info">
        <span className="cal-evento-tipo">{TIPOS.find((t) => t.key === evento.tipo)?.label}</span>
        <span className="cal-evento-titulo">{evento.titulo}</span>
        {conFecha && <span className="cal-evento-fecha">{tituloFecha(evento.fecha)}</span>}
        {evento.descripcion && <span className="cal-evento-desc">{evento.descripcion}</span>}
      </div>
      {esGestor && (
        <button
          type="button"
          className="cal-evento-borrar"
          onClick={() => setAEliminar(evento)}
          aria-label={`Eliminar evento: ${evento.titulo}`}
          title="Eliminar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </button>
      )}
    </li>
  );

  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">

          <div className="page-header">
            <div>
              <h1 className="page-title">Calendario</h1>
              <p className="page-subtitle">
                {esGestor
                  ? 'Fechas y eventos de tu institución — lo que publiques lo ven todos'
                  : 'Fechas de exámenes, entregas y eventos de tu institución'}
              </p>
            </div>
            {esGestor && (
              <button className="ap-new-btn" onClick={abrirAlta}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Nuevo evento
              </button>
            )}
          </div>

          {error && <div className="alert-error">{error}</div>}

          <div className="cal-layout">

            {/* ── Grilla mensual ── */}
            <section className="cal-card" aria-label="Calendario mensual">
              <div className="cal-toolbar">
                <button type="button" className="cal-nav-btn" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <div className="cal-mes-titulo">
                  <strong>{MESES[mes]}</strong> {anio}
                </div>
                <button type="button" className="cal-nav-btn" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button type="button" className="cal-hoy-btn" onClick={irAHoy}>Hoy</button>
              </div>

              <div className="cal-semana">
                {DIAS_SEMANA.map((d) => (
                  <span key={d} className="cal-dia-nombre">{d}</span>
                ))}
              </div>

              {loading ? (
                <div className="sk cal-sk" aria-hidden="true" />
              ) : (
                <div className="cal-grid">
                  {celdas.map((dia, i) => {
                    if (dia === null) return <span key={`v-${i}`} className="cal-celda cal-celda--vacia" />;
                    const iso = clave(anio, mes, dia);
                    const delDia = porFecha.get(iso) ?? [];
                    const esHoy = iso === hoy.iso;
                    const activo = iso === seleccionado;
                    return (
                      <button
                        type="button"
                        key={iso}
                        className={`cal-celda${esHoy ? ' cal-celda--hoy' : ''}${activo ? ' cal-celda--activa' : ''}`}
                        onClick={() => setSeleccionado(iso)}
                        aria-label={`${tituloFecha(iso)}${delDia.length ? `, ${delDia.length} ${delDia.length === 1 ? 'evento' : 'eventos'}` : ''}`}
                        aria-pressed={activo}
                      >
                        <span className="cal-celda-num">{dia}</span>
                        {delDia.length > 0 && (
                          <span className="cal-dots" aria-hidden="true">
                            {delDia.slice(0, 3).map((e) => (
                              <span key={e.id} className={`cal-dot cal-dot--${e.tipo}`} />
                            ))}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Referencias de tipo — color + texto, nunca color solo */}
              <div className="cal-leyenda" aria-hidden="true">
                {TIPOS.map((t) => (
                  <span key={t.key} className="cal-leyenda-item">
                    <span className={`cal-dot cal-dot--${t.key}`} /> {t.label}
                  </span>
                ))}
              </div>
            </section>

            {/* ── Panel lateral ── */}
            <aside className="cal-panel">
              <div className="cal-panel-bloque">
                <span className="ql-title">{tituloFecha(seleccionado)}</span>
                {eventosDelDia.length === 0 ? (
                  <p className="cal-sin-eventos">
                    Sin eventos este día.
                    {esGestor && ' Usá "Nuevo evento" para agregar uno.'}
                  </p>
                ) : (
                  <ul className="cal-evento-lista">
                    {eventosDelDia.map((e) => renderEvento(e))}
                  </ul>
                )}
              </div>

              <div className="cal-panel-bloque">
                <span className="ql-title">Próximos eventos</span>
                {proximos.length === 0 ? (
                  <p className="cal-sin-eventos">No hay eventos próximos en el calendario.</p>
                ) : (
                  <ul className="cal-evento-lista">
                    {proximos.map((e) => renderEvento(e, true))}
                  </ul>
                )}
              </div>
            </aside>

          </div>
        </main>
        <Footer />
      </div>

      {/* ── Alta de evento (solo Gestor) ── */}
      <Modal
        open={formAbierto}
        onClose={guardando ? () => {} : () => setFormAbierto(false)}
        size="md"
        labelledBy="cal-form-titulo"
      >
        <div className="com-form-header ecm-header">
          <div className="com-form-header-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <span id="cal-form-titulo" className="com-form-title">Nuevo evento</span>
            <span className="com-form-sub">Visible para todos los usuarios de la institución</span>
          </div>
          <button
            type="button"
            className="ecm-close"
            onClick={() => setFormAbierto(false)}
            disabled={guardando}
            aria-label="Cerrar sin guardar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={guardarEvento} className="ap-editor">
          <div className="ap-editor-body">
            {formError && <div className="com-form-error">{formError}</div>}

            <div className="form-field">
              <label htmlFor="cal-titulo">Título</label>
              <input
                id="cal-titulo"
                type="text"
                placeholder="Ej: Acto por el Día de la Independencia"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                disabled={guardando}
                autoFocus
                required
              />
            </div>

            <div className="gestor-form-row">
              <div className="form-field">
                <label htmlFor="cal-fecha">Fecha</label>
                <input
                  id="cal-fecha"
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  disabled={guardando}
                  required
                />
              </div>

              <div className="form-field">
                <label id="cal-tipo-label">Tipo</label>
                <div className="cal-tipos" role="radiogroup" aria-labelledby="cal-tipo-label">
                  {TIPOS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`cal-tipo-chip cal-tipo-chip--${t.key}${form.tipo === t.key ? ' cal-tipo-chip--activo' : ''}`}
                      onClick={() => setForm({ ...form, tipo: t.key })}
                      disabled={guardando}
                      role="radio"
                      aria-checked={form.tipo === t.key}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="cal-desc">
                Descripción
                <span className="com-field-optional">opcional</span>
              </label>
              <textarea
                id="cal-desc"
                className="com-textarea"
                placeholder="Detalles del evento…"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                disabled={guardando}
                rows={4}
              />
            </div>
          </div>

          <div className="ecm-footer">
            <div className="ecm-footer-actions">
              <button
                type="button"
                className="ecm-btn ecm-btn--ghost"
                onClick={() => setFormAbierto(false)}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button type="submit" className="ecm-btn ecm-btn--primary" disabled={guardando}>
                {guardando && <span className="ecm-btn-spinner" aria-hidden="true" />}
                {guardando ? 'Guardando…' : 'Crear evento'}
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
        title="Eliminar evento"
        message={
          <>
            ¿Estás seguro de que querés eliminar <strong>{aEliminar?.titulo}</strong>?
            Esta acción no se puede deshacer y dejará de verse para toda la institución.
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

export default Calendario;
