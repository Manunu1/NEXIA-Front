/* ─────────────────────────────────────────────
   SESIÓN — lectura tipada del usuario guardado
   por el login en localStorage, resolución de rol
   y manejo del par de tokens (access + refresh).
───────────────────────────────────────────── */

export type Rol = 'alumno' | 'profesor' | 'gestor';

export interface SesionUsuario {
  nombre?: string;
  apellido?: string;
  alumno_id?: string;
  profesor_id?: string;
  gestor_id?: string;
  institucion_id?: string | number;
  institucion_nombre?: string;
  [key: string]: unknown;
}

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
