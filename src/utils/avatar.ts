import type {
  AvatarConfig,
  AvatarSize,
  FondoAvatar,
  GlassesStyle,
  HairStyle,
  HatStyle,
  MarcaRostro,
  VelloFacial,
} from '../Types/perfil';

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
  { value: '#FBE0C8', label: 'Porcelana' },
  { value: '#F5D0B0', label: 'Claro' },
  { value: '#EFC09A', label: 'Beige' },
  { value: '#E3AE85', label: 'Arena' },
  { value: '#DBA478', label: 'Dorado' },
  { value: '#C68A5C', label: 'Miel' },
  { value: '#B87C4F', label: 'Canela' },
  { value: '#9C6640', label: 'Almendra' },
  { value: '#8A5A33', label: 'Cobre' },
  { value: '#6E4526', label: 'Caoba' },
  { value: '#5A3A1F', label: 'Oscuro' },
  { value: '#3F2716', label: 'Ébano' },
];

export const ESTILOS_PELO: Opcion<HairStyle>[] = [
  { value: 'corto', label: 'Corto' },
  { value: 'medio', label: 'Medio' },
  { value: 'largo', label: 'Largo' },
  { value: 'ondulado', label: 'Ondulado' },
  { value: 'bob', label: 'Bob' },
  { value: 'rizado', label: 'Rizado' },
  { value: 'coleta', label: 'Coleta' },
  { value: 'rodete', label: 'Rodete' },
  { value: 'trenzas', label: 'Trenzas' },
  { value: 'rapado', label: 'Rapado' },
];

/** Colores de pelo — naturales primero, fantasía después. */
export const COLORES_PELO: OpcionColor[] = [
  { value: '#1C1A1A', label: 'Negro' },
  { value: '#3A2418', label: 'Castaño oscuro' },
  { value: '#4A2C1A', label: 'Castaño' },
  { value: '#7A4A24', label: 'Castaño claro' },
  { value: '#A9662F', label: 'Caoba' },
  { value: '#D9A441', label: 'Rubio' },
  { value: '#EBD7A6', label: 'Platinado' },
  { value: '#B4462A', label: 'Pelirrojo' },
  { value: '#9AA3B2', label: 'Gris' },
  { value: '#2C6BD1', label: 'Azul' },
  { value: '#3FA795', label: 'Turquesa' },
  { value: '#E5559B', label: 'Rosa' },
  { value: '#8B4FD1', label: 'Violeta' },
  { value: '#6BAF4A', label: 'Verde' },
];

export const COLORES_OJOS: OpcionColor[] = [
  { value: '#6B4423', label: 'Marrón' },
  { value: '#3E2A18', label: 'Marrón oscuro' },
  { value: '#4A80C4', label: 'Azul' },
  { value: '#79B3D9', label: 'Celeste' },
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
  { value: 'gato', label: 'Cat eye' },
  { value: 'aviador', label: 'Aviador' },
  { value: 'sol', label: 'De sol' },
];

export const SOMBREROS: Opcion<HatStyle | null>[] = [
  { value: null, label: 'Ninguno' },
  { value: 'nexia', label: 'Gorro NEXIA' },
  { value: 'gorra', label: 'Gorra' },
  { value: 'beanie', label: 'Gorro de lana' },
  { value: 'vincha', label: 'Vincha' },
  { value: 'auriculares', label: 'Auriculares' },
  { value: 'birrete', label: 'Birrete' },
];

/** Vello facial — null primero, igual que el resto de los accesorios. */
export const VELLOS: Opcion<VelloFacial | null>[] = [
  { value: null, label: 'Ninguno' },
  { value: 'bigote', label: 'Bigote' },
  { value: 'candado', label: 'Candado' },
  { value: 'barba', label: 'Barba' },
];

export const MARCAS: Opcion<MarcaRostro | null>[] = [
  { value: null, label: 'Ninguna' },
  { value: 'pecas', label: 'Pecas' },
  { value: 'lunar', label: 'Lunar' },
];

export const COLORES_REMERA: OpcionColor[] = [
  { value: '#1A237E', label: 'Índigo' },
  { value: '#283593', label: 'Azul' },
  { value: '#3949AB', label: 'Azul claro' },
  { value: '#E0F2F1', label: 'Menta' },
  { value: '#F8F9FC', label: 'Blanco' },
  { value: '#FF9800', label: 'Naranja' },
  { value: '#C62828', label: 'Rojo' },
  { value: '#2E7D32', label: 'Verde' },
  { value: '#6A4FB6', label: 'Violeta' },
  { value: '#0D1654', label: 'Noche' },
];

/**
 * Fondos del retrato. Los colores reales viven en nexiaAvatar.css —acá sólo
 * el catálogo— porque cada fondo necesita su versión clara y su versión
 * oscura, y eso lo resuelve el tema, no la config del usuario.
 */
export const FONDOS: Opcion<FondoAvatar>[] = [
  { value: 'aurora', label: 'Aurora' },
  { value: 'menta', label: 'Menta' },
  { value: 'atardecer', label: 'Atardecer' },
  { value: 'indigo', label: 'Índigo' },
  { value: 'rosa', label: 'Rosa' },
  { value: 'liso', label: 'Liso' },
];

/* ── Tamaños ───────────────────────────────── */

/**
 * Diámetro en px de cada tamaño nombrado. Fuente única: lo consumen
 * NexiaAvatar, NexiaMascota y ProfileImage, y las tres tienen que
 * medir igual o los listados quedan desalineados.
 */
export const TAMANIOS_AVATAR: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 96,
  xl: 220,
};

export const pxAvatar = (size: AvatarSize | number): number =>
  typeof size === 'number' ? size : TAMANIOS_AVATAR[size];

export const AVATAR_POR_DEFECTO: AvatarConfig = {
  skin: '#EFC09A',
  hair: { style: 'corto', color: '#4A2C1A' },
  eyes: '#6B4423',
  accessories: { glasses: null, hat: null },
  shirt_color: '#1A237E',
  facial_hair: null,
  marks: null,
  backdrop: 'aurora',
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

/**
 * Mezcla dos colores. Se usa para derivar rasgos del tono elegido —labios,
 * rubor, vello— sin agregar colores sueltos a la paleta: un labio "rosa fijo"
 * sobre piel oscura se ve pintado, y sobre piel clara, ausente.
 */
export function tenir(hex: string, objetivo: string, t: number): string {
  if (!esHexValido(hex) || !esHexValido(objetivo)) return hex;
  const a = aRgb(hex);
  const b = aRgb(objetivo);
  const k = Math.max(0, Math.min(1, t));
  return `#${aHex(a[0] + (b[0] - a[0]) * k)}${aHex(a[1] + (b[1] - a[1]) * k)}${aHex(a[2] + (b[2] - a[2]) * k)}`;
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
    facial_hair: enLista(c.facial_hair ?? null, VELLOS, null),
    marks: enLista(c.marks ?? null, MARCAS, null),
    backdrop: enLista(c.backdrop, FONDOS, 'aurora'),
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
    facial_hair: Math.random() < 0.25 ? alAzar(VELLOS.slice(1)).value : null,
    marks: Math.random() < 0.3 ? alAzar(MARCAS.slice(1)).value : null,
    backdrop: alAzar(FONDOS).value,
  };
}
