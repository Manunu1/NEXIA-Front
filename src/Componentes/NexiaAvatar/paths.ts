import type { HairStyle, VelloFacial } from '../../Types/perfil';

/* ─────────────────────────────────────────────
   GEOMETRÍA DEL AVATAR — todas las coordenadas
   viven en el lienzo 160 × 240.

   PROPORCIONES (de acá sale que la cara se lea como
   una persona y no como un muñeco):

   · Óvalo de 88 de ancho por 108 de alto (0,81).
     Un rostro más ancho que eso se lee como caricatura.
   · Los ojos van EXACTAMENTE a media altura del
     cráneo (y 88, entre y 34 y y 142). Es la regla
     clásica del retrato y es lo que más corrige la
     sensación de "cabezón".
   · Un ojo mide ~17 de ancho y entre los dos hay la
     distancia de un tercer ojo (centros en 64 y 96).
   · Base de la nariz a mitad de camino entre ojos y
     mentón; boca un tercio por debajo de esa base.
   · Mandíbula que AFINA: en y 78 la cara mide 88 y en
     y 120 mide 70. Sin ese estrechamiento la cabeza
     es un huevo.

   Los rasgos son deliberadamente chicos y suaves:
   ojos grandes, cejas gruesas y labios marcados es
   la receta exacta del avatar de plantilla.

   Se separa del componente a propósito: dibujar y
   decidir qué dibujar son dos problemas distintos.
───────────────────────────────────────────── */

/** Landmark del cráneo. Lo usan los accesorios para apoyarse. */
export const CABEZA = { cx: 80, cy: 88, r: 44 } as const;

/** Silueta del rostro — óvalo con mandíbula que afina hacia el mentón. */
export const ROSTRO = `
  M 80 34
  C 104 34 123 51 124 78
  C 124.5 90 122.5 100 119 110
  C 115 126 99 142 80 142
  C 61 142 45 126 41 110
  C 37.5 100 35.5 90 36 78
  C 37 51 56 34 80 34 Z
`;

/** Arco de luz del contorno — sólo el lado iluminado (arriba-izquierda). */
export const CONTORNO_LUZ = 'M 42 106 C 36 86 43 58 64 42';

/* ── Orejas ────────────────────────────────────
   Nacen a la altura de los ojos y terminan a la de
   la base de la nariz, como en una cara real.
───────────────────────────────────────────── */

export const OREJA = {
  izq: 'M 40 89 C 34 86.5 30.5 92 32 99 C 33.5 106 38 110 42 108 Z',
  der: 'M 120 89 C 126 86.5 129.5 92 128 99 C 126.5 106 122 110 118 108 Z',
  izqInterior: 'M 37 94 C 34.5 96 35 101.5 38 104',
  derInterior: 'M 123 94 C 125.5 96 125 101.5 122 104',
} as const;

/* ── Ojos ──────────────────────────────────────
   Almendra chica. El ojo grande y redondo es lo que
   hacía leer la cara como sorprendida o infantil.
───────────────────────────────────────────── */

export const OJO_IZQ = { cx: 64, cy: 88 } as const;
export const OJO_DER = { cx: 96, cy: 88 } as const;

/** Radio del iris y de la pupila — compartidos por el render y los lentes. */
export const IRIS_R = 4.9;
export const PUPILA_R = 2.1;

/** Cuánto baja el párpado al cerrarse (lo usa la animación de parpadeo). */
export const PARPADEO_Y = 13;

/** Contorno almendrado del ojo. Sirve de forma y de clip para el iris. */
export const OJO_FORMA = (cx: number, cy: number) =>
  `M ${cx - 8.6} ${cy + 0.4}
   C ${cx - 6.8} ${cy - 6.4} ${cx + 6.8} ${cy - 6.4} ${cx + 8.6} ${cy + 0.4}
   C ${cx + 6.6} ${cy + 5.8} ${cx - 6.6} ${cy + 5.8} ${cx - 8.6} ${cy + 0.4} Z`;

