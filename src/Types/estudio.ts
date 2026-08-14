/* ─────────────────────────────────────────────
   ZONA DE ESTUDIO — contratos con el backend.
───────────────────────────────────────────── */

/** Fase del ciclo Pomodoro. */
export type FasePomodoro = 'enfoque' | 'descanso' | 'descanso-largo';

export interface ConfigPomodoro {
  enfoque: number;         // minutos
  descanso: number;        // minutos
  descansoLargo: number;   // minutos
  ciclosHastaLargo: number;
  /** Arrancar la fase siguiente sin esperar al alumno. */
  autoContinuar: boolean;
  sonido: boolean;
}

export interface Objetivo {
  id: number;
  texto: string;
  completado: boolean;
  pomodoros_estimados: number;
  pomodoros_hechos: number;
  orden: number;
  fecha_creacion: string;
  fecha_completado: string | null;
}

export interface DiaEstudio {
  dia: string;
  minutos: number;
  ciclos: number;
  sesiones: number;
}

export interface TotalesEstudio {
  minutos_total: number;
  ciclos_total: number;
  sesiones_total: number;
  minutos_hoy: number;
  ciclos_hoy: number;
}

export interface ResumenEstudio {
  por_dia: DiaEstudio[];
  totales: TotalesEstudio;
  racha: number;
  tarjetas_pendientes: number;
  objetivos: Objetivo[];
  mapas_total: number;
}

// ── Flashcards ───────────────────────────────

export interface Mazo {
  id: number;
  nombre: string;
  descripcion: string;
  color: string;
  fecha_creacion: string;
  total_tarjetas: number;
  pendientes: number;
  sin_estudiar: number;
}

export interface Tarjeta {
  id: number;
  frente: string;
  reverso: string;
  repeticiones: number;
  /** NUMERIC en Postgres: el driver lo entrega como string. */
  factor_facilidad: number | string;
  intervalo_dias: number;
  proximo_repaso: string;
  ultimo_repaso?: string | null;
  fecha_creacion?: string;
}

export interface TarjetaPendiente extends Tarjeta {
  mazo_id: number;
  mazo_nombre: string;
  mazo_color: string;
}

/**
 * Cómo le fue al alumno con la tarjeta, en la escala de SM-2.
 * Por debajo de 3 la tarjeta se considera fallada y vuelve al principio.
 */
export const CALIDAD = {
  otraVez: 0,
  dificil: 3,
  bien: 4,
  facil: 5,
} as const;

// ── Mapas conceptuales ───────────────────────

export interface NodoMapa {
  id: string;
  texto: string;
  x: number;
  y: number;
  tipo: 'principal' | 'secundario';
}

export interface ConexionMapa {
  de: string;
  a: string;
  etiqueta: string;
}

export interface GrafoMapa {
  nodos: NodoMapa[];
  conexiones: ConexionMapa[];
}

export interface MapaResumen {
  id: number;
  titulo: string;
  cantidad_nodos: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Mapa extends Omit<MapaResumen, 'cantidad_nodos'> {
  datos: GrafoMapa;
}

// ── Apuntes ──────────────────────────────────

export type PlantillaApunte = 'libre' | 'cornell' | 'feynman';

export interface Apunte {
  id: number;
  titulo: string;
  contenido: string;
  color: string;
  plantilla: PlantillaApunte;
  /** Campos propios de la plantilla; vacío en los apuntes libres. */
  secciones: {
    palabras_clave?: string;
    resumen?: string;
    explicacion?: string;
    lagunas?: string;
  };
  fecha_creacion: string;
  fecha_actualizacion: string;
}
