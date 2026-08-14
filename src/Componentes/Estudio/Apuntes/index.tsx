import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Modal from '../../Modal';
import ConfirmDialog from '../../ConfirmDialog';
import EmptyState from '../../EmptyState';
import api from '../../../api';
import { mensajeDeError } from '../../../utils/apiError';
import type { Apunte, PlantillaApunte } from '../../../Types/estudio';
import './apuntesEstudio.css';

/* ─────────────────────────────────────────────
   APUNTES — libres o con método de estudio.

   Cornell y Feynman no se implementan como
   herramientas separadas porque no lo son: las dos
   son formas de estructurar un apunte. Lo que
   cambia es qué campos se piden y en qué orden, y
   ese orden es la técnica.

   En Cornell el contenido se escribe primero y las
   palabras clave y el resumen se completan DESPUÉS
   de la clase: por eso van abajo en el formulario,
   aunque en la hoja impresa la columna de palabras
   clave esté a la izquierda.

   En Feynman el campo de lagunas es el importante.
   Es el que convierte el ejercicio en estudio: si
   no podés explicar una parte, ahí está lo que
   todavía no entendés.
───────────────────────────────────────────── */

const COLORES = [
  { key: 'blanco', label: 'Blanco' },
  { key: 'arena', label: 'Arena' },
  { key: 'cielo', label: 'Cielo' },
  { key: 'menta', label: 'Menta' },
] as const;

interface DefPlantilla {
  key: PlantillaApunte;
  nombre: string;
  resumen: string;
}

const PLANTILLAS: DefPlantilla[] = [
  { key: 'libre', nombre: 'Libre', resumen: 'Una nota común, sin estructura.' },
  { key: 'cornell', nombre: 'Cornell', resumen: 'Apuntes, palabras clave y un resumen final.' },
  { key: 'feynman', nombre: 'Feynman', resumen: 'Explicalo simple y detectá qué no entendés.' },
];

const FORM_VACIO = {
  titulo: '',
  contenido: '',
  color: 'blanco',
  plantilla: 'libre' as PlantillaApunte,
  palabras_clave: '',
  resumen: '',
  explicacion: '',
  lagunas: '',
};

type FormApunte = typeof FORM_VACIO;