/** Línea del párpado superior. Fina: gruesa se lee como delineador. */
export const OJO_LINEA = (cx: number, cy: number) =>
  `M ${cx - 9} ${cy + 0.2} C ${cx - 7} ${cy - 7.2} ${cx + 7} ${cy - 7.2} ${cx + 9} ${cy + 0.2}`;

/** Párpado inferior — un trazo tenue que da profundidad a la cuenca. */
export const OJO_INFERIOR = (cx: number, cy: number) =>
  `M ${cx - 7} ${cy + 4.8} C ${cx - 3.4} ${cy + 7} ${cx + 3.4} ${cy + 7} ${cx + 7} ${cy + 4.8}`;

/**
 * Párpado que baja al parpadear. Su borde inferior es un arco: en reposo
 * cubre apenas el nacimiento del iris —como un ojo real— y al animarse
 * traslada hacia abajo hasta tapar la almendra entera.
 */
export const OJO_PARPADO = (cx: number, cy: number) =>
  `M ${cx - 9.5} ${cy - 18}
   L ${cx + 9.5} ${cy - 18}
   L ${cx + 9.5} ${cy - 1.6}
   C ${cx + 6} ${cy - 6.6} ${cx - 6} ${cy - 6.6} ${cx - 9.5} ${cy - 1.6} Z`;

/** Borde del párpado — se traza sobre él para que la pestaña baje también. */
export const OJO_PARPADO_BORDE = (cx: number, cy: number) =>
  `M ${cx - 9.5} ${cy - 1.6} C ${cx - 6} ${cy - 6.6} ${cx + 6} ${cy - 6.6} ${cx + 9.5} ${cy - 1.6}`;

/** Pestaña del ángulo externo. `lado` = -1 izquierda, 1 derecha. */
export const OJO_PESTANIA = (cx: number, cy: number, lado: -1 | 1) =>
  `M ${cx + 8.8 * lado} ${cy + 0.2} L ${cx + 12 * lado} ${cy - 2.4}`;

/** Ojo cerrado en arco (alegría / guiño). */
export const OJO_FELIZ = (cx: number, cy: number) =>
  `M ${cx - 7.6} ${cy + 1.8} C ${cx - 4} ${cy - 5.6} ${cx + 4} ${cy - 5.6} ${cx + 7.6} ${cy + 1.8}`;

/**
 * 'Pensando' — no cierra los ojos: mueve la mirada y aquieta la boca.
 * Los mismos valores los usa Nexo, así el gesto es el mismo personaje
 * pensando, sea un retrato o la mascota.
 */
export const MIRADA_PENSANDO = { dx: 2.2, dy: -2.2 } as const;

/* ── Cejas ─────────────────────────────────────
   Rellenas y finas. Una ceja gruesa domina la cara
   entera y convierte cualquier gesto en enojo.
───────────────────────────────────────────── */

export const CEJAS = {
  izq: `M 54.5 76
        C 58 70.6 69 69 75.4 72.6
        C 75 73.8 74.4 74.6 73.6 75.2
        C 68 72.6 60 73.6 56.2 76.8
        C 55.4 77 54.8 76.8 54.5 76 Z`,
  der: `M 105.5 76
        C 102 70.6 91 69 84.6 72.6
        C 85 73.8 85.6 74.6 86.4 75.2
        C 92 72.6 100 73.6 103.8 76.8
        C 104.6 77 105.2 76.8 105.5 76 Z`,
} as const;

/* ── Nariz ─────────────────────────────────────
   No se dibuja: se ilumina. Una sombra al costado
   del tabique, una luz en la punta y la base
   insinuada bastan para que el ojo la complete.
───────────────────────────────────────────── */

