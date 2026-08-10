/* ─────────────────────────────────────────────
   GEOMETRÍA DE NEXO — la mascota de NEXIA.

   Vive en el MISMO lienzo 160 × 240 y sobre los
   MISMOS puntos de referencia que el retrato del
   usuario (ver NexiaAvatar/paths.ts):

     cabeza centrada en (80, 86)
     ojos en y 88, cx 63 / 97
     boca en y ~108
     mentón en y 132
     hombros desde y 150

   Eso es lo que permite que un avatar humano y Nexo
   sean intercambiables en cualquier encuadre sin
   tocar una sola línea de layout. Si algo de esto
   se mueve, hay que moverlo en los dos archivos.

   El cuello, el torso, el escote y el circuito NO se
   redibujan: se importan del retrato. Nexo lleva la
   misma remera que todos.
───────────────────────────────────────────── */

/** Cabeza — squircle. Ocupa el mismo bounding box que el círculo r 46. */
export const CABEZA = { x: 30, y: 40, w: 100, h: 92, rx: 34 } as const;

/**
 * Visor — la "cara". Un plano claro dentro de la cabeza navy: a 28 px es
 * lo único que se distingue, y es lo que hace legible la expresión.
 */
export const VISOR = { x: 40, y: 60, w: 80, h: 58, rx: 26 } as const;

export const OJO_IZQ = { cx: 63, cy: 88 } as const;
export const OJO_DER = { cx: 97, cy: 88 } as const;
export const OJO_R = 8.5;

/** Ojo cerrado en arco — alegría y guiño. */
export const OJO_ARCO = (cx: number, cy: number) =>
  `M ${cx - 8.5} ${cy + 2.5} C ${cx - 4.5} ${cy - 7} ${cx + 4.5} ${cy - 7} ${cx + 8.5} ${cy + 2.5}`;

/* El desplazamiento de la mirada en 'pensando' es el mismo que el del
   retrato y se importa de NexiaAvatar/paths: es el mismo gesto. */

/** Sonrisa neutra — el rasgo fijo de Nexo, igual que en el retrato. */
export const SONRISA = 'M 69 104 C 73 112 87 112 91 104';

/** Boca abierta y contenta — para felicitar. */
export const SONRISA_ALEGRE = 'M 68 102 C 72 116 88 116 92 102 Z';

/** Boca corta y quieta — mientras piensa. */
export const BOCA_PENSANDO = 'M 74 107 L 86 107';

/**
 * Antena — le da a Nexo una silueta reconocible a cualquier tamaño.
 * Es lo primero que se identifica en una miniatura de 28 px.
 */
export const ANTENA = { tallo: 'M 80 40 L 80 27', nodo: { cx: 80, cy: 22, r: 6 } } as const;

/** Nodos laterales — cierran la silueta a la altura de las orejas. */
export const NODOS_LATERALES = [
  { x: 21, y: 78, w: 10, h: 22, rx: 5 },
  { x: 129, y: 78, w: 10, h: 22, rx: 5 },
] as const;

/** Reflejo del visor — una diagonal tenue que le da materialidad al vidrio. */
export const BRILLO_VISOR = 'M 48 112 L 66 64 L 78 64 L 60 112 Z';
