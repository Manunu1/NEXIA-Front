import type { AvatarConfig, ConImagenDePerfil } from '../Types/perfil';
import { normalizarAvatar } from './avatar';

/* ─────────────────────────────────────────────
   IMAGEN DE PERFIL — regla única y excluyente.

   El backend garantiza que avatar_config y
   foto_perfil_url nunca conviven (elegir uno borra
   el otro), pero el orden de precedencia se define
   acá igual: si algún día llegaran los dos, toda la
   app tiene que mostrar lo mismo.

   Usar SIEMPRE este helper —directamente o vía
   <ProfileImage />— en sidebar, listados, mensajes
   y comentarios. Nunca leer foto_perfil_url suelto.
───────────────────────────────────────────── */

export type ImagenPerfil =
  | { type: 'avatar'; config: AvatarConfig }
  | { type: 'foto'; url: string }
  | { type: 'default' };

export function getProfileImage(usuario?: ConImagenDePerfil | null): ImagenPerfil {
  if (!usuario) return { type: 'default' };

  // avatar_config puede llegar como objeto o como JSON crudo según el endpoint.
  const avatar = usuario.avatar_config;
  if (avatar) {
    const parseado =
      typeof avatar === 'string' ? (avatar.trim() ? normalizarAvatar(avatar) : null) : normalizarAvatar(avatar);
    if (parseado) return { type: 'avatar', config: parseado };
  }

  const foto = usuario.foto_perfil_url;
  if (typeof foto === 'string' && foto.trim()) {
    return { type: 'foto', url: foto };
  }

  return { type: 'default' };
}

/* ─────────────────────────────────────────────
   AVATAR ANIMABLE — qué cara usa el compañero.

   Regla, y es distinta a la de arriba a propósito:
   el compañero necesita una cara que gesticule, y
   una foto no gesticula. Entonces sólo se anima el
   avatar generado; en cualquier otro caso —sin
   imagen o con foto— habla Nexo.

   Que Nexo aparezca no es un estado degradado: es
   la mascota de la app haciendo de guía. Por eso
   nunca cae en iniciales ni en la silueta genérica.
───────────────────────────────────────────── */

export type AvatarAnimable =
  | { type: 'avatar'; config: AvatarConfig }
  | { type: 'mascota' };

export function getAvatarAnimable(usuario?: ConImagenDePerfil | null): AvatarAnimable {
  const imagen = getProfileImage(usuario);
  return imagen.type === 'avatar' ? imagen : { type: 'mascota' };
}

/** Iniciales para el estado sin imagen. '' si no hay nombre legible. */
export function getIniciales(nombre?: string | null, apellido?: string | null): string {
  const n = (nombre ?? '').trim();
  const a = (apellido ?? '').trim();
  const iniciales = `${n[0] ?? ''}${a[0] ?? ''}`.toUpperCase();
  if (iniciales) return iniciales;
  // Nombre completo en un solo campo → tomar las dos primeras palabras
  return n
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