export const NARIZ = {
  sombra: 'M 77.5 95 C 75 102 76.4 107 80.6 106.4',
  base: 'M 76.4 106.6 C 78.2 108.4 82 108.4 83.8 106.4',
  luz: { cx: 81, cy: 103, rx: 3.4, ry: 2.6 },
} as const;

/* ── Boca ──────────────────────────────────────
   Chica y a un tercio entre la base de la nariz y
   el mentón. Los labios se insinúan: marcarlos con
   un contorno oscuro se lee como maquillaje.
───────────────────────────────────────────── */

export const BOCA = {
  /**
   * Labios cerrados con una sonrisa contenida — la cara por defecto.
   * Las comisuras quedan POR ENCIMA del centro del labio inferior: ahí está
   * toda la calidez del rostro. Al mismo nivel, la cara se vuelve inexpresiva.
   */
  labios: `M 68.6 117.4
           C 72.4 114.2 76.8 116.2 80 116.2
           C 83.2 116.2 87.6 114.2 91.4 117.4
           C 87.6 123 72.4 123 68.6 117.4 Z`,
  /** Línea de unión entre labios — define la sonrisa sin engordarla. */
  union: 'M 69.8 117.7 C 74 120.4 86 120.4 90.2 117.7',
  /** Boca abierta y contenta — para felicitar. */
  abierta: `M 68.5 115.4
            C 73.5 113.2 86.5 113.2 91.5 115.4
            C 90.6 126.6 69.4 126.6 68.5 115.4 Z`,
  dientes: 'M 70.4 116.2 C 74.6 114.9 85.4 114.9 89.6 116.2 L 88.8 119.6 C 85 120.6 75 120.6 71.2 119.6 Z',
  lengua: { cx: 80, cy: 124, rx: 5.6, ry: 3 },
  /** Boca corta y quieta — mientras piensa. */
  quieta: 'M 73.6 119.4 C 77 117.4 83.4 118.4 86.4 119.6',
  /** Labio apretado — concentración. */
  firme: 'M 72 119.2 C 76 120.8 84 120.8 88 119.2',
} as const;

/** Compatibilidad: la sonrisa trazada de siempre. */
export const SONRISA = 'M 70 116 C 74 123.5 86 123.5 90 116';
export const SONRISA_ALEGRE = BOCA.abierta;
export const BOCA_PENSANDO = 'M 73.5 119 L 86.5 119';

/* ── Mejillas y marcas ─────────────────────── */

export const RUBOR = [
  { cx: 55, cy: 110, rx: 8, ry: 4.6 },
  { cx: 105, cy: 110, rx: 8, ry: 4.6 },
] as const;

/** Sombra de pómulo — sutil, sólo en tamaños grandes. */
export const POMULOS = [
  { cx: 48, cy: 112, rx: 8, ry: 6.5 },
  { cx: 112, cy: 112, rx: 8, ry: 6.5 },
] as const;

export const PECAS = [
  { cx: 62, cy: 104, r: 1.05 },
  { cx: 57.5, cy: 107.5, r: 0.9 },
  { cx: 66, cy: 109, r: 0.85 },
  { cx: 98, cy: 104, r: 1.05 },
  { cx: 102.5, cy: 107.5, r: 0.9 },
  { cx: 94, cy: 109, r: 0.85 },
  { cx: 76, cy: 101, r: 0.8 },
  { cx: 84, cy: 101, r: 0.8 },
] as const;

export const LUNAR = { cx: 94, cy: 112, r: 1.7 } as const;

/* ── Cuello y torso ────────────────────────────
   REMERA, ESCOTE y CUELLO los comparte Nexo: si
   cambian, cambia también la mascota.
───────────────────────────────────────────── */

/* Un cuello angosto bajo una cabeza ancha da el efecto "chupetín". 30 de
   ancho es lo mínimo para que la figura se sostenga visualmente. */
export const CUELLO = { x: 65, y: 122, w: 30, h: 36, rx: 13 } as const;

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

