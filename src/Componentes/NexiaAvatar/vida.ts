import { useEffect } from 'react';

/* ─────────────────────────────────────────────
   VIDA DEL AVATAR — lo que hace que el retrato
   parezca vivo y no una ilustración pegada.

   Dos piezas, las dos deliberadamente fuera del
   componente de dibujo:

   1. `ritmoDe`  — desincroniza los gestos entre
      instancias. Diez avatares parpadeando en el
      mismo frame no se leen como diez personas: se
      leen como un glitch.

   2. `useMiradaPuntero` — la mirada sigue al cursor.
      Escribe variables CSS directamente sobre el
      nodo, sin estado de React: un pointermove no
      puede costar un re-render.
───────────────────────────────────────────── */

/** Hash estable de una cadena. Mismo uid ⇒ mismo ritmo en cada render. */
function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

export interface Ritmo {
  '--nx-ciclo-parpadeo': string;
  '--nx-retardo-parpadeo': string;
  '--nx-ciclo-respiro': string;
  '--nx-ciclo-vaiven': string;
  '--nx-retardo-vaiven': string;
}

/**
 * Tiempos propios de cada avatar, derivados de su id. Los rangos salen de
 * cómo respira y parpadea una persona: 4–7 s entre parpadeos y ~4 s por
 * ciclo respiratorio. Más rápido que eso se lee como nerviosismo.
 */
export function ritmoDe(uid: string): Ritmo {
  const a = hash(uid);
  const b = hash(`${uid}-b`);

  return {
    '--nx-ciclo-parpadeo': `${(4.6 + a * 2.6).toFixed(2)}s`,
    '--nx-retardo-parpadeo': `${(a * 3.2).toFixed(2)}s`,
    '--nx-ciclo-respiro': `${(3.8 + b * 1.4).toFixed(2)}s`,
    '--nx-ciclo-vaiven': `${(6.5 + b * 3).toFixed(2)}s`,
    '--nx-retardo-vaiven': `${(b * 2).toFixed(2)}s`,
  };
}

/* ── Mirada ────────────────────────────────── */

/** Cuánto se puede desplazar el iris, en unidades del lienzo 160 × 240. */
const RANGO_X = 2.6;
const RANGO_Y = 1.9;
/** La cabeza acompaña apenas: más de 2° deja de ser un gesto y marea. */
const RANGO_ROT = 1.8;

const limitar = (v: number, max: number) => Math.max(-max, Math.min(max, v));

/**
 * Hace que el avatar mire al puntero. Se apaga sola donde no tiene sentido:
 * sin puntero fino (touch) no hay nada que seguir, y con movimiento reducido
 * el gesto sobra.
 */
export function useMiradaPuntero(
  ref: React.RefObject<HTMLElement | null>,
  activo: boolean
): void {
  useEffect(() => {
    const nodo = ref.current;
    if (!activo || !nodo || typeof window === 'undefined') return;

    const fino = window.matchMedia('(hover: hover) and (pointer: fine)');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fino.matches || quieto.matches) return;

    let frame = 0;
    let ultimo: { x: number; y: number } | null = null;

    const aplicar = () => {
      frame = 0;
      if (!ultimo) return;

      const caja = nodo.getBoundingClientRect();
      if (!caja.width || !caja.height) return;

      // El centro de referencia es la cara, no la caja: en encuadre 'full'
      // la cabeza está en el tercio superior y mirar al centro del rectángulo
      // haría que el avatar bizquee hacia su propio torso.
      const cx = caja.left + caja.width / 2;
      const cy = caja.top + caja.height * 0.34;

      // Se normaliza contra ~4 anchos de avatar: a esa distancia la mirada
      // ya está al tope y el seguimiento se siente natural, no elástico.
      const alcance = Math.max(caja.width, 120) * 2;
      const dx = (ultimo.x - cx) / alcance;
      const dy = (ultimo.y - cy) / alcance;

      nodo.style.setProperty('--nx-ojo-x', `${limitar(dx * RANGO_X * 2, RANGO_X).toFixed(2)}px`);
      nodo.style.setProperty('--nx-ojo-y', `${limitar(dy * RANGO_Y * 2, RANGO_Y).toFixed(2)}px`);
      nodo.style.setProperty('--nx-cabeza-rot', `${limitar(dx * RANGO_ROT * 2, RANGO_ROT).toFixed(2)}deg`);
    };

    const onMove = (e: PointerEvent) => {
      ultimo = { x: e.clientX, y: e.clientY };
      if (!frame) frame = requestAnimationFrame(aplicar);
    };

    const alSalir = () => {
      nodo.style.removeProperty('--nx-ojo-x');
      nodo.style.removeProperty('--nx-ojo-y');
      nodo.style.removeProperty('--nx-cabeza-rot');
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', alSalir);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', alSalir);
      if (frame) cancelAnimationFrame(frame);
      alSalir();
    };
  }, [ref, activo]);
}
