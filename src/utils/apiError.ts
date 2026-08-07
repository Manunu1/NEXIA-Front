import axios from 'axios';

/* ─────────────────────────────────────────────
   ERRORES DE API — el backend ya devuelve
   { ok, message, data } con el message en español
   listo para mostrar. Este helper lo extrae y sólo
   cae en el texto genérico si no vino nada usable.
───────────────────────────────────────────── */

export function mensajeDeError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const message = (err.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message.trim()) return message;
    if (!err.response) return 'No pudimos conectarnos con el servidor. Revisá tu conexión.';
  }
  return fallback;
}

/** Código HTTP de la respuesta, si lo hubo. */
export function estadoDeError(err: unknown): number | undefined {
  return axios.isAxiosError(err) ? err.response?.status : undefined;
}