/** Pliegues de la tela — dan caída y peso a la remera. */
export const PLIEGUES = [
  'M 40 178 C 37 196 36 214 37 236',
  'M 120 178 C 123 196 124 214 123 236',
  'M 62 196 C 66 208 70 214 70 226',
] as const;

/** Sombra bajo los hombros y en las mangas. */
export const SOMBRA_HOMBROS = [
  'M 62 150 C 44 154 28 166 24 186 L 30 200 C 36 176 48 162 66 157 Z',
  'M 98 150 C 116 154 132 166 136 186 L 130 200 C 124 176 112 162 94 157 Z',
] as const;

/* ── Peinados ────────────────────────────────── */

interface Peinado {
  /** Volumen que va DETRÁS de la cabeza (opcional). */
  atras?: string;
  /** Forma principal, por delante de la cara. */
  frente: string;
  /**
   * Círculos que se suman a la silueta para dar textura (rizos, trenzas).
   * Se pintan con el mismo relleno que `frente`, así se funden sin costura.
   */
  bucles?: { cx: number; cy: number; r: number }[];
  /** Ataduras: gomitas y cintas. Se pintan un tono más oscuro que el pelo. */
  lazos?: { x: number; y: number; w: number; h: number; rx: number }[];
}

/** Recogido hacia atrás — lo comparten coleta y rodete. */
const RECOGIDO = `
  M 80 30
  C 108 30 128 50 129 82
  C 129 90 128 98 127 104
  C 124 104 122 102 122 98
  C 121 78 114 64 103 58
  C 95 64 88 67 80 67
  C 72 67 65 64 57 58
  C 46 64 39 78 38 98
  C 38 102 36 104 33 104
  C 32 98 31 90 31 82
  C 31 50 52 30 80 30 Z
`;

/**
 * Un peinado = una silueta cerrada. La parte de adelante siempre deja
 * libre la franja de los ojos (y ≥ 80); si un peinado nuevo baja de ahí,
 * va a tapar la cara.
 *
 * Todos se dibujan con el cráneo desplazado hacia arriba (ver PELO_OFFSET):
 * el pelo tiene volumen y apoyado al ras del hueso parece pintado.
 */
