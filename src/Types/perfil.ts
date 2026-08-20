/* ─────────────────────────────────────────────
   PERFIL — contratos compartidos entre la pantalla
   de configuración, el avatar y el resto de la app.
   Espejan exactamente lo que devuelve /api/perfil.
───────────────────────────────────────────── */

export type HairStyle =
  | 'corto'
  | 'medio'
  | 'largo'
  | 'rizado'
  | 'rapado'
  | 'ondulado'
  | 'bob'
  | 'coleta'
  | 'rodete'
  | 'trenzas';

export type GlassesStyle = 'redondos' | 'cuadrados' | 'sol' | 'aviador' | 'gato';
export type HatStyle = 'nexia' | 'gorra' | 'vincha' | 'beanie' | 'auriculares' | 'birrete';

/** Vello facial. Sigue el color del pelo, un punto más oscuro. */
export type VelloFacial = 'barba' | 'candado' | 'bigote';

/** Marca del rostro — detalle chico que personaliza sin cambiar la silueta. */
export type MarcaRostro = 'pecas' | 'lunar';

/**
 * Fondo del retrato. No es decoración libre: son seis atmósferas de la paleta
 * de marca, cada una con su versión clara y oscura (ver nexiaAvatar.css).
 */
export type FondoAvatar = 'aurora' | 'menta' | 'atardecer' | 'indigo' | 'rosa' | 'liso';

export type Genero = 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';

/* ── Presentación del avatar ───────────────────
   Viven acá y no en un componente porque los
   comparten NexiaAvatar (retrato del usuario),
   NexiaMascota (Nexo) y todo lo que los monta.
───────────────────────────────────────────── */

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Expresión de la cara. 'normal' es la de siempre y es el default en toda
 * la app: el avatar tiene que ser reconocible como la misma persona. Las
 * demás son puntuales — celebrar, saludar, concentrarse o "estar pensando".
 *
 * Son gestos, no personajes: cambian cejas, párpados, mirada y boca sobre
 * el MISMO rostro (ver GESTOS en NexiaAvatar), nunca la silueta.
 */
export type AvatarExpresion =
  | 'normal'
  | 'alegre'
  | 'guino'
  | 'pensando'
  | 'celebrando'
  | 'concentrado';

/**
 * Encuadre. Los tres recortan zonas distintas del mismo lienzo 160 × 240,
 * de modo que un retrato y la mascota son intercambiables sin tocar layout.
 */
export type AvatarFrame = 'circle' | 'full' | 'head';

/**
 * Configuración del avatar generado. Todos los colores en formato #RRGGBB.
 *
 * Los tres últimos campos se agregaron después y son opcionales a propósito:
 * una config guardada antes de que existieran tiene que seguir renderizando
 * sin migración (normalizarAvatar les pone el default).
 */
export interface AvatarConfig {
  skin: string;
  hair: { style: HairStyle; color: string };
  eyes: string;
  accessories: { glasses: GlassesStyle | null; hat: HatStyle | null };
  shirt_color: string;
  facial_hair?: VelloFacial | null;
  marks?: MarcaRostro | null;
  backdrop?: FondoAvatar;
}

/**
 * Fuente mínima para resolver la imagen de perfil de alguien.
 * Deliberadamente laxa: listados, comentarios y mensajes traen objetos
 * distintos, y todos deben poder pasar por getProfileImage().
 */
export interface ConImagenDePerfil {
  avatar_config?: AvatarConfig | string | null;
  foto_perfil_url?: string | null;
}

export interface Perfil extends ConImagenDePerfil {
  usuario_id: number;
  nombre: string;
  apellido: string;
  email: string;
  dni: string;
  rol: string;

  telefono: string | null;
  fecha_nacimiento: string | null;
  genero: Genero | null;
  biografia: string | null;

  direccion: string | null;
  ciudad: string | null;
  pais: string | null;

  tema: 'claro' | 'oscuro';
  idioma: string;
  notificaciones_email: boolean;

  avatar_config: AvatarConfig | null;
  foto_perfil_url: string | null;
}

/** Campos que acepta PUT /api/perfil/me (todos opcionales). */
export type PerfilEditable = Partial<
  Pick<
    Perfil,
    | 'nombre'
    | 'apellido'
    | 'telefono'
    | 'fecha_nacimiento'
    | 'genero'
    | 'biografia'
    | 'direccion'
    | 'ciudad'
    | 'pais'
    | 'tema'
    | 'idioma'
    | 'notificaciones_email'
  >
>;
