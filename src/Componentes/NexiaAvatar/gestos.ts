import type { AvatarExpresion } from '../../Types/perfil';

/* ─────────────────────────────────────────────
   GESTOS — qué cambia en la cara con cada expresión.

   La expresión NO cambia el rostro: cambia cinco
   variables sobre el mismo rostro. Modelarlo como
   una tabla es lo que permite agregar un gesto sin
   tocar una sola línea de dibujo, y lo que garantiza
   que el avatar siga siendo reconocible como la
   misma persona celebrando, pensando o guiñando.

   Los valores son chicos a propósito: una ceja que
   sube tres unidades sobre un lienzo de 240 es un
   gesto; diez son una caricatura.
───────────────────────────────────────────── */

export interface Gesto {
  ojos: 'abiertos' | 'arco' | 'guino';
  boca: 'sonrisa' | 'abierta' | 'quieta' | 'firme';
  /** Desplazamiento vertical de las cejas, en unidades del lienzo. */
  cejas: number;
  /** Extra sólo para la ceja derecha — la asimetría es lo que da carácter. */
  cejaDer?: number;
  mirada: { dx: number; dy: number };
  rubor: number;
  /** Dispara el salto y las chispas. Sólo un logro lo merece. */
  celebra?: boolean;
}

export const GESTOS: Record<AvatarExpresion, Gesto> = {
  normal: {
    ojos: 'abiertos',
    boca: 'sonrisa',
    cejas: 0,
    mirada: { dx: 0, dy: 0 },
    rubor: 0.13,
  },
  alegre: {
    ojos: 'arco',
    boca: 'abierta',
    cejas: -1.6,
    mirada: { dx: 0, dy: 0 },
    rubor: 0.22,
  },
  guino: {
    ojos: 'guino',
    boca: 'sonrisa',
    cejas: -0.6,
    cejaDer: -1.8,
    mirada: { dx: 0.8, dy: 0 },
    rubor: 0.18,
  },
  pensando: {
    ojos: 'abiertos',
    boca: 'quieta',
    cejas: -1,
    cejaDer: -2.2,
    mirada: { dx: 2.5, dy: -2.5 },
    rubor: 0.1,
  },
  celebrando: {
    ojos: 'abiertos',
    boca: 'abierta',
    cejas: -3,
    mirada: { dx: 0, dy: -1 },
    rubor: 0.26,
    celebra: true,
  },
  concentrado: {
    ojos: 'abiertos',
    boca: 'firme',
    cejas: 1.6,
    mirada: { dx: 0, dy: 1.4 },
    rubor: 0.1,
  },
};
