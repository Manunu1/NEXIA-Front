/* ─────────────────────────────────────────────
   COMPAÑERO NEXIA — qué te dice tu avatar.

   Regla de oro: todo lo que dice tiene que estar
   GANADO. Cada mensaje sale de datos reales del
   alumno o del docente (entregas, promedios,
   alumnos en riesgo). Nada de frases motivacionales
   genéricas rotando al azar: si felicita sin motivo,
   deja de significar algo y molesta.

   Los mensajes vuelven ordenados por prioridad —
   primero lo que hay para celebrar o lo urgente, y
   los tips genéricos al final como relleno.
───────────────────────────────────────────── */

export type TonoBuddy = 'logro' | 'animo' | 'alerta' | 'tip' | 'saludo';

export interface MensajeBuddy {
  id: string;
  texto: string;
  tono: TonoBuddy;
}

const plural = (n: number, sing: string, plu: string) => (n === 1 ? sing : plu);

function saludoHorario(nombre: string): MensajeBuddy {
  const h = new Date().getHours();
  const pila = nombre ? `, ${nombre}` : '';
  if (h < 6) return { id: 'saludo', tono: 'saludo', texto: `Es tardísimo${pila}. Descansar también es estudiar.` };
  if (h < 12) return { id: 'saludo', tono: 'saludo', texto: `Buen día${pila}. Arrancamos de nuevo.` };
  if (h < 19) return { id: 'saludo', tono: 'saludo', texto: `¿Cómo va la tarde${pila}?` };
  return { id: 'saludo', tono: 'saludo', texto: `Buenas noches${pila}. Un ratito más y a descansar.` };
}

/* ── Alumno ────────────────────────────────── */

export interface ContextoAlumno {
  nombre: string;
  materias: number;
  /** TPs activos sin entregar */
  pendientes: number;
  /** TPs activos totales */
  tpTotales: number;
  /** TPs ya corregidos por el docente */
  corregidos: number;
  /** Pendientes cuya fecha límite ya pasó */
  vencidos: number;
  /** Pendientes que vencen hoy o mañana (todavía se llega) */
  porVencer: number;
  /** Promedios por bimestre, ordenados */
  promedios: { orden: number; nombre: string; promedio: number }[];
  /** Materias con promedio por debajo de 6 */
  flojas: { materia: string; promedio: number }[];
}

export function mensajesAlumno(ctx: ContextoAlumno): MensajeBuddy[] {
  const msgs: MensajeBuddy[] = [];
  const { pendientes, tpTotales, corregidos, vencidos, porVencer, promedios, flojas } = ctx;

  // 1. Lo urgente primero. Vencido y por vencer son situaciones distintas:
  // decirle "te quedan 24 h" a alguien que ya se pasó de fecha es mentirle.
  if (vencidos > 0) {
    msgs.push({
      id: 'vencidos',
      tono: 'alerta',
      texto: `${plural(vencidos, 'Se te pasó 1 entrega', `Se te pasaron ${vencidos} entregas`)}. Entregá igual y avisale al docente: tarde suma mucho más que nunca.`,
    });
  }

  if (porVencer > 0) {
    msgs.push({
      id: 'por-vencer',
      tono: 'alerta',
      texto: `${porVencer} ${plural(porVencer, 'entrega vence', 'entregas vencen')} en las próximas 24 h. Si le metés un rato ahora, llegás.`,
    });
  }

  // 2. Estar al día es un logro real y casi nunca se lo reconoce a nadie.
  if (tpTotales > 0 && pendientes === 0) {
    msgs.push({
      id: 'al-dia',
      tono: 'logro',
      texto: `Cero pendientes. Entregaste ${plural(tpTotales, 'el único trabajo', `los ${tpTotales} trabajos`)}. Eso es constancia.`,
    });
  }

  // 3. Mejorar el promedio motiva más que el promedio en sí.
  if (promedios.length >= 2) {
    const ult = promedios[promedios.length - 1];
    const ant = promedios[promedios.length - 2];
    if (ult.promedio > ant.promedio) {
      msgs.push({
        id: 'subiste',
        tono: 'logro',
        texto: `Subiste de ${ant.promedio} a ${ult.promedio} en ${ult.nombre}. Vas para arriba.`,
      });
    }
  }

  const ultimo = promedios[promedios.length - 1];
  if (ultimo && ultimo.promedio >= 8) {
    msgs.push({
      id: 'promedio-alto',
      tono: 'logro',
      texto: `Promedio ${ultimo.promedio} en ${ultimo.nombre}. Ese es tu nivel — sostenelo.`,
    });
  }

  // 4. Las materias flojas se nombran una por una y con una salida concreta.
  if (flojas.length > 0) {
    const f = flojas[0];
    msgs.push({
      id: `floja-${f.materia}`,
      tono: 'animo',
      texto: `${f.materia} viene en ${f.promedio}. No es drama: pedile a Nexia IA que te explique lo último que vieron.`,
    });
  }

  if (corregidos > 0) {
    msgs.push({
      id: 'corregidos',
      tono: 'tip',
      texto: `Tenés ${corregidos} ${plural(corregidos, 'trabajo corregido', 'trabajos corregidos')}. Leer la devolución es donde más se aprende.`,
    });
  }

  if (pendientes > 0 && vencidos === 0 && porVencer === 0) {
    msgs.push({
      id: 'pendientes',
      tono: 'animo',
      texto: `Te ${plural(pendientes, 'queda 1 entrega', `quedan ${pendientes} entregas`)}. Empezá por la que vence primero y sacátela de encima.`,
    });
  }

  msgs.push(saludoHorario(ctx.nombre));

  msgs.push({
    id: 'tip-apuntes',
    tono: 'tip',
    texto: 'Escribir con tus palabras lo que entendiste es la forma más rápida de darte cuenta de lo que no entendiste.',
  });

  return msgs;
}

/* ── Profesor ──────────────────────────────── */

export interface ContextoProfesor {
  nombre: string;
  materias: number;
  cursos: number;
  /** Alumnos detectados en riesgo (notas bajas o TPs vencidos) */
  enRiesgo: number;
}

export function mensajesProfesor(ctx: ContextoProfesor): MensajeBuddy[] {
  const msgs: MensajeBuddy[] = [];
  const { materias, cursos, enRiesgo } = ctx;

  if (enRiesgo > 0) {
    msgs.push({
      id: 'riesgo',
      tono: 'alerta',
      texto: `${enRiesgo} ${plural(enRiesgo, 'alumno necesita', 'alumnos necesitan')} acompañamiento. Un mensaje corto a tiempo cambia un trimestre.`,
    });
  } else if (materias > 0) {
    msgs.push({
      id: 'sin-riesgo',
      tono: 'logro',
      texto: 'Ningún alumno en riesgo hoy. Ese silencio es resultado de tu seguimiento.',
    });
  }

  if (materias > 0) {
    msgs.push({
      id: 'alcance',
      tono: 'tip',
      texto: `Estás a cargo de ${materias} ${plural(materias, 'materia', 'materias')} en ${cursos} ${plural(cursos, 'curso', 'cursos')}. No es poco.`,
    });
  }

  msgs.push(saludoHorario(ctx.nombre));

  msgs.push({
    id: 'tip-devolucion',
    tono: 'tip',
    texto: 'Una devolución concreta rinde más que una nota alta: decile qué hizo bien y qué cambiar.',
  });

  return msgs;
}