export const PEINADOS: Record<HairStyle, Peinado> = {
  corto: {
    frente: `
      M 80 32
      C 106 32 127 52 127 82
      C 127 88 126 94 125 98
      C 122 98 120 96 120 92
      C 119 77 114 66 107 59
      C 97 66 82 70 65 67
      C 55 65 48 61 44 56
      C 39 65 37 77 37 92
      C 37 96 35 98 32 98
      C 31 94 30 88 30 82
      C 30 52 54 32 80 32 Z
    `,
  },

  medio: {
    atras: `
      M 80 32 C 108 32 129 54 129 88
      C 129 108 128 122 127 132
      L 33 132
      C 32 122 31 108 31 88
      C 31 54 52 32 80 32 Z
    `,
    frente: `
      M 80 30
      C 109 30 130 52 130 86
      C 130 102 129 116 127 128
      C 126 133 119 134 117 129
      C 113 116 112 102 111 90
      C 109 73 98 63 80 63
      C 62 63 51 73 49 90
      C 48 102 47 116 43 129
      C 41 134 34 133 33 128
      C 31 116 30 102 30 86
      C 30 52 51 30 80 30 Z
    `,
  },

  largo: {
    atras: `
      M 80 32 C 110 32 130 56 130 90
      C 130 122 134 158 136 190
      L 24 190
      C 26 158 30 122 30 90
      C 30 56 50 32 80 32 Z
    `,
    frente: `
      M 80 30
      C 110 30 131 54 131 88
      C 131 114 134 146 138 178
      C 140 192 137 202 130 203
      C 124 204 119 197 118 185
      C 115 154 113 122 112 96
      C 110 75 98 63 80 63
      C 62 63 50 75 48 96
      C 47 122 45 154 42 185
      C 41 197 36 204 30 203
      C 23 202 20 192 22 178
      C 26 146 29 114 29 88
      C 29 54 50 30 80 30 Z
    `,
  },

  // Melena con ondas: el borde inferior entra y sale en vez de cortar recto.
  ondulado: {
    atras: `
      M 80 32 C 110 32 130 56 130 90
      C 130 116 132 138 134 152
      L 26 152
      C 28 138 30 116 30 90
      C 30 56 50 32 80 32 Z
    `,
    frente: `
      M 80 30
      C 110 30 131 54 131 88
      C 131 106 133 126 136 144
      C 137 151 130 155 126 149
      C 123 144 121 136 119 127
      C 118 135 115 143 111 149
      C 108 153 102 150 103 143
      C 107 126 109 108 108 94
      C 107 75 97 63 80 63
      C 63 63 53 75 52 94
      C 51 108 53 126 57 143
      C 58 150 52 153 49 149
      C 45 143 42 135 41 127
      C 39 136 37 144 34 149
      C 30 155 23 151 24 144
      C 27 126 29 106 29 88
      C 29 54 50 30 80 30 Z
    `,
  },

  // Corte recto a la altura de la mandíbula, con las puntas hacia adentro.
  bob: {
    atras: `
      M 80 32 C 108 32 129 54 129 88
      C 129 112 130 128 131 140
      L 29 140
      C 30 128 31 112 31 88
      C 31 54 52 32 80 32 Z
    `,
    frente: `
      M 80 30
      C 109 30 130 52 130 86
      C 130 104 129 120 127 134
      C 126 141 119 144 113 139
      C 119 129 117 116 115 102
      C 113 81 99 65 80 65
      C 61 65 47 81 45 102
      C 43 116 41 129 47 139
      C 41 144 34 141 33 134
      C 31 120 30 104 30 86
      C 30 52 51 30 80 30 Z
    `,
  },

  // El volumen sale de los bucles; el path sólo cierra la base bajo ellos.
  rizado: {
    atras: `
      M 80 30 C 114 30 136 56 136 92
      C 136 114 121 130 100 132
      L 60 132
      C 39 130 24 114 24 92
      C 24 56 46 30 80 30 Z
    `,
    frente: `
      M 34 96
      C 30 58 54 34 80 34
      C 106 34 130 58 126 96
      C 124 76 116 64 106 58
      C 96 66 82 70 65 67
      C 55 65 47 60 43 55
      C 37 65 36 78 34 96 Z
    `,
    bucles: [
      { cx: 35, cy: 74, r: 14 },
      { cx: 46, cy: 53, r: 15 },
      { cx: 65, cy: 40, r: 15 },
      { cx: 92, cy: 39, r: 16 },
      { cx: 112, cy: 51, r: 15 },
      { cx: 125, cy: 74, r: 14 },
      { cx: 33, cy: 93, r: 11 },
      { cx: 127, cy: 93, r: 11 },
    ],
  },

  coleta: {
    atras: `
      M 116 60
      C 135 62 147 80 146 104
      C 145 128 137 146 127 153
      C 120 158 112 152 116 143
      C 126 124 130 104 124 88
      C 120 77 112 66 116 60 Z
    `,
    frente: RECOGIDO,
    lazos: [{ x: 110, y: 58, w: 16, h: 9.5, rx: 4.5 }],
  },

  rodete: {
    atras: `
      M 80 6
      C 93 6 104 16 104 30
      C 104 44 93 54 80 54
      C 67 54 56 44 56 30
      C 56 16 67 6 80 6 Z
    `,
    frente: RECOGIDO,
    lazos: [{ x: 66, y: 41, w: 28, h: 9.5, rx: 4.5 }],
  },

  trenzas: {
    atras: `
      M 80 32 C 108 32 128 54 128 88
      C 128 104 127 116 126 126
      L 34 126
      C 33 116 32 104 32 88
      C 32 54 52 32 80 32 Z
    `,
    frente: `
      M 80 30
      C 109 30 129 52 129 86
      C 129 96 128 104 127 110
      C 124 110 122 108 122 104
      C 121 84 110 68 95 64
      C 89 72 84 76 80 76
      C 76 76 71 72 65 64
      C 50 68 39 84 38 104
      C 38 108 36 110 33 110
      C 32 104 31 96 31 86
      C 31 52 51 30 80 30 Z
    `,
    bucles: [
      { cx: 37, cy: 112, r: 8 },
      { cx: 35, cy: 123, r: 7.4 },
      { cx: 34, cy: 134, r: 6.6 },
      { cx: 33, cy: 144, r: 5.6 },
      { cx: 123, cy: 112, r: 8 },
      { cx: 125, cy: 123, r: 7.4 },
      { cx: 126, cy: 134, r: 6.6 },
      { cx: 127, cy: 144, r: 5.6 },
    ],
    lazos: [
      { x: 26, y: 148, w: 13, h: 6.5, rx: 3.2 },
      { x: 121, y: 148, w: 13, h: 6.5, rx: 3.2 },
    ],
  },

  // Al ras: sigue el cráneo sin volumen y con la línea de nacimiento alta
  // y recta. Es lo que lo distingue del corto, que sí tiene flequillo.
  rapado: {
    frente: `
      M 36 84
      C 36 55 55 38 80 38
      C 105 38 124 55 124 84
      C 122 70 120 64 116 60
      C 106 55 95 53 80 53
      C 65 53 54 55 44 60
      C 40 64 38 70 36 84 Z
    `,
  },
};

