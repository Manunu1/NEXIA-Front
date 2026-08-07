import type { AvatarConfig, GlassesStyle, HairStyle, HatStyle } from '../Types/perfil';

/* ─────────────────────────────────────────────
   AVATAR — catálogo de opciones y utilidades.

   Fuente única de verdad de lo que un usuario puede
   elegir. El editor construye sus controles a partir
   de estas listas y <NexiaAvatar /> las usa para
   sanear cualquier config que llegue del backend,
   así una config vieja o corrupta nunca rompe la UI.
───────────────────────────────────────────── */

export interface Opcion<T> {
  value: T;
  label: string;
}

export interface OpcionColor {
  value: string;
  label: string;
}

/** Tonos de piel — progresión perceptual, de claro a oscuro. */
export const PIELES: OpcionColor[] = [
  { value: '#F5D0B0', label: 'Claro' },
  { value: '#EFC09A', label: 'Beige' },
  { value: '#DBA478', label: 'Dorado' },
  { value: '#B87C4F', label: 'Canela' },
  { value: '#8A5A33', label: 'Cobre' },
  { value: '#5A3A1F', label: 'Oscuro' },
];

export const ESTILOS_PELO: Opcion<HairStyle>[] = [
  { value: 'corto', label: 'Corto' },
  { value: 'medio', label: 'Medio' },
  { value: 'largo', label: 'Largo' },
  { value: 'rizado', label: 'Rizado' },
  { value: 'rapado', label: 'Rapado' },
];

/** Colores de pelo — naturales primero, fantasía después. */
export const COLORES_PELO: OpcionColor[] = [
  { value: '#1C1A1A', label: 'Negro' },
  { value: '#4A2C1A', label: 'Castaño' },
  { value: '#D9A441', label: 'Rubio' },
  { value: '#B4462A', label: 'Pelirrojo' },
  { value: '#9AA3B2', label: 'Gris' },
  { value: '#2C6BD1', label: 'Azul' },
  { value: '#E5559B', label: 'Rosa' },
  { value: '#8B4FD1', label: 'Violeta' },
];

export const COLORES_OJOS: OpcionColor[] = [
  { value: '#6B4423', label: 'Marrón' },
  { value: '#4A80C4', label: 'Azul' },
  { value: '#4C8B5A', label: 'Verde' },
  { value: '#78889B', label: 'Gris' },
  { value: '#A97C3F', label: 'Avellana' },
  { value: '#D08A2C', label: 'Ámbar' },
];

/** null = sin accesorio. Se modela explícitamente para que el editor lo liste. */
export const LENTES: Opcion<GlassesStyle | null>[] = [
  { value: null, label: 'Ninguno' },
  { value: 'redondos', label: 'Redondos' },
  { value: 'cuadrados', label: 'Cuadrados' },
  { value: 'sol', label: 'De sol' },
];

export const SOMBREROS: Opcion<HatStyle | null>[] = [
  { value: null, label: 'Ninguno' },
  { value: 'nexia', label: 'Gorro NEXIA' },
  { value: 'gorra', label: 'Gorra' },
  { value: 'vincha', label: 'Vincha' },
];

export const COLORES_REMERA: OpcionColor[] = [
  { value: '#1A237E', label: 'Índigo' },
  { value: '#E0F2F1', label: 'Menta' },
  { value: '#FF9800', label: 'Naranja' },
];

export const AVATAR_POR_DEFECTO: AvatarConfig = {
  skin: '#EFC09A',
  hair: { style: 'corto', color: '#4A2C1A' },
  eyes: '#6B4423',
  accessories: { glasses: null, hat: null },
  shirt_color: '#1A237E',
};

/* ── Color ─────────────────────────────────── */

const HEX = /^#[0-9a-fA-F]{6}$/;

export const esHexValido = (v: unknown): v is string =>
  typeof v === 'string' && HEX.test(v);

function aRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

const aHex = (n: number) =>
  Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');

/**
 * Mezcla un color hacia negro (factor < 0) o hacia blanco (factor > 0).
 * Se usa para las sombras y luces del avatar: derivarlas del color elegido
 * mantiene la coherencia sin pedirle más decisiones al usuario.
 */
