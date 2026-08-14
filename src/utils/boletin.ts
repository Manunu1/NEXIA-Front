import type { typeBoletinNotaFinal } from '../Types/profesores/types';

/* ─────────────────────────────────────────────
   BOLETÍN — cómo se agregan las notas finales.

   Vive acá porque lo consumen tres pantallas que
   tienen que coincidir: el inicio del alumno (el
   gráfico y lo que dice el compañero), el boletín
   y cualquier resumen futuro. Si cada una calculara
   su propio promedio, tarde o temprano el compañero
   te felicitaría por un 8 que la tabla muestra 7.

   Dos reglas que no se pueden romper:

   1. Toda nota entra por aNota(). La columna nota
      es NUMERIC en Postgres y el driver pg la
      entrega como string ("8.00"), no como number.
      Sumarlas sin convertir concatena: 0 + "8.00"
      + "6.00" da "08.006.00", que termina en NaN.
      El tipo declaraba number y TypeScript no podía
      avisar, así que la conversión es obligatoria
      en la puerta de entrada.

   2. Un solo redondeo, a dos decimales, para todos.
      Antes el boletín redondeaba a 2 y el compañero
      a 1: la misma materia se mostraba 7.5 en un
      lado y 7.45 en el otro.
───────────────────────────────────────────── */

/** Decimales con los que se muestra cualquier promedio de la plataforma. */
const DECIMALES = 2;

export interface PromedioBimestre {
  orden: number;
  nombre: string;
  promedio: number;
}

export interface PromedioMateria {
  materia: string;
  promedio: number;
}

/**
 * Normaliza una nota que puede venir como número, como string decimal
 * (Postgres NUMERIC) o vacía. Devuelve null si no es un número usable,
 * para que nunca entre un NaN a un promedio.
 */
export function aNota(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(n) ? n : null;
}

/** Promedio redondeado de una lista de notas. null si no hay ninguna. */
export function promediar(valores: unknown[]): number | null {
  const notas = valores.map(aNota).filter((n): n is number => n !== null);
  if (notas.length === 0) return null;

  const suma = notas.reduce((a, b) => a + b, 0);
  const factor = 10 ** DECIMALES;
  return Math.round((suma / notas.length) * factor) / factor;
}

/**
 * Formatea un promedio para mostrar: recorta los ceros que no aportan
 * (8.00 → "8", 7.50 → "7.5") sin perder el decimal significativo.
 */
export function formatearNota(nota: number | null): string {
  if (nota === null) return '—';
  return String(Number(nota.toFixed(DECIMALES)));
}

/** Promedio general por bimestre, ordenado cronológicamente. */
export function promediosPorBimestre(notas: typeBoletinNotaFinal[]): PromedioBimestre[] {
  const porBimestre = new Map<number, { nombre: string; notas: number[] }>();

  for (const n of notas) {
    const nota = aNota(n.nota);
    if (nota === null) continue;

    const entry = porBimestre.get(n.orden) ?? { nombre: n.bimestre_nombre, notas: [] };
    entry.notas.push(nota);
    porBimestre.set(n.orden, entry);
  }

  return Array.from(porBimestre.entries())
    .map(([orden, { nombre, notas: ns }]) => ({ orden, nombre, promedio: promediar(ns) as number }))
    .sort((a, b) => a.orden - b.orden);
}

/** Promedio de cada materia a lo largo de todos los bimestres. */
export function promediosPorMateria(notas: typeBoletinNotaFinal[]): PromedioMateria[] {
  const porMateria = new Map<string, number[]>();

  for (const n of notas) {
    const nota = aNota(n.nota);
    if (nota === null) continue;

    const arr = porMateria.get(n.materia_nombre) ?? [];
    arr.push(nota);
    porMateria.set(n.materia_nombre, arr);
  }

  return Array.from(porMateria.entries()).map(([materia, ns]) => ({
    materia,
    promedio: promediar(ns) as number,
  }));
}

/**
 * Promedio general del alumno.
 *
 * Se calcula como el promedio de los promedios de cada materia, no como el
 * promedio plano de todas las notas sueltas. La diferencia importa: si una
 * materia tiene cargados los cuatro bimestres y otra sólo uno, el promedio
 * plano le daría cuatro veces más peso a la primera, y el boletín terminaría
 * reflejando qué docente cargó más notas en vez del rendimiento del alumno.
 */
export function promedioGeneral(notas: typeBoletinNotaFinal[]): number | null {
  return promediar(promediosPorMateria(notas).map((m) => m.promedio));
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
