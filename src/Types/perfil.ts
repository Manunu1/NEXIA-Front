/* ─────────────────────────────────────────────
   PERFIL — contratos compartidos entre la pantalla
   de configuración, el avatar y el resto de la app.
   Espejan exactamente lo que devuelve /api/perfil.
───────────────────────────────────────────── */

export type HairStyle = 'corto' | 'medio' | 'largo' | 'rizado' | 'rapado';
export type GlassesStyle = 'redondos' | 'cuadrados' | 'sol';
export type HatStyle = 'nexia' | 'gorra' | 'vincha';

export type Genero = 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';

/** Configuración del avatar generado. Todos los colores en formato #RRGGBB. */
export interface AvatarConfig {
  skin: string;
  hair: { style: HairStyle; color: string };
  eyes: string;
  accessories: { glasses: GlassesStyle | null; hat: HatStyle | null };
  shirt_color: string;
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
