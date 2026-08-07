import React, { useMemo, useState } from 'react';
import ProfileImage from '../ProfileImage';
import type { AvatarExpresion } from '../NexiaAvatar';
import { useSesionUsuario } from '../../hooks/useSesionUsuario';
import type { MensajeBuddy, TonoBuddy } from '../../utils/buddy';
import './nexiaBuddy.css';

/* ─────────────────────────────────────────────
   COMPAÑERO NEXIA — tu propio avatar en el inicio,
   diciéndote algo que se ganó con tus datos.

   Deliberadamente NO es un mascota flotante que
   interrumpe: vive en el rail, no tapa nada y no
   aparece solo. El usuario decide cuándo escuchar
   otra cosa, tocándolo.

   Los mensajes los calcula quien lo monta (ver
   utils/buddy.ts); acá sólo se muestran.
───────────────────────────────────────────── */

/** La cara acompaña el tono: felicitar con cara neutra no felicita. */
const EXPRESION_POR_TONO: Record<TonoBuddy, AvatarExpresion> = {
  logro: 'alegre',
  animo: 'normal',
  alerta: 'normal',
  tip: 'normal',
  saludo: 'guino',
};

const trazo = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const ICONO_POR_TONO: Record<TonoBuddy, React.ReactNode> = {
  logro: (
    <svg viewBox="0 0 24 24" {...trazo}>
      <path d="M8 21h8M12 17v4M17 4h3v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V4h3" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
    </svg>
  ),
  animo: (
    <svg viewBox="0 0 24 24" {...trazo}>
      <path d="M13 2 4.5 13H11l-1 9 8.5-11H12z" />
    </svg>
  ),
  alerta: (
    <svg viewBox="0 0 24 24" {...trazo}>
      <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16v.5" />
    </svg>
  ),
  tip: (
    <svg viewBox="0 0 24 24" {...trazo}>
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10.5V16H8v-2.5A6 6 0 0 1 12 3z" />
    </svg>
  ),
  saludo: (
    <svg viewBox="0 0 24 24" {...trazo}>
      <path d="M18 11V6.5a1.5 1.5 0 0 0-3 0V11M15 10V4.5a1.5 1.5 0 0 0-3 0V10M12 10V5.5a1.5 1.5 0 0 0-3 0V13" />
      <path d="M9 12.5 7.5 11a1.6 1.6 0 0 0-2.3 2.2l3.4 4.6A6 6 0 0 0 18 15v-4" />
    </svg>
  ),
};

interface NexiaBuddyProps {
  /** Ya ordenados por prioridad. Si viene vacío, el componente no se monta. */
  mensajes: MensajeBuddy[];
}

const NexiaBuddy: React.FC<NexiaBuddyProps> = ({ mensajes }) => {
  const usuario = useSesionUsuario();
  const [indice, setIndice] = useState(0);

  // Cambia con cada mensaje: reinicia la animación de entrada de la burbuja.
  const [pulso, setPulso] = useState(0);

  const actual = useMemo(
    () => (mensajes.length ? mensajes[indice % mensajes.length] : null),
    [mensajes, indice]
  );

  if (!actual) return null;

  const siguiente = () => {
    setIndice((i) => i + 1);
    setPulso((p) => p + 1);
  };

  const hayMas = mensajes.length > 1;

  return (
    <section className={`nb nb--${actual.tono}`} aria-label="Tu compañero NEXIA">
      <div className="nb-top">
        <button
          type="button"
          className="nb-avatar"
          onClick={siguiente}
          disabled={!hayMas}
          aria-label={hayMas ? 'Ver otro mensaje' : 'Tu compañero NEXIA'}
          title={hayMas ? 'Tocame para otro mensaje' : undefined}
        >
          {/* key: remonta el avatar en cada cambio para relanzar el rebote */}
          <ProfileImage
            key={pulso}
            usuario={usuario}
            size={46}
            nombre={usuario?.nombre}
            apellido={usuario?.apellido}
            expresion={EXPRESION_POR_TONO[actual.tono]}
            className="nb-avatar-img"
          />
        </button>

        <span className="nb-rotulo">Tu compañero</span>

        <span className="nb-bubble-icon" aria-hidden="true">
          {ICONO_POR_TONO[actual.tono]}
        </span>
      </div>

      {/* La burbuja va a lo ancho: en el rail no entra al lado del avatar
          sin partir el texto en tiras de tres palabras. */}
      <div className="nb-bubble" key={pulso}>
        <p className="nb-texto" aria-live="polite">{actual.texto}</p>
      </div>

      {hayMas && (
        <button type="button" className="nb-otra" onClick={siguiente}>
          Decime otra
          <svg viewBox="0 0 24 24" {...trazo} strokeWidth={2.2} aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />
          </svg>
        </button>
      )}
    </section>
  );
};

export default NexiaBuddy;
