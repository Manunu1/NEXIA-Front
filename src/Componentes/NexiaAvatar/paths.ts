import type { HairStyle } from '../../Types/perfil';

/* ─────────────────────────────────────────────
   GEOMETRÍA DEL AVATAR — todas las coordenadas
   viven en el lienzo 160 × 240.

   Puntos de referencia (no tocar sin revisar el
   resto): cabeza centrada en (80, 86) con r 46,
   ojos en y 88, cejas en y 75, boca en y 112,
   mentón en y 132, hombros desde y 150.

   Se separa del componente a propósito: dibujar y
   decidir qué dibujar son dos problemas distintos,
   y agregar un peinado nuevo no debería obligar a
   tocar la lógica de render.
───────────────────────────────────────────── */

export const CABEZA = { cx: 80, cy: 86, r: 46 } as const;
export const OJO_IZQ = { cx: 63, cy: 88 } as const;
export const OJO_DER = { cx: 97, cy: 88 } as const;

/** Sonrisa — la fija por diseño: es el rasgo que da identidad al avatar. */
export const SONRISA = 'M 66 108 C 70 119 90 119 94 108';

/* ── Expresiones ───────────────────────────────
   Sólo las usa el compañero del inicio. El resto
   de la app renderiza siempre la cara neutra, así
   el avatar sigue siendo reconocible como "vos".
───────────────────────────────────────────── */

/** Boca abierta y contenta — para felicitar. */
export const SONRISA_ALEGRE = 'M 64 106 C 68 124 92 124 96 106 Z';

/** Ojo cerrado en arco (alegría / guiño). */
export const OJO_FELIZ = (cx: number, cy: number) =>
  `M ${cx - 9} ${cy + 2} C ${cx - 5} ${cy - 8} ${cx + 5} ${cy - 8} ${cx + 9} ${cy + 2}`;

/**
 * 'Pensando' — no cierra los ojos: mueve la mirada y aquieta la boca.
 * Los mismos valores los usa Nexo, así el gesto es el mismo personaje
 * pensando, sea un retrato o la mascota.
 */
export const MIRADA_PENSANDO = { dx: 2.5, dy: -2.5 } as const;

/** Boca corta y quieta — mientras piensa. */
export const BOCA_PENSANDO = 'M 72 110 L 88 110';

/** Cuello + torso. La remera se dibuja con el escote ya recortado. */
export const CUELLO = { x: 67, y: 118, w: 26, h: 40, rx: 12 } as const;

export const REMERA = `
  M 62 150
  C 44 154 28 166 24 186
  L 16 240
  L 144 240
  L 136 186
  C 132 166 116 154 98 150
  C 95 163 88 168 80 168
  C 72 168 65 163 62 150 Z
`;

/** Borde interno del escote — se pinta con un tono más oscuro de la remera. */
export const ESCOTE = 'M 62 150 C 65 163 72 168 80 168 C 88 168 95 163 98 150';

interface Peinado {
  /** Volumen que va DETRÁS de la cabeza (opcional). */
  atras?: string;
  /** Forma principal, por delante de la cara. */
  frente: string;
  /**
   * Círculos que se suman a la silueta para dar textura (rizos).
   * Se pintan con el mismo relleno que `frente`, así se funden sin costura.
   */
  bucles?: { cx: number; cy: number; r: number }[];
}

/**
 * Un peinado = una silueta cerrada. La parte de adelante siempre deja
 * libre la franja de los ojos (y ≥ 80); si un peinado nuevo baja de ahí,
 * va a tapar la cara.
 */
