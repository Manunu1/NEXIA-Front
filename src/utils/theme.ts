/* ─────────────────────────────────────────────
   TEMA — preferencia claro / oscuro.
   El tema se aplica poniendo data-theme en <html>;
   todos los tokens de color se resuelven a partir
   de ese atributo (ver index.css). La preferencia
   se guarda en localStorage para aplicarla al
   instante en el arranque, y se sincroniza con el
   backend para los usuarios que tienen perfil.
───────────────────────────────────────────── */

export type Tema = 'claro' | 'oscuro';

const STORAGE_KEY = 'tema';

export function getTemaGuardado(): Tema {
  const guardado = localStorage.getItem(STORAGE_KEY);
  return guardado === 'oscuro' ? 'oscuro' : 'claro';
}

/** Aplica el tema al documento sin persistirlo. */
export function applyTema(tema: Tema): void {
  document.documentElement.dataset.theme = tema;
}

/** Persiste el tema y lo aplica de inmediato. */
export function setTema(tema: Tema): void {
  localStorage.setItem(STORAGE_KEY, tema);
  applyTema(tema);
}

/** Aplica el tema guardado. Llamar una vez al iniciar la app. */
export function initTema(): void {
  applyTema(getTemaGuardado());
}