function formatFecha(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

const PanelApuntes: React.FC = () => {
  const [apuntes, setApuntes] = useState<Apunte[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<PlantillaApunte | 'todos'>('todos');

  const [editorAbierto, setEditorAbierto] = useState(false);
  const [editando, setEditando] = useState<Apunte | null>(null);
  const [form, setForm] = useState<FormApunte>(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');

  const [aEliminar, setAEliminar] = useState<Apunte | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    let vigente = true;
    const traer = async () => {
      try {
        const res = await api.get('/api/apuntes');
        if (vigente) setApuntes(res.data.data || []);
      } catch (err) {
        if (vigente) setError(mensajeDeError(err, 'No se pudieron cargar tus apuntes.'));
      } finally {
        if (vigente) setCargando(false);
      }
    };
    traer();
    return () => { vigente = false; };
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return apuntes.filter((a) => {
      if (filtro !== 'todos' && a.plantilla !== filtro) return false;
      if (!q) return true;
      // La búsqueda también entra en las secciones: en un Cornell, lo que
      // uno recuerda suele ser una palabra clave, no el título.
      const enSecciones = Object.values(a.secciones ?? {}).join(' ').toLowerCase();
      return (
        a.titulo.toLowerCase().includes(q) ||
        a.contenido.toLowerCase().includes(q) ||
        enSecciones.includes(q)
      );
    });
  }, [apuntes, busqueda, filtro]);

  const abrirNuevo = useCallback((plantilla: PlantillaApunte = 'libre') => {
    setEditando(null);
    setForm({ ...FORM_VACIO, plantilla });
    setFormError('');
    setEditorAbierto(true);
  }, []);

  const abrirEdicion = (a: Apunte) => {
    setEditando(a);
    setForm({
      titulo: a.titulo,
      contenido: a.contenido,
      color: a.color,
      plantilla: a.plantilla ?? 'libre',
      palabras_clave: a.secciones?.palabras_clave ?? '',
      resumen: a.secciones?.resumen ?? '',
      explicacion: a.secciones?.explicacion ?? '',
      lagunas: a.secciones?.lagunas ?? '',
    });
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
      contenido: form.contenido,
      color: form.color,
      plantilla: form.plantilla,
      secciones:
        form.plantilla === 'cornell'
          ? { palabras_clave: form.palabras_clave, resumen: form.resumen }
          : form.plantilla === 'feynman'
            ? { explicacion: form.explicacion, lagunas: form.lagunas }
            : {},
    };

    try {
      if (editando) {
        const res = await api.put(`/api/apuntes/${editando.id}`, body);
        setApuntes((prev) => prev.map((a) => (a.id === editando.id ? res.data.data : a)));
      } else {
        const res = await api.post('/api/apuntes', body);
        setApuntes((prev) => [res.data.data, ...prev]);
      }
      setEditorAbierto(false);
    } catch (err) {
      setFormError(mensajeDeError(err, 'No se pudo guardar el apunte.'));
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      await api.delete(`/api/apuntes/${aEliminar.id}`);
      setApuntes((prev) => prev.filter((a) => a.id !== aEliminar.id));
      setAEliminar(null);
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo eliminar el apunte.'));
      setAEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  const cambiarPlantilla = (plantilla: PlantillaApunte) => setForm((f) => ({ ...f, plantilla }));

  return (
    <div className="ape">
      <header className="ape-top">
        <div>
          <h2 className="ape-titulo">Apuntes</h2>
          <p className="ape-sub">
            Tus notas, privadas. Podés escribirlas libremente o usar un método que te
            obligue a procesar el tema en vez de copiarlo.
          </p>
        </div>

        <div className="ape-plantillas">
          {PLANTILLAS.map((p) => (
            <button
              key={p.key}
              type="button"
              className="ape-plantilla-btn"
              onClick={() => abrirNuevo(p.key)}
              title={p.resumen}
            >
              <span className="ape-plantilla-nombre">{p.nombre}</span>
              <span className="ape-plantilla-mas" aria-hidden="true">+</span>
            </button>
          ))}
        </div>
      </header>

      {error && <div className="alert-error" role="alert">{error}</div>}

      {apuntes.length > 0 && (
        <div className="ape-filtros">
          <div className="ape-buscar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Buscar en tus apuntes…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar apuntes"
            />
          </div>

          <div className="ape-tipos" role="group" aria-label="Filtrar por método">
            {(['todos', 'libre', 'cornell', 'feynman'] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`ape-tipo${filtro === t ? ' ape-tipo--activo' : ''}`}
                onClick={() => setFiltro(t)}
                aria-pressed={filtro === t}
              >
                {t === 'todos' ? 'Todos' : PLANTILLAS.find((p) => p.key === t)?.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {cargando ? (
        <div className="ape-grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="sk ape-sk" />)}
        </div>
      ) : apuntes.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          }
          title="Todavía no tenés apuntes"
          description="Empezá con una nota libre, o probá el método Cornell para estructurar lo de clase."
          action={<button className="ape-plantilla-btn" onClick={() => abrirNuevo('libre')}>Escribir mi primer apunte</button>}
        />
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          }
          title="Sin resultados"
          description={busqueda ? `Ningún apunte coincide con "${busqueda}".` : 'No tenés apuntes con ese método todavía.'}
        />
      ) : (
        <div className="ape-grid">
          {filtrados.map((a) => (
            <article
              key={a.id}
              className={`ape-card ape-card--${a.color}`}
              onClick={() => abrirEdicion(a)}
            >
              <div className="ape-card-top">
                <h3 className="ape-card-titulo">{a.titulo}</h3>
                <div className="ape-card-acciones" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="ape-icono"
                    onClick={() => abrirEdicion(a)}
                    aria-label={`Editar: ${a.titulo}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="ape-icono ape-icono--danger"
                    onClick={() => setAEliminar(a)}
                    aria-label={`Eliminar: ${a.titulo}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              </div>

              {a.plantilla && a.plantilla !== 'libre' && (
                <span className={`ape-etiqueta ape-etiqueta--${a.plantilla}`}>
                  {PLANTILLAS.find((p) => p.key === a.plantilla)?.nombre}
                </span>
              )}

              {a.contenido && <p className="ape-card-texto">{a.contenido}</p>}

              {/* En un Feynman, las lagunas son lo accionable: es lo que
                  queda por estudiar. Se muestran en la tarjeta. */}
              {a.plantilla === 'feynman' && a.secciones?.lagunas && (
                <p className="ape-card-lagunas">
                  <span>Falta repasar:</span> {a.secciones.lagunas}
                </p>
              )}

              {a.plantilla === 'cornell' && a.secciones?.palabras_clave && (
                <p className="ape-card-claves">{a.secciones.palabras_clave}</p>
              )}

              <span className="ape-card-fecha">{formatFecha(a.fecha_actualizacion)}</span>
            </article>
          ))}
        </div>
      )}

      {/* ── Editor ── */}
      {editorAbierto && (
        <Modal
          open
          onClose={guardando ? () => {} : () => setEditorAbierto(false)}
          size="lg"
          labelledBy="ape-editor-titulo"
        >
          <form className="ape-editor" onSubmit={guardar}>
            <header className="ape-editor-top">
              <span id="ape-editor-titulo" className="ape-editor-titulo">
                {editando ? 'Editar apunte' : 'Nuevo apunte'}
              </span>
              <button
                type="button"
                className="rep-cerrar"
                onClick={() => setEditorAbierto(false)}
                disabled={guardando}
                aria-label="Cerrar sin guardar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <div className="ape-editor-body">
              {formError && <div className="alert-error" role="alert">{formError}</div>}

              <div className="ape-metodo" role="group" aria-label="Método">
                {PLANTILLAS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className={`ape-metodo-btn${form.plantilla === p.key ? ' ape-metodo-btn--activo' : ''}`}
                    onClick={() => cambiarPlantilla(p.key)}
                    disabled={guardando}
                    aria-pressed={form.plantilla === p.key}
                  >
                    <span className="ape-metodo-nombre">{p.nombre}</span>
                    <span className="ape-metodo-desc">{p.resumen}</span>
                  </button>
                ))}
              </div>

              <div className="nx-field">
                <label className="nx-label" htmlFor="ape-titulo">Título</label>
                <input
                  id="ape-titulo"
                  className="nx-control"
                  type="text"
                  maxLength={200}
                  placeholder="Ej: Fotosíntesis — clase del martes"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  disabled={guardando}
                  autoFocus
                  required
                />
              </div>

              <div className="nx-field">
                <label className="nx-label" htmlFor="ape-contenido">
                  {form.plantilla === 'cornell'
                    ? 'Apuntes de clase'
                    : form.plantilla === 'feynman'
                      ? 'Lo que estudiaste'
                      : 'Contenido'}
                </label>
                <textarea
                  id="ape-contenido"
                  className="nx-control ape-textarea"
                  rows={form.plantilla === 'libre' ? 8 : 6}
                  placeholder={
                    form.plantilla === 'cornell'
                      ? 'Anotá acá lo que se dijo en clase, sin filtrar.'
                      : form.plantilla === 'feynman'
                        ? 'El tema tal como lo estudiaste.'
                        : 'Escribí lo que necesites…'
                  }
                  value={form.contenido}
                  onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                  disabled={guardando}
                />
              </div>

              {form.plantilla === 'cornell' && (
                <>
                  <div className="nx-field">
                    <label className="nx-label" htmlFor="ape-claves">Palabras clave</label>
                    <textarea
                      id="ape-claves"
                      className="nx-control ape-textarea"
                      rows={3}
                      placeholder="Las ideas y preguntas que resumen lo de arriba."
                      value={form.palabras_clave}
                      onChange={(e) => setForm({ ...form, palabras_clave: e.target.value })}
                      disabled={guardando}
                    />
                    <p className="nx-hint">Se completan después de la clase, releyendo los apuntes.</p>
                  </div>

                  <div className="nx-field">
                    <label className="nx-label" htmlFor="ape-resumen">Resumen</label>
                    <textarea
                      id="ape-resumen"
                      className="nx-control ape-textarea"
                      rows={3}
                      placeholder="Todo el tema en dos o tres oraciones."
                      value={form.resumen}
                      onChange={(e) => setForm({ ...form, resumen: e.target.value })}
                      disabled={guardando}
                    />
                  </div>
                </>
              )}

              {form.plantilla === 'feynman' && (
                <>
                  <div className="nx-field">
                    <label className="nx-label" htmlFor="ape-explicacion">Explicalo con palabras simples</label>
                    <textarea
                      id="ape-explicacion"
                      className="nx-control ape-textarea"
                      rows={5}
                      placeholder="Como si se lo estuvieras enseñando a alguien que no sabe nada del tema."
                      value={form.explicacion}
                      onChange={(e) => setForm({ ...form, explicacion: e.target.value })}
                      disabled={guardando}
                    />
                    <p className="nx-hint">Si necesitás usar palabras del libro, todavía no lo entendiste del todo.</p>
                  </div>

                  <div className="nx-field">
                    <label className="nx-label" htmlFor="ape-lagunas">¿Qué partes no te salieron?</label>
                    <textarea
                      id="ape-lagunas"
                      className="nx-control ape-textarea"
                      rows={3}
                      placeholder="Lo que no pudiste explicar sin trabarte."
                      value={form.lagunas}
                      onChange={(e) => setForm({ ...form, lagunas: e.target.value })}
                      disabled={guardando}
                    />
                    <p className="nx-hint">Esto es lo que tenés que volver a estudiar. Es el punto del método.</p>
                  </div>
                </>
              )}

              <div className="nx-field">
                <span className="nx-label" id="ape-color-label">Color</span>
                <div className="ape-colores" role="radiogroup" aria-labelledby="ape-color-label">
                  {COLORES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      className={`ape-color ape-color--${c.key}${form.color === c.key ? ' ape-color--activo' : ''}`}
                      onClick={() => setForm({ ...form, color: c.key })}
                      disabled={guardando}
                      role="radio"
                      aria-checked={form.color === c.key}
                      aria-label={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <footer className="ape-editor-footer">
              <button type="button" className="mz-btn mz-btn--ghost" onClick={() => setEditorAbierto(false)} disabled={guardando}>
                Cancelar
              </button>
              <button type="submit" className="mz-btn mz-btn--primary" disabled={guardando}>
                {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear apunte'}
              </button>
            </footer>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={aEliminar !== null}
        danger
        busy={eliminando}
        title="Eliminar apunte"
        message={<>¿Eliminar <strong>{aEliminar?.titulo}</strong>? Esta acción no se puede deshacer.</>}
        confirmLabel="Eliminar"
        onConfirm={confirmarEliminar}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  );
};

export default PanelApuntes;