export const PEINADOS: Record<HairStyle, Peinado> = {
  corto: {
    frente: `
      M 80 34
      C 108 34 130 54 130 84
      C 130 90 129 96 128 100
      C 125 100 123 98 123 94
      C 122 78 117 66 109 58
      C 98 66 82 70 64 67
      C 54 65 47 61 43 56
      C 37 65 35 78 35 94
      C 35 98 33 100 30 100
      C 29 96 28 90 28 84
      C 28 54 52 34 80 34 Z
    `,
  },

  medio: {
    atras: `
      M 80 34 C 110 34 132 56 132 90
      C 132 110 131 124 130 134
      L 30 134
      C 29 124 28 110 28 90
      C 28 56 50 34 80 34 Z
    `,
    frente: `
      M 80 32
      C 111 32 133 54 133 88
      C 133 104 132 118 130 130
      C 129 135 122 136 120 131
      C 116 118 115 104 114 92
      C 112 74 100 64 80 64
      C 60 64 48 74 46 92
      C 45 104 44 118 40 131
      C 38 136 31 135 30 130
      C 28 118 27 104 27 88
      C 27 54 49 32 80 32 Z
    `,
  },

  largo: {
    atras: `
      M 80 34 C 112 34 132 58 132 92
      C 132 124 136 160 138 192
      L 22 192
      C 24 160 28 124 28 92
      C 28 58 48 34 80 34 Z
    `,
    frente: `
      M 80 32
      C 112 32 134 56 134 90
      C 134 116 137 148 141 180
      C 143 194 140 204 133 205
      C 127 206 122 199 121 187
      C 118 156 116 124 115 98
      C 113 76 100 64 80 64
      C 60 64 47 76 45 98
      C 44 124 42 156 39 187
      C 38 199 33 206 27 205
      C 20 204 17 194 19 180
      C 23 148 26 116 26 90
      C 26 56 48 32 80 32 Z
    `,
  },

  // El volumen sale de los bucles; el path sólo cierra la base bajo ellos.
  rizado: {
    atras: `
      M 80 32 C 116 32 140 58 140 94
      C 140 116 124 132 102 134
      L 58 134
      C 36 132 20 116 20 94
      C 20 58 44 32 80 32 Z
    `,
    frente: `
      M 32 98
      C 28 60 52 36 80 36
      C 108 36 132 60 128 98
      C 126 78 118 66 108 60
      C 98 68 82 72 64 69
      C 54 67 46 62 42 57
      C 36 67 34 80 32 98 Z
    `,
    bucles: [
      { cx: 33, cy: 76, r: 15 },
      { cx: 44, cy: 54, r: 16 },
      { cx: 64, cy: 41, r: 16 },
      { cx: 92, cy: 40, r: 17 },
      { cx: 114, cy: 52, r: 16 },
      { cx: 127, cy: 76, r: 15 },
      { cx: 31, cy: 95, r: 12 },
      { cx: 129, cy: 95, r: 12 },
    ],
  },

  // Al ras: sigue el cráneo sin volumen y con la línea de nacimiento alta
  // y recta. Es lo que lo distingue del corto, que sí tiene flequillo.
  rapado: {
    frente: `
      M 34 86
      C 34 57 54 40 80 40
      C 106 40 126 57 126 86
      C 124 72 122 66 118 62
      C 108 57 96 55 80 55
      C 64 55 52 57 42 62
      C 38 66 36 72 34 86 Z
    `,
  },
};

/** Cejas — siguen el color del pelo, un poco más oscuras. */
export const CEJAS = {
  izq: 'M 52 76 C 57 71 68 71 73 75',
  der: 'M 87 75 C 92 71 103 71 108 76',
} as const;

/** Nariz — trazo mínimo: sugerirla es más limpio que dibujarla. */
export const NARIZ = 'M 78 94 C 74 101 76 104 81 103';

/* ── Accesorios ────────────────────────────── */

export const PUENTE_REDONDO = 'M 76 85 C 78 82 82 82 84 85';
export const PATILLA_IZQ = 'M 49 84 L 36 80';
export const PATILLA_DER = 'M 111 84 L 124 80';

export const VISERA_GORRA = `
  M 124 56
  C 147 57 157 65 156 72
  C 155 77 148 78 141 76
  C 135 71 130 68 122 67 Z
`;

export const DOMO_GORRA = 'M 33 62 C 33 38 54 24 80 24 C 106 24 127 38 127 62 Z';
export const DOMO_GORRO = 'M 31 62 C 31 38 53 24 80 24 C 107 24 129 38 129 62 Z';

/* Termina por encima de las orejas (y 80): bajando hasta el nivel del oído
   dejaba de leerse como vincha y parecía un par de auriculares. */
export const VINCHA = `
  M 32 80
  C 32 56 53 36 80 36
  C 107 36 128 56 128 80
  L 115 80
  C 115 62 100 49 80 49
  C 60 49 45 62 45 80 Z
`;

/* ── Detalle tech de la remera ─────────────────
   Va en el pecho, bien separado del logo: pegado
   al texto se leía como un error de tipografía y
   no como un guiño de circuito.
───────────────────────────────────────────── */

export const CIRCUITO = {
  nodo1: { cx: 38, cy: 172, r: 3.6 },
  traza: 'M 38 176 L 38 187 L 47 195',
  nodo2: { cx: 47, cy: 195, r: 2.8 },
} as const;
