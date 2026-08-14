import React, { useCallback, useEffect, useState } from 'react';
import Modal from '../../Modal';
import api from '../../../api';
import { CALIDAD } from '../../../Types/estudio';
import type { TarjetaPendiente } from '../../../Types/estudio';
import './repaso.css';

/* ─────────────────────────────────────────────
   SESIÓN DE REPASO — recuperación activa.

   La tarjeta muestra SOLO la pregunta hasta que el
   alumno decide revelar. Ese momento de esfuerzo,
   antes de ver la respuesta, es la técnica entera:
   si la respuesta estuviera a la vista, esto sería
   releer, que es justamente lo que la recuperación
   activa viene a reemplazar.

   Después de revelar, el alumno califica su propio
   recuerdo. Esa calificación alimenta la agenda de
   repetición espaciada (SM-2, en el backend): las
   que cuestan vuelven mañana, las sabidas se
   espacian semanas.
───────────────────────────────────────────── */

interface RepasoProps {
  /** null = repasar todos los mazos. */
  mazoId: number | null;
  onCerrar: () => void;
  /** Se avisa al terminar para refrescar los contadores. */
  onTerminado: () => void;
}

const OPCIONES = [
  { calidad: CALIDAD.otraVez, etiqueta: 'Otra vez', ayuda: 'No me acordaba', clase: 'otravez', tecla: '1' },
  { calidad: CALIDAD.dificil, etiqueta: 'Difícil', ayuda: 'Me costó', clase: 'dificil', tecla: '2' },
  { calidad: CALIDAD.bien, etiqueta: 'Bien', ayuda: 'Me acordaba', clase: 'bien', tecla: '3' },
  { calidad: CALIDAD.facil, etiqueta: 'Fácil', ayuda: 'Inmediato', clase: 'facil', tecla: '4' },
] as const;

/** Cuándo vuelve la tarjeta, en palabras. */
function proximaVez(dias: number): string {
  if (dias <= 1) return 'mañana';
  if (dias < 7) return `en ${dias} días`;
  if (dias < 30) return `en ${Math.round(dias / 7)} semana${Math.round(dias / 7) === 1 ? '' : 's'}`;
  if (dias < 365) return `en ${Math.round(dias / 30)} ${Math.round(dias / 30) === 1 ? 'mes' : 'meses'}`;
  return 'en un año';
}