/**
 * Desplazamiento vertical del pelo respecto del cráneo. El pelo tiene
 * espesor: apoyado exactamente sobre el hueso se ve pintado, no puesto.
 */
export const PELO_OFFSET = -3;

/**
 * Mechón suelto que acompaña el movimiento de la cabeza. Sólo lo llevan los
 * peinados con pelo largo por delante: en un rapado, un mechón flotando sería
 * un error de dibujo, no una animación.
 */
export const MECHON: Partial<Record<HairStyle, string>> = {
  medio: 'M 106 61 C 117 69 121 85 119 102 C 115 86 109 73 102 67 Z',
  largo: 'M 106 61 C 119 71 125 91 123 114 C 117 92 109 75 101 67 Z',
  ondulado: 'M 104 61 C 117 71 123 91 120 112 C 115 91 108 75 100 67 Z',
  bob: 'M 104 63 C 115 73 119 89 117 104 C 113 89 106 75 99 69 Z',
  corto: 'M 99 55 C 110 61 116 73 117 86 C 112 75 105 65 95 61 Z',
};

/* ── Vello facial ──────────────────────────────
   Tres piezas que se combinan: media luna sobre la
   mandíbula, mosca en el mentón y bigote.
───────────────────────────────────────────── */

const MANDIBULA = `
  M 38 92
  C 39 112 45 130 56 139
  C 63 144 72 147 80 147
  C 88 147 97 144 104 139
  C 115 130 121 112 122 92
  C 120 108 114 120 105 127
  C 97 133 89 136 80 136
  C 71 136 63 133 55 127
  C 46 120 40 108 38 92 Z
`;

const MENTON = `
  M 69.5 122 C 72.5 130.5 87.5 130.5 90.5 122
  C 93.5 133 88.5 142 80 142
  C 71.5 142 66.5 133 69.5 122 Z
`;

const BIGOTE = `
  M 69.5 111.5
  C 73 108 77.6 109.8 80 111.6
  C 82.4 109.8 87 108 90.5 111.5
  C 88.5 116.4 84 117.8 80 116
  C 76 117.8 71.5 116.4 69.5 111.5 Z
`;