export function mezclar(hex: string, factor: number): string {
  if (!esHexValido(hex)) return hex;
  const [r, g, b] = aRgb(hex);
  const objetivo = factor > 0 ? 255 : 0;
  const t = Math.abs(factor);
  return `#${aHex(r + (objetivo - r) * t)}${aHex(g + (objetivo - g) * t)}${aHex(b + (objetivo - b) * t)}`;
}

/** Luminancia relativa (0 = negro, 1 = blanco). */
export function luminancia(hex: string): number {
  if (!esHexValido(hex)) return 0;
  const [r, g, b] = aRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Relación de contraste WCAG entre dos colores (1 = idénticos, 21 = máximo). */
function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  const [alto, bajo] = la > lb ? [la, lb] : [lb, la];
  return (alto + 0.05) / (bajo + 0.05);
}

/**
 * Elige entre dos colores el que mejor contrasta sobre `fondo`.
 * Se compara el contraste real y no un umbral de luminancia: el naranja de
 * la marca cae justo en el límite, y con umbral terminaba pintando el logo
 * naranja sobre una remera naranja.
 */
export function sobre(fondo: string, claro: string, oscuro: string): string {
  return contraste(fondo, claro) >= contraste(fondo, oscuro) ? claro : oscuro;
}

/* ── Saneado ───────────────────────────────── */

const enLista = <T,>(valor: unknown, opciones: Opcion<T>[], fallback: T): T =>
  opciones.some((o) => o.value === valor) ? (valor as T) : fallback;

const colorValido = (valor: unknown, fallback: string): string =>
  esHexValido(valor) ? valor : fallback;

/**
 * Devuelve siempre una AvatarConfig completa y renderizable.
 * Acepta objetos parciales, JSON crudo del backend o basura: nada de lo
 * que llegue puede dejar el avatar a medio dibujar.
 */
export function normalizarAvatar(entrada: unknown): AvatarConfig {
  let cfg = entrada;
  if (typeof cfg === 'string') {
    try {
      cfg = JSON.parse(cfg);
    } catch {
      return { ...AVATAR_POR_DEFECTO };
    }
  }
  if (!cfg || typeof cfg !== 'object') return { ...AVATAR_POR_DEFECTO };

  const c = cfg as Partial<AvatarConfig>;
  const pelo = (c.hair ?? {}) as Partial<AvatarConfig['hair']>;
  const acc = (c.accessories ?? {}) as Partial<AvatarConfig['accessories']>;

  return {
    skin: colorValido(c.skin, AVATAR_POR_DEFECTO.skin),
    hair: {
      style: enLista(pelo.style, ESTILOS_PELO, AVATAR_POR_DEFECTO.hair.style),
      color: colorValido(pelo.color, AVATAR_POR_DEFECTO.hair.color),
    },
    eyes: colorValido(c.eyes, AVATAR_POR_DEFECTO.eyes),
    accessories: {
      glasses: enLista(acc.glasses ?? null, LENTES, null),
      hat: enLista(acc.hat ?? null, SOMBREROS, null),
    },
    shirt_color: colorValido(c.shirt_color, AVATAR_POR_DEFECTO.shirt_color),
  };
}

/* ── Aleatorio ─────────────────────────────── */

const alAzar = <T,>(lista: T[]): T => lista[Math.floor(Math.random() * lista.length)];

/**
 * Config completamente al azar. Los accesorios se sortean con menos
 * probabilidad que el resto: un avatar con gorro Y lentes siempre puesto
 * deja de sentirse como una elección del usuario.
 */
export function avatarAleatorio(): AvatarConfig {
  return {
    skin: alAzar(PIELES).value,
    hair: {
      style: alAzar(ESTILOS_PELO).value,
      color: alAzar(COLORES_PELO).value,
    },
    eyes: alAzar(COLORES_OJOS).value,
    accessories: {
      glasses: Math.random() < 0.4 ? alAzar(LENTES.slice(1)).value : null,
      hat: Math.random() < 0.3 ? alAzar(SOMBREROS.slice(1)).value : null,
    },
    shirt_color: alAzar(COLORES_REMERA).value,
  };
}