const Repaso: React.FC<RepasoProps> = ({ mazoId, onCerrar, onTerminado }) => {
  const [tarjetas, setTarjetas] = useState<TarjetaPendiente[]>([]);
  const [indice, setIndice] = useState(0);
  const [revelada, setRevelada] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [aciertos, setAciertos] = useState(0);
  const [ultimoIntervalo, setUltimoIntervalo] = useState<number | null>(null);

  useEffect(() => {
    let vigente = true;

    const traer = async () => {
      try {
        const url = mazoId ? `/api/mazos/repaso?mazo_id=${mazoId}` : '/api/mazos/repaso';
        const res = await api.get(url);
        if (vigente) setTarjetas(res.data.data || []);
      } catch {
        if (vigente) setError('No se pudieron cargar las tarjetas.');
      } finally {
        if (vigente) setCargando(false);
      }
    };

    traer();
    return () => { vigente = false; };
  }, [mazoId]);

  const actual = tarjetas[indice] ?? null;
  const terminado = !cargando && !error && indice >= tarjetas.length && tarjetas.length > 0;

  const calificar = useCallback(async (calidad: number) => {
    if (!actual || enviando) return;

    setEnviando(true);
    try {
      const res = await api.post(`/api/mazos/tarjetas/${actual.id}/repaso`, { calidad });
      setUltimoIntervalo(res.data.data?.intervalo_dias ?? null);
      if (calidad >= CALIDAD.dificil) setAciertos((a) => a + 1);

      setIndice((i) => i + 1);
      setRevelada(false);
    } catch {
      setError('No se pudo guardar el repaso. Revisá tu conexión.');
    } finally {
      setEnviando(false);
    }
  }, [actual, enviando]);

  /* Atajos de teclado: espacio revela, 1-4 califican. Un repaso son decenas
     de tarjetas seguidas y hacerlo con el mouse lo vuelve tedioso. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!actual) return;

      if (!revelada && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        setRevelada(true);
        return;
      }

      if (revelada) {
        const opcion = OPCIONES.find((o) => o.tecla === e.key);
        if (opcion) {
          e.preventDefault();
          calificar(opcion.calidad);
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actual, revelada, calificar]);

  const cerrarYRefrescar = () => {
    onTerminado();
    onCerrar();
  };

  return (
    <Modal open onClose={cerrarYRefrescar} size="lg" labelledBy="rep-titulo">
      <div className="rep">

        <header className="rep-top">
          <div className="rep-top-info">
            <span id="rep-titulo" className="rep-titulo">Repaso</span>
            {!cargando && tarjetas.length > 0 && !terminado && (
              <span className="rep-contador">
                {Math.min(indice + 1, tarjetas.length)} de {tarjetas.length}
              </span>
            )}
          </div>
          <button type="button" className="rep-cerrar" onClick={cerrarYRefrescar} aria-label="Cerrar repaso">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {tarjetas.length > 0 && !terminado && (
          <div className="rep-barra" role="progressbar" aria-valuemin={0} aria-valuemax={tarjetas.length} aria-valuenow={indice}>
            <div className="rep-barra-avance" style={{ width: `${(indice / tarjetas.length) * 100}%` }} />
          </div>
        )}

        <div className="rep-cuerpo">
          {cargando ? (
            <div className="nexia-status-container">
              <div className="nexia-loading-spinner" />
              <p>Buscando tus tarjetas…</p>
            </div>
          ) : error ? (
            <div className="alert-error" role="alert">{error}</div>
          ) : tarjetas.length === 0 ? (
            <div className="rep-final">
              <div className="rep-final-icono rep-final-icono--ok" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="rep-final-titulo">No hay nada para repasar</h3>
              <p className="rep-final-texto">
                Ya repasaste todo lo que tocaba hoy. La repetición espaciada funciona
                justamente así: si volvieras ahora, sería demasiado pronto para que sirva.
              </p>
              <button type="button" className="rep-btn-final" onClick={cerrarYRefrescar}>Volver</button>
            </div>
          ) : terminado ? (
            <div className="rep-final">
              <div className="rep-final-icono" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <h3 className="rep-final-titulo">Repaso terminado</h3>
              <p className="rep-final-texto">
                Repasaste <strong>{tarjetas.length}</strong> {tarjetas.length === 1 ? 'tarjeta' : 'tarjetas'} y
                recordaste <strong>{aciertos}</strong>. Cada una ya tiene agendada su próxima vuelta.
              </p>
              <button type="button" className="rep-btn-final" onClick={cerrarYRefrescar}>Listo</button>
            </div>
          ) : actual ? (
            <>
              <span className="rep-mazo">{actual.mazo_nombre}</span>

              <div className={`rep-tarjeta${revelada ? ' rep-tarjeta--revelada' : ''}`}>
                <div className="rep-cara rep-cara--frente">
                  <span className="rep-cara-rotulo">Pregunta</span>
                  <p className="rep-cara-texto">{actual.frente}</p>
                </div>

                {revelada && (
                  <div className="rep-cara rep-cara--reverso">
                    <span className="rep-cara-rotulo">Respuesta</span>
                    <p className="rep-cara-texto">{actual.reverso}</p>
                  </div>
                )}
              </div>

              {!revelada ? (
                <div className="rep-acciones">
                  <p className="rep-consigna">
                    Intentá responder de memoria antes de mirar. Ese esfuerzo es lo que fija el recuerdo.
                  </p>
                  <button type="button" className="rep-revelar" onClick={() => setRevelada(true)}>
                    Mostrar respuesta
                    <kbd className="rep-kbd">espacio</kbd>
                  </button>
                </div>
              ) : (
                <div className="rep-acciones">
                  <p className="rep-consigna">¿Cómo te fue?</p>
                  <div className="rep-calificar">
                    {OPCIONES.map((o) => (
                      <button
                        key={o.calidad}
                        type="button"
                        className={`rep-cal rep-cal--${o.clase}`}
                        onClick={() => calificar(o.calidad)}
                        disabled={enviando}
                      >
                        <span className="rep-cal-etiqueta">{o.etiqueta}</span>
                        <span className="rep-cal-ayuda">{o.ayuda}</span>
                        <kbd className="rep-kbd rep-kbd--chico">{o.tecla}</kbd>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {ultimoIntervalo !== null && (
                <p className="rep-ultimo" role="status">
                  La anterior vuelve {proximaVez(ultimoIntervalo)}.
                </p>
              )}
            </>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

export default Repaso;
