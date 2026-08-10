import type { typeBoletinNotaFinal } from '../Types/profesores/types';

/* ─────────────────────────────────────────────
   BOLETÍN — cómo se agregan las notas finales.

   Vive acá porque lo consumen tres pantallas que
   tienen que coincidir: el inicio del alumno (el
   gráfico y lo que dice el compañero), el boletín
   y cualquier resumen futuro. Si cada una calculara
   su propio promedio, tarde o temprano el compañero
   te felicitaría por un 8 que la tabla muestra 7.
───────────────────────────────────────────── */

export interface PromedioBimestre {
  orden: number;
  nombre: string;
  promedio: number;
}

export interface PromedioMateria {
  materia: string;
  promedio: number;
}

/** Redondeo a un decimal — el que se muestra en toda la app. */
const redondear = (ns: number[]): number =>
  Math.round((ns.reduce((a, b) => a + b, 0) / ns.length) * 10) / 10;

/** Promedio general por bimestre, ordenado cronológicamente. */
export function promediosPorBimestre(notas: typeBoletinNotaFinal[]): PromedioBimestre[] {
  const porBimestre = new Map<number, { nombre: string; notas: number[] }>();

  for (const n of notas) {
    if (n.nota == null) continue;
    const entry = porBimestre.get(n.orden) ?? { nombre: n.bimestre_nombre, notas: [] };
    entry.notas.push(Number(n.nota));
    porBimestre.set(n.orden, entry);
  }

  return Array.from(porBimestre.entries())
    .map(([orden, { nombre, notas: ns }]) => ({ orden, nombre, promedio: redondear(ns) }))
    .sort((a, b) => a.orden - b.orden);
}

/** Promedio de cada materia a lo largo de todos los bimestres. */
export function promediosPorMateria(notas: typeBoletinNotaFinal[]): PromedioMateria[] {
  const porMateria = new Map<string, number[]>();

  for (const n of notas) {
    if (n.nota == null) continue;
    const arr = porMateria.get(n.materia_nombre) ?? [];
    arr.push(Number(n.nota));
    porMateria.set(n.materia_nombre, arr);
  }

  return Array.from(porMateria.entries()).map(([materia, ns]) => ({
    materia,
    promedio: redondear(ns),
  }));
}

/** Materias por debajo del umbral, de la más floja a la menos. */
export function materiasFlojas(notas: typeBoletinNotaFinal[], umbral = 6): PromedioMateria[] {
  return promediosPorMateria(notas)
    .filter((m) => m.promedio < umbral)
    .sort((a, b) => a.promedio - b.promedio);
}

/** Materias por encima del umbral, de la más alta a la menos. */
export function materiasFuertes(notas: typeBoletinNotaFinal[], umbral = 8): PromedioMateria[] {
  return promediosPorMateria(notas)
    .filter((m) => m.promedio >= umbral)
    .sort((a, b) => b.promedio - a.promedio);
}
