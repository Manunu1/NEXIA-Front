/* ─────────────────────────────────────────────
   HITOS — qué partes de la app ya conoce el usuario.

   Sirven a la guía de primeros pasos, que no le
   pide a nadie que tilde nada: los pasos se dan por
   hechos solos. Para "¿ya armaste tu avatar?" o
   "¿ya entregaste algo?" alcanza con mirar los
   datos; para "¿ya abriste una materia?" no hay
   dato en el backend, y esa marca se guarda acá.

   Es local a propósito. Un hito no es información
   académica: es memoria de la interfaz, y no tiene
   por qué viajar al servidor ni sincronizarse entre
   dispositivos.
───────────────────────────────────────────── */

export type Hito = 'materia-abierta' | 'ia-usada';

const clave = (hito: Hito) => `nexia:hito:${hito}`;

export function marcarHito(hito: Hito): void {
  try {
    localStorage.setItem(clave(hito), '1');
  } catch {
    // Modo privado o storage lleno: la guía simplemente no avanza sola.
  }
}

export function tieneHito(hito: Hito): boolean {
  try {
    return localStorage.getItem(clave(hito)) === '1';
  } catch {
    return false;
  }
}
