import React, { useState } from 'react';
import type { Objetivo } from '../../../Types/estudio';
import './objetivos.css';

/* ─────────────────────────────────────────────
   OBJETIVOS DE LA SESIÓN.

   El primer paso del método Pomodoro es "elegís una
   tarea", y sin ese paso el temporizador es sólo un
   reloj. Por eso los objetivos van al lado del
   reloj y no en otra pantalla.

   La estimación en pomodoros es lo que convierte
   una lista de tareas en una planificación: obliga
   a preguntarse cuánto lleva cada cosa antes de
   empezar, que es donde el método hace su trabajo.
───────────────────────────────────────────── */

interface ObjetivosProps {
  objetivos: Objetivo[];
  onCrear: (texto: string, estimados: number) => Promise<void>;
  onAlternar: (objetivo: Objetivo) => void;
  onEliminar: (objetivo: Objetivo) => void;
  onLimpiarCompletados: () => void;
  /** Objetivo al que el Pomodoro le suma sus ciclos. */
  objetivoActivoId: number | null;
}

const Objetivos: React.FC<ObjetivosProps> = ({
  objetivos,
  onCrear,
  onAlternar,
  onEliminar,
  onLimpiarCompletados,
  objetivoActivoId,
}) => {
  const [texto, setTexto] = useState('');
  const [estimados, setEstimados] = useState(1);
  const [creando, setCreando] = useState(false);

  const pendientes = objetivos.filter((o) => !o.completado);
  const completados = objetivos.filter((o) => o.completado);

  const totalEstimado = pendientes.reduce((s, o) => s + o.pomodoros_estimados, 0);
  const totalHecho = objetivos.reduce((s, o) => s + o.pomodoros_hechos, 0);

  const agregar = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = texto.trim();
    if (!limpio || creando) return;

    setCreando(true);
    try {
      await onCrear(limpio, estimados);
      setTexto('');
      setEstimados(1);
    } finally {
      setCreando(false);
    }
  };

  return (
    <section className="obj" aria-label="Objetivos de la sesión">
      <header className="obj-top">
        <h2 className="obj-titulo">Objetivos</h2>
        {pendientes.length > 0 && (
          <span className="obj-resumen">
            {totalEstimado} {totalEstimado === 1 ? 'pomodoro' : 'pomodoros'} estimados
          </span>
        )}
      </header>

      <form className="obj-form" onSubmit={agregar}>
        <input
          className="obj-input"
          type="text"
          maxLength={300}
          placeholder="¿Qué querés lograr hoy?"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          aria-label="Nuevo objetivo"
        />

        <div className="obj-form-fin">
          <label className="obj-est">
            <span className="obj-est-label" title="Pomodoros estimados">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M9 2h6" />
              </svg>
              <span className="obj-sr">Pomodoros estimados</span>
            </span>
            <input
              className="obj-est-input"
              type="number"
              min={1}
              max={20}
              value={estimados}
              onChange={(e) => setEstimados(Math.min(Math.max(Number(e.target.value) || 1, 1), 20))}
              aria-label="Pomodoros estimados"
            />
          </label>

          <button type="submit" className="obj-agregar" disabled={!texto.trim() || creando}>
            Agregar
          </button>
        </div>
      </form>

      {objetivos.length === 0 ? (
        <p className="obj-vacio">
          Todavía no anotaste ningún objetivo. Empezar por acá hace que el temporizador
          tenga a dónde ir.
        </p>
      ) : (
        <>
          <ul className="obj-lista">
            {pendientes.map((o) => (
              <li
                key={o.id}
                className={`obj-item${objetivoActivoId === o.id ? ' obj-item--activo' : ''}`}
              >
                <label className="obj-check">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => onAlternar(o)}
                    aria-label={`Marcar como hecho: ${o.texto}`}
                  />
                  <span className="obj-texto">{o.texto}</span>
                </label>

                <span
                  className="obj-progreso"
                  title={`${o.pomodoros_hechos} de ${o.pomodoros_estimados} pomodoros`}
                >
                  {o.pomodoros_hechos}<span className="obj-progreso-sep">/</span>{o.pomodoros_estimados}
                </span>

                <button
                  type="button"
                  className="obj-borrar"
                  onClick={() => onEliminar(o)}
                  aria-label={`Eliminar objetivo: ${o.texto}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>

          {completados.length > 0 && (
            <div className="obj-hechos">
              <div className="obj-hechos-top">
                <span className="obj-hechos-titulo">
                  Hechos ({completados.length})
                </span>
                <button type="button" className="obj-limpiar" onClick={onLimpiarCompletados}>
                  Limpiar
                </button>
              </div>

              <ul className="obj-lista obj-lista--hechos">
                {completados.map((o) => (
                  <li key={o.id} className="obj-item obj-item--hecho">
                    <label className="obj-check">
                      <input
                        type="checkbox"
                        checked
                        onChange={() => onAlternar(o)}
                        aria-label={`Desmarcar: ${o.texto}`}
                      />
                      <span className="obj-texto">{o.texto}</span>
                    </label>
                    <button
                      type="button"
                      className="obj-borrar"
                      onClick={() => onEliminar(o)}
                      aria-label={`Eliminar objetivo: ${o.texto}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {totalHecho > 0 && (
            <p className="obj-pie">
              Llevás <strong>{totalHecho}</strong> {totalHecho === 1 ? 'pomodoro' : 'pomodoros'} sobre estos objetivos.
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default Objetivos;