export const VELLO_FACIAL: Record<VelloFacial, string[]> = {
  barba: [MANDIBULA, MENTON, BIGOTE],
  candado: [MENTON, BIGOTE],
  bigote: [BIGOTE],
};

/* ── Lentes ────────────────────────────────────
   Todos apoyan en el mismo eje (y 86) y terminan en
   la sien (x 39 / 121). Un lente que se sale de la
   cara es lo primero que delata un avatar armado
   con piezas sueltas.
───────────────────────────────────────────── */

export const PUENTE_REDONDO = 'M 76.5 85 C 78 82.8 82 82.8 83.5 85';
export const PATILLA_IZQ = 'M 52 85 L 39 81';
export const PATILLA_DER = 'M 108 85 L 121 81';

export const LENTE_REDONDO_R = 11.5;

export const LENTE_CUADRADO = {
  izq: { x: 51.5, y: 77.5, width: 25, height: 19, rx: 5.5 },
  der: { x: 83, y: 77.5, width: 25, height: 19, rx: 5.5 },
  puente: 'M 76.5 85 L 83 85',
} as const;

export const LENTE_SOL = {
  izq: { x: 51, y: 77, width: 27, height: 20, rx: 8 },
  der: { x: 82, y: 77, width: 27, height: 20, rx: 8 },
  puente: 'M 78 84 L 82 84',
  reflejos: ['M 57 93 L 64 82.5', 'M 88 93 L 95 82.5'],
} as const;

export const LENTE_AVIADOR = {
  izq: `M 51 79 C 51 77 52.6 76.2 63 76.2 C 73 76.2 76 77 76 79
        C 76 87 71 95.6 63.5 95.6 C 56 95.6 51 87 51 79 Z`,
  der: `M 109 79 C 109 77 107.4 76.2 97 76.2 C 87 76.2 84 77 84 79
        C 84 87 89 95.6 96.5 95.6 C 104 95.6 109 87 109 79 Z`,
  barra: 'M 50 77.4 L 110 77.4',
  puente: 'M 76 79.6 C 78 78 82 78 84 79.6',
} as const;

export const LENTE_GATO = {
  izq: `M 50 74.5 C 56.5 78 60 76.4 66 76.4 C 74 76.4 78 79.4 78 84
        C 78 90.6 71.6 95.4 64 95.4 C 55.6 95.4 51 89.6 50.4 82.6
        C 50 79.4 50 76.4 50 74.5 Z`,
  der: `M 110 74.5 C 103.5 78 100 76.4 94 76.4 C 86 76.4 82 79.4 82 84
        C 82 90.6 88.4 95.4 96 95.4 C 104.4 95.4 109 89.6 109.6 82.6
        C 110 79.4 110 76.4 110 74.5 Z`,
  puente: 'M 78 83 L 82 83',
} as const;

/* ── Sombreros ─────────────────────────────────
   Apoyan sobre el cráneo (x 36–124) con el mínimo
   de holgura para el pelo. Uno o dos puntos de más
   y el sombrero flota; de menos, aplasta la cabeza.
───────────────────────────────────────────── */

export const VISERA_GORRA = `
  M 120 54
  C 142 55 152 63 151 70
  C 150 75 143 76 136 74
  C 130 69 125 66 118 65 Z
`;

export const DOMO_GORRA = 'M 35 60 C 35 37 55 24 80 24 C 105 24 125 37 125 60 Z';
export const DOMO_GORRO = 'M 33 60 C 33 36 54 23 80 23 C 106 23 127 36 127 60 Z';

export const BANDA_GORRO = { x: 29, y: 53, width: 102, height: 18, rx: 9 } as const;
export const BANDA_GORRA = { x: 32, y: 54, width: 96, height: 13, rx: 6.5 } as const;

/* Termina por encima de las orejas (y 80): bajando hasta el nivel del oído
   dejaba de leerse como vincha y parecía un par de auriculares. */
