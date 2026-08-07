/* ─────────────────────────────────────────────
   SESIÓN — lectura tipada del usuario guardado
   por el login en localStorage, resolución de rol
   y manejo del par de tokens (access + refresh).
───────────────────────────────────────────── */

import type { AvatarConfig } from '../Types/perfil';

export type Rol = 'alumno' | 'profesor' | 'gestor';

export interface SesionUsuario {
  nombre?: string;
  apellido?: string;
  alumno_id?: string;
  profesor_id?: string;
  gestor_id?: string;
  institucion_id?: string | number;
  institucion_nombre?: string;
  /** Imagen de perfil — leer siempre con getProfileImage(), nunca sueltos. */
  avatar_config?: AvatarConfig | null;
  foto_perfil_url?: string | null;
  [key: string]: unknown;
}

/**
 * Se emite cuando el usuario edita su perfil. La sidebar (y cualquier otra
 * vista montada) escucha para reflejar nombre e imagen sin recargar.
 */
export const EVENTO_PERFIL = 'nexia:perfil-actualizado';

export function getUsuarioSesion(): SesionUsuario | null {
  try {
    const raw = localStorage.getItem('usuario');
    return raw ? (JSON.parse(raw) as SesionUsuario) : null;
  } catch {
    return null;
  }
}

/** Nombre para mostrar del usuario logueado ('' si no hay sesión legible). */
export function getNombreUsuario(conApellido = false): string {
  const usuario = getUsuarioSesion();
  if (!usuario) return '';
  return conApellido
    ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()
    : usuario.nombre || '';
}

/**
 * Resuelve el rol de la sesión activa a partir de los datos guardados
 * por el login, con fallback a los ids del usuario.
 */
export function getRolActual(): Rol {
  const rol = (localStorage.getItem('rol') || '').toLowerCase();
  if (rol.includes('profesor') || rol.includes('docente')) return 'profesor';
  if (rol.includes('gestor')) return 'gestor';
  if (rol.includes('alumno')) return 'alumno';
  const usuario = getUsuarioSesion();
  if (usuario?.gestor_id) return 'gestor';
  if (usuario?.profesor_id) return 'profesor';
  return 'alumno';
}

export function haySesion(): boolean {
  return getUsuarioSesion() !== null;
}

/**
 * Mezcla cambios en el usuario guardado y avisa a la app.
 * Es el único camino para tocar la sesión después del login: escribir
 * localStorage a mano deja la sidebar mostrando datos viejos.
 */
export function updateUsuarioSesion(cambios: Partial<SesionUsuario>): SesionUsuario {
  const actual = getUsuarioSesion() ?? {};
  const merged = { ...actual, ...cambios };
  localStorage.setItem('usuario', JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent(EVENTO_PERFIL, { detail: merged }));
  return merged;
}

/** Guarda el par de tokens emitido por el backend. */
export function setTokens(token: string, refreshToken?: string | null): void {
  localStorage.setItem('token', token);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

/** Limpia toda la sesión local (tokens + datos de usuario). */
export function clearSession(): void {
  localStorage.clear();
}
