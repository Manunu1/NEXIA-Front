import React, { useState } from 'react';
import { ETIQUETA_FASE, formatearTiempo } from '../../../hooks/usePomodoro';
import type { usePomodoro } from '../../../hooks/usePomodoro';
import type { Objetivo } from '../../../Types/estudio';
import './pomodoro.css';

/* ─────────────────────────────────────────────
   POMODORO — la pieza central de la zona.

   El reloj es lo único grande de la pantalla: si
   el alumno está por estudiar, todo lo demás es
   secundario. El anillo de progreso reemplaza a
   una barra porque el tiempo de un Pomodoro es
   cíclico, no lineal, y el círculo lo comunica sin
   necesidad de leer el número.

   Los ciclos de la tanda se muestran como puntos y
   no como "3/4": el punto se entiende de un vistazo
   y refuerza que el método es una secuencia.
───────────────────────────────────────────── */

type MotorPomodoro = ReturnType<typeof usePomodoro>;

interface PomodoroProps {
  motor: MotorPomodoro;
  objetivos: Objetivo[];
  /** Cierra la sesión y la registra en el servidor. */
  onTerminarSesion: () => void;
}

const RADIO = 88;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

const Pomodoro: React.FC<PomodoroProps> = ({ motor, objetivos, onTerminarSesion }) => {
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false);

  const {
    fase, corriendo, restante, progreso, ciclosCompletados, minutosEnfoque,
    foco, objetivoId, config, cicloEnTanda, haySesion,
    iniciar, pausar, reiniciarFase, saltear, setFoco, setObjetivoId, setConfig,
  } = motor;

  const pendientes = objetivos.filter((o) => !o.completado);
  const objetivoActivo = objetivos.find((o) => o.id === objetivoId) ?? null;

  return (
    <section className={`pom pom--${fase}`} aria-label="Temporizador Pomodoro">

      <header className="pom-top">
        <span className="pom-fase">
          <span className="pom-fase-punto" aria-hidden="true" />
          {ETIQUETA_FASE[fase]}
        </span>

        <button
          type="button"
          className="pom-ajustes-btn"
          onClick={() => setAjustesAbiertos((v) => !v)}
          aria-expanded={ajustesAbiertos}
          aria-label="Ajustes del temporizador"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      {/* ── Reloj ── */}
      <div className="pom-reloj">
        <svg className="pom-anillo" viewBox="0 0 200 200" aria-hidden="true">
          <circle className="pom-anillo-pista" cx="100" cy="100" r={RADIO} />
          <circle
            className="pom-anillo-avance"
            cx="100" cy="100" r={RADIO}
            strokeDasharray={CIRCUNFERENCIA}
            /* El trazo se consume a medida que avanza la fase. */
            strokeDashoffset={CIRCUNFERENCIA * (1 - progreso)}
          />
        </svg>

        <div className="pom-centro">
          {/* aria-live off: anunciar cada segundo sería insoportable con
              lector de pantalla. El cambio de fase sí se anuncia abajo. */}
          <span className="pom-tiempo" aria-hidden="true">{formatearTiempo(restante)}</span>
          <span className="pom-sr" role="timer" aria-live="off">
            {formatearTiempo(restante)} restantes de {ETIQUETA_FASE[fase]}
          </span>

          <div className="pom-ciclos" aria-label={`Ciclo ${cicloEnTanda} de ${config.ciclosHastaLargo}`}>
            {Array.from({ length: config.ciclosHastaLargo }, (_, i) => (
              <span
                key={i}
                className={`pom-ciclo${i < (ciclosCompletados % config.ciclosHastaLargo) ? ' pom-ciclo--hecho' : ''}${
                  i === (ciclosCompletados % config.ciclosHastaLargo) && fase === 'enfoque' ? ' pom-ciclo--actual' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <p className="pom-anuncio" role="status" aria-live="polite">
        {corriendo ? `${ETIQUETA_FASE[fase]} en curso` : `${ETIQUETA_FASE[fase]} en pausa`}
      </p>

      {/* ── Controles ── */}
      <div className="pom-controles">
        <button
          type="button"
          className="pom-btn pom-btn--fantasma"
          onClick={reiniciarFase}
          aria-label="Reiniciar esta fase"
          title="Reiniciar esta fase"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7" /><polyline points="3 4 3 9 8 9" />
          </svg>
        </button>

        <button
          type="button"
          className="pom-btn pom-btn--principal"
          onClick={corriendo ? pausar : iniciar}
        >
          {corriendo ? (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
              Pausar
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" />
              </svg>
              {restante === 0 ? 'Continuar' : 'Empezar'}
            </>
          )}
        </button>

        <button
          type="button"
          className="pom-btn pom-btn--fantasma"
          onClick={saltear}
          aria-label="Saltear a la fase siguiente"
          title="Saltear (no cuenta como ciclo)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" stroke="none" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      </div>

      {/* ── En qué estás trabajando ── */}
      <div className="pom-foco">
        <label className="pom-foco-label" htmlFor="pom-foco-input">¿En qué estás trabajando?</label>
        <input
          id="pom-foco-input"
          className="pom-foco-input"
          type="text"
          maxLength={200}
          placeholder="Ej: Biología — capítulo 4"
          value={foco}
          onChange={(e) => setFoco(e.target.value)}
        />

        {pendientes.length > 0 && (
          <div className="pom-vincular">
            <span className="pom-vincular-label">Objetivo</span>
            <div className="pom-vincular-chips">
              {/* Vincular el Pomodoro a un objetivo hace que cada ciclo
                  terminado le sume al contador de ese objetivo. */}
              <button
                type="button"
                className={`pom-chip${objetivoId === null ? ' pom-chip--activo' : ''}`}
                onClick={() => setObjetivoId(null)}
              >
                Ninguno
              </button>
              {pendientes.slice(0, 4).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`pom-chip${objetivoId === o.id ? ' pom-chip--activo' : ''}`}
                  onClick={() => setObjetivoId(o.id)}
                  title={o.texto}
                >
                  {o.texto}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Ajustes ── */}
      {ajustesAbiertos && (
        <div className="pom-ajustes">
          <div className="pom-ajustes-grid">
            {([
              ['enfoque', 'Enfoque', 1, 90],
              ['descanso', 'Descanso', 1, 30],
              ['descansoLargo', 'Descanso largo', 5, 60],
              ['ciclosHastaLargo', 'Ciclos hasta el largo', 2, 8],
            ] as const).map(([clave, etiqueta, min, max]) => (
              <div className="pom-ajuste" key={clave}>
                <label className="pom-ajuste-label" htmlFor={`pom-${clave}`}>
                  {etiqueta}
                  <span className="pom-ajuste-unidad">{clave === 'ciclosHastaLargo' ? 'ciclos' : 'min'}</span>
                </label>
                <input
                  id={`pom-${clave}`}
                  className="pom-ajuste-input"
                  type="number"
                  min={min}
                  max={max}
                  value={config[clave]}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v)) setConfig({ [clave]: Math.min(Math.max(v, min), max) });
                  }}
                />
              </div>
            ))}
          </div>

          <div className="pom-ajustes-switches">
            <label className="pom-switch">
              <input
                type="checkbox"
                checked={config.autoContinuar}
                onChange={(e) => setConfig({ autoContinuar: e.target.checked })}
              />
              <span>Encadenar fases automáticamente</span>
            </label>
            <label className="pom-switch">
              <input
                type="checkbox"
                checked={config.sonido}
                onChange={(e) => setConfig({ sonido: e.target.checked })}
              />
              <span>Aviso sonoro al terminar</span>
            </label>
          </div>

          <p className="pom-ajustes-nota">
            El método clásico son 25 minutos de enfoque, 5 de descanso, y uno largo cada 4 ciclos.
          </p>
        </div>
      )}

      {/* ── Cierre de sesión ── */}
      {haySesion && (
        <div className="pom-sesion">
          <div className="pom-sesion-datos">
            <span className="pom-sesion-dato">
              <strong>{ciclosCompletados}</strong> {ciclosCompletados === 1 ? 'ciclo' : 'ciclos'}
            </span>
            <span className="pom-sesion-sep" aria-hidden="true">·</span>
            <span className="pom-sesion-dato">
              <strong>{minutosEnfoque}</strong> min de enfoque
            </span>
            {objetivoActivo && (
              <>
                <span className="pom-sesion-sep" aria-hidden="true">·</span>
                <span className="pom-sesion-dato pom-sesion-objetivo">{objetivoActivo.texto}</span>
              </>
            )}
          </div>
          <button type="button" className="pom-terminar" onClick={onTerminarSesion}>
            Terminar y guardar
          </button>
        </div>
      )}
    </section>
  );
};

export default Pomodoro;