export const VINCHA = `
  M 36 80
  C 36 56 55 37 80 37
  C 105 37 124 56 124 80
  L 112 80
  C 112 62 98 50 80 50
  C 62 50 48 62 48 80 Z
`;

export const BEANIE = {
  domo: 'M 34 62 C 34 37 55 25 80 25 C 105 25 126 37 126 62 Z',
  puno: { x: 30, y: 56, w: 100, h: 16, rx: 8 },
  pompon: { cx: 80, cy: 22, r: 9 },
  /** Canaleteado de la lana — tres trazos, no una textura completa. */
  costuras: ['M 57 31 C 55 42 55 52 56 62', 'M 80 26 L 80 62', 'M 103 31 C 105 42 105 52 104 62'],
} as const;

/* Auriculares: el gesto de "estoy estudiando". La diadema pasa por encima
   del pelo y las almohadillas caen justo sobre las orejas. */
export const AURICULARES = {
  diadema: 'M 32 94 C 30 58 52 35 80 35 C 108 35 130 58 128 94',
  brillo: 'M 43 66 C 50 51 63 43 78 42',
  copaIzq: { x: 22, y: 84, w: 19, h: 32, rx: 9.5 },
  copaDer: { x: 119, y: 84, w: 19, h: 32, rx: 9.5 },
  almohadaIzq: { cx: 33.5, cy: 100, rx: 5.6, ry: 10.5 },
  almohadaDer: { cx: 126.5, cy: 100, rx: 5.6, ry: 10.5 },
  /* Dentro de la copa, no en su borde: apoyada afuera parecía una mota. */
  luz: { cx: 28, cy: 110, r: 2.2 },
} as const;

export const BIRRETE = {
  base: 'M 46 46 C 46 36 59 30 80 30 C 101 30 114 36 114 46 L 114 56 L 46 56 Z',
  tabla: 'M 80 19 L 136 41 L 80 63 L 24 41 Z',
  boton: { cx: 80, cy: 41, r: 3.2 },
  /* La borla cae hacia adentro: colgando del borde exterior se salía del
     encuadre circular y se leía como una mancha suelta. */
  borla: 'M 135 42 C 137 53 134 63 129 68',
  pompon: { cx: 128, cy: 71, r: 4.2 },
} as const;

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

/* ── Celebración ───────────────────────────────
   Chispas alrededor de la cabeza. Sólo aparecen con
   la expresión 'celebrando': son la recompensa de un
   logro, no un adorno permanente.
───────────────────────────────────────────── */

export const CHISPAS = [
  { cx: 30, cy: 52, r: 3.2, retardo: 0 },
  { cx: 130, cy: 46, r: 3.6, retardo: 0.18 },
  { cx: 46, cy: 26, r: 2.4, retardo: 0.36 },
  { cx: 114, cy: 22, r: 2.8, retardo: 0.52 },
  { cx: 20, cy: 88, r: 2.2, retardo: 0.7 },
  { cx: 140, cy: 82, r: 2.6, retardo: 0.88 },
] as const;

/** Estrella de cuatro puntas — el destello de la celebración. */
export const DESTELLO = (cx: number, cy: number, r: number) =>
  `M ${cx} ${cy - r}
   C ${cx + r * 0.22} ${cy - r * 0.22} ${cx + r * 0.22} ${cy - r * 0.22} ${cx + r} ${cy}
   C ${cx + r * 0.22} ${cy + r * 0.22} ${cx + r * 0.22} ${cy + r * 0.22} ${cx} ${cy + r}
   C ${cx - r * 0.22} ${cy + r * 0.22} ${cx - r * 0.22} ${cy + r * 0.22} ${cx - r} ${cy}
   C ${cx - r * 0.22} ${cy - r * 0.22} ${cx - r * 0.22} ${cy - r * 0.22} ${cx} ${cy - r} Z`;
