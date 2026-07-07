/* ─────────────────────────────────────────────
   TEMA POR MATERIA — identidad visual estable.
   Cada materia recibe siempre el mismo gradiente
   (derivado de su nombre), al estilo de los LMS
   líderes: el color ayuda a reconocer la materia
   de un vistazo en todo el campus.
───────────────────────────────────────────── */

export interface MateriaTheme {
  /** Gradiente del banner */
  from: string;
  to: string;
  /** Tinte claro para chips/fondos suaves */
  soft: string;
  /** Color de acento legible sobre fondo claro */
  accent: string;
}

// Familia fría alineada a la marca: variaciones de navy, índigo, azul,
// petróleo y pizarra. Se distinguen por matiz y profundidad sin salirse
// de la identidad visual de la plataforma.
const PALETA: MateriaTheme[] = [
  { from: '#1A237E', to: '#3949AB', soft: '#E8EAF6', accent: '#283593' }, // navy (marca)
  { from: '#283593', to: '#5C6BC0', soft: '#E8EAF6', accent: '#3949AB' }, // índigo claro
  { from: '#0D47A1', to: '#1E88E5', soft: '#E3F2FD', accent: '#1565C0' }, // azul
  { from: '#4527A0', to: '#7E57C2', soft: '#EDE7F6', accent: '#5E35B1' }, // violeta frío
  { from: '#01579B', to: '#0288D1', soft: '#E1F5FE', accent: '#0277BD' }, // celeste profundo
  { from: '#006064', to: '#00838F', soft: '#E0F7FA', accent: '#00838F' }, // petróleo
  { from: '#37474F', to: '#607D8B', soft: '#ECEFF1', accent: '#455A64' }, // pizarra
  { from: '#0D1654', to: '#283593', soft: '#E8EAF6', accent: '#1A237E' }, // navy profundo
];

/** Devuelve el tema estable de una materia a partir de su nombre. */
export function materiaTheme(nombre: string): MateriaTheme {
  let hash = 0;
  const limpio = (nombre || '').trim().toLowerCase();
  for (let i = 0; i < limpio.length; i++) {
    hash = (hash * 31 + limpio.charCodeAt(i)) >>> 0;
  }
  return PALETA[hash % PALETA.length];
}

/** Inicial de la materia para el sello del banner. */
export function materiaInicial(nombre: string): string {
  return (nombre || 'M').trim().charAt(0).toUpperCase();
}
