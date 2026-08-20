import React from 'react';
import type { AvatarExpresion } from '../../Types/perfil';
import type { TonoBuddy } from '../../utils/buddy';

/* ─────────────────────────────────────────────
   TONO — cómo se ve un mensaje del compañero.

   Vive acá y no en cada presentación porque el
   compañero tiene que ser el MISMO personaje en el
   rail del inicio y al pie de una consigna: si el
   mismo tono felicitara con dos caras distintas,
   dejaría de leerse como una sola voz.
───────────────────────────────────────────── */

/**
 * La cara acompaña el tono: felicitar con cara neutra no felicita.
 *
 * 'logro' celebra de verdad —salta y le brotan chispas— porque es el único
 * momento en que el avatar tiene algo que festejar. Si esa cara apareciera
 * también en un tip, dejaría de significar "lo lograste".
 */
export const EXPRESION_POR_TONO: Record<TonoBuddy, AvatarExpresion> = {
  logro: 'celebrando',
  animo: 'concentrado',
  alerta: 'normal',
  tip: 'pensando',
  saludo: 'guino',
};

export const trazo = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export const ICONO_POR_TONO: Record<TonoBuddy, React.ReactNode> = {
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

/* Los íconos se exportan como nodos y no como componentes a propósito: este
   archivo es una tabla de estilo compartida, y mezclar constantes con
   componentes rompe el fast refresh de todo lo que lo importe. */

/** Flecha de "otra" — compartida por las dos presentaciones. */
export const ICONO_OTRA = (
  <svg viewBox="0 0 24 24" {...trazo} strokeWidth={2.2} aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />
  </svg>
);

/** Flecha de acción — lleva al destino del mensaje. */
export const ICONO_IR = (
  <svg viewBox="0 0 24 24" {...trazo} strokeWidth={2.4} aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
