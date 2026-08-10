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

/**
 * Salida concreta del mensaje. Un consejo sin a dónde ir es una frase; con
 * destino, es ayuda. Se omite cuando el mensaje ya se resuelve en la misma
 * pantalla: mandar a alguien donde ya está es ruido.
 */
export interface AccionBuddy {
  label: string;
  to: string;
}

export interface MensajeBuddy {
  id: string;
  texto: string;
  tono: TonoBuddy;
  accion?: AccionBuddy;
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
      accion: { label: 'Abrir Nexia IA', to: '/nexia-ia' },
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

/* ── Entrega de un trabajo práctico ────────────
   El momento en el que el acompañamiento vale más:
   el alumno está por hacer algo, no leyendo un
   resumen. Por eso acá los mensajes son de método
   ("qué revisar antes de subir"), no de estado —
   el estado ya lo dicen los banners de la página.
───────────────────────────────────────────── */

export type EstadoEntrega = 'sin-entregar' | 'en-correccion' | 'corregido';

export interface ContextoEntrega {
  estado: EstadoEntrega;
  /** La fecha límite ya pasó. */
  vencido: boolean;
  /** Días hasta el límite. null si el TP no tiene fecha. */
  diasRestantes: number | null;
  nota: number | null;
  /** El docente escribió una devolución además de la nota. */
  tieneDevolucion: boolean;
  /** La consigna trae material adjunto. */
  tieneMaterial: boolean;
}

const IR_A_IA: AccionBuddy = { label: 'Preguntarle a Nexia IA', to: '/nexia-ia' };

export function mensajesEntrega(ctx: ContextoEntrega): MensajeBuddy[] {
  const { estado, vencido, diasRestantes, nota, tieneDevolucion, tieneMaterial } = ctx;
  const msgs: MensajeBuddy[] = [];

  if (estado === 'corregido') {
    // La devolución primero y la nota después: al revés, la nota se come
    // toda la atención y el texto del docente no se lee nunca.
    if (tieneDevolucion) {
      msgs.push({
        id: 'leer-devolucion',
        tono: 'tip',
        texto: 'Leé la devolución antes que la nota. La nota te dice cómo te fue; la devolución te dice qué hacer distinto la próxima.',
      });
    }

    if (nota != null && nota >= 8) {
      msgs.push({
        id: 'nota-alta',
        tono: 'logro',
        texto: `${nota} en este trabajo. Fijate qué hiciste acá que no hacés siempre — eso es lo que conviene repetir.`,
      });
    } else if (nota != null && nota < 6) {
      msgs.push({
        id: 'nota-baja',
        tono: 'animo',
        texto: 'Una nota baja marca un tema que quedó flojo, no tu capacidad. Identificá cuál fue y atacá ese.',
        accion: IR_A_IA,
      });
    }

    msgs.push({
      id: 'reescribir',
      tono: 'tip',
      texto: 'Reescribí en tus apuntes la parte que te corrigieron. Corregir sin reescribir se olvida en una semana.',
      accion: { label: 'Ir a mis apuntes', to: '/apuntes' },
    });

    return msgs;
  }

  if (estado === 'en-correccion') {
    msgs.push({
      id: 'entregado',
      tono: 'logro',
      texto: 'Entregado. Podés reemplazar el archivo hasta que el docente lo corrija, así que si encontrás un error todavía llegás.',
    });
    msgs.push({
      id: 'mientras-espera',
      tono: 'tip',
      texto: 'Mientras esperás la corrección: anotá qué parte te costó más. Cuando vuelva la nota vas a saber exactamente dónde mirar.',
    });
    return msgs;
  }

  /* ── Todavía no entregó ── */

  if (vencido) {
    msgs.push({
      id: 'vencido',
      tono: 'alerta',
      texto: 'La fecha ya pasó y la entrega está cerrada. Escribile al docente: explicar a tiempo pesa más que no aparecer.',
      accion: { label: 'Escribirle', to: '/mensajes' },
    });
  } else if (diasRestantes != null && diasRestantes <= 1) {
    msgs.push({
      id: 'ultimo-dia',
      tono: 'alerta',
      texto: diasRestantes <= 0
        ? 'Vence hoy. Entregá lo que tengas: un trabajo incompleto a tiempo vale más que uno perfecto que no llegó.'
        : 'Vence mañana. Si le metés un rato hoy, mañana sólo revisás.',
    });
  }

  msgs.push({
    id: 'checklist',
    tono: 'tip',
    texto: 'Antes de subir el archivo: releé la consigna y marcá punto por punto que lo hayas respondido. Es lo que más notas se lleva.',
  });

  if (tieneMaterial) {
    msgs.push({
      id: 'material',
      tono: 'tip',
      texto: 'El docente adjuntó material a la consigna. Ahí suele estar el criterio con el que van a corregirte.',
    });
  }

  msgs.push({
    id: 'trabado',
    tono: 'animo',
    texto: '¿Trabado? Contale a Nexia IA qué entendiste hasta ahora. No te va a dar la respuesta, pero sí el hilo para seguir.',
    accion: IR_A_IA,
  });

  msgs.push({
    id: 'comentario',
    tono: 'tip',
    texto: 'El comentario para el docente no es opcional de verdad: contar qué decisión tomaste y por qué cambia cómo se lee tu trabajo.',
  });

  return msgs;
}

/* ── Boletín ───────────────────────────────── */

export interface ContextoBoletin {
  /** Promedios por bimestre, ordenados. */
  promedios: { orden: number; nombre: string; promedio: number }[];
  /** Materias con promedio por debajo de 6. */
  flojas: { materia: string; promedio: number }[];
  /** Materias con promedio de 8 o más. */
  fuertes: { materia: string; promedio: number }[];
  /** Hay al menos una nota cargada. */
  hayNotas: boolean;
}

export function mensajesBoletin(ctx: ContextoBoletin): MensajeBuddy[] {
  const { promedios, flojas, fuertes, hayNotas } = ctx;
  const msgs: MensajeBuddy[] = [];

  if (!hayNotas) {
    return [{
      id: 'sin-notas',
      tono: 'tip',
      texto: 'Todavía no hay notas cargadas. Cuando tus docentes las publiquen, acá vas a poder comparar bimestre a bimestre.',
    }];
  }

  if (flojas.length > 0) {
    const f = flojas[0];
    msgs.push({
      id: 'reforzar',
      tono: 'animo',
      texto: `Si tenés que elegir una para empezar, es ${f.materia} (${f.promedio}). Subir la más baja mueve el promedio general más que mejorar la que ya te va bien.`,
      accion: IR_A_IA,
    });
  }

  if (promedios.length >= 2) {
    const ult = promedios[promedios.length - 1];
    const ant = promedios[promedios.length - 2];
    const delta = Math.round((ult.promedio - ant.promedio) * 10) / 10;

    if (delta > 0) {
      msgs.push({
        id: 'tendencia-sube',
        tono: 'logro',
        texto: `+${delta} respecto de ${ant.nombre}. La tendencia dice más que cualquier nota suelta, y la tuya va para arriba.`,
      });
    } else if (delta < 0) {
      msgs.push({
        id: 'tendencia-baja',
        tono: 'alerta',
        texto: `Bajaste ${Math.abs(delta)} respecto de ${ant.nombre}. Todavía estás a tiempo de darlo vuelta si lo mirás ahora y no en el último bimestre.`,
      });
    }
  }

  if (fuertes.length > 0) {
    msgs.push({
      id: 'fuerte',
      tono: 'logro',
      texto: `${fuertes[0].materia} en ${fuertes[0].promedio}. Fijate cómo estudiás esa y aplicá el mismo método a la que te cuesta.`,
    });
  }

  msgs.push({
    id: 'leer-boletin',
    tono: 'tip',
    texto: 'Un boletín no se lee nota por nota, se lee por tendencia: qué subió, qué bajó y desde cuándo.',
  });

  return msgs;
}

/* ── Contenidos de una materia ─────────────── */

export interface ContextoContenidos {
  materia: string;
  /** Contenidos publicados por el docente. */
  contenidos: number;
  /** TPs de la materia sin entregar. */
  pendientes: number;
}

export function mensajesContenidos(ctx: ContextoContenidos): MensajeBuddy[] {
  const { materia, contenidos, pendientes } = ctx;
  const msgs: MensajeBuddy[] = [];

  if (contenidos === 0) {
    return [{
      id: 'sin-contenidos',
      tono: 'tip',
      texto: `Todavía no hay material publicado en ${materia}. Cuando el docente suba algo, te va a aparecer acá.`,
    }];
  }

  if (pendientes > 0) {
    msgs.push({
      id: 'pendientes-materia',
      tono: 'alerta',
      texto: `Te ${plural(pendientes, 'queda 1 entrega', `quedan ${pendientes} entregas`)} en esta materia. El material de acá suele ser justo lo que la consigna pide usar.`,
    });
  }

  msgs.push({
    id: 'apunte-propio',
    tono: 'tip',
    texto: 'Después de leer un contenido, escribí tres líneas con lo que entendiste. Si no te salen, todavía no lo entendiste.',
    accion: { label: 'Ir a mis apuntes', to: '/apuntes' },
  });

  msgs.push({
    id: 'preguntar-material',
    tono: 'animo',
    texto: `Nexia IA ya leyó el material de ${materia}. Preguntale por el tema que no te cierra y te lo explica con ese contenido.`,
    accion: IR_A_IA,
  });

  return msgs;
}

/* ── Nexia IA ──────────────────────────────── */

/**
 * Acá el compañero enseña a usar la IA, y eso es parte del producto: la
 * diferencia entre "dame la respuesta" y "explicame cómo se piensa esto"
 * es exactamente el enfoque pedagógico de NEXIA.
 */
export function mensajesIA(): MensajeBuddy[] {
  return [
    {
      id: 'ia-contexto',
      tono: 'tip',
      texto: 'Empezá contándole qué entendiste y dónde te trabaste. Con eso te explica el paso que falta, no todo de nuevo.',
    },
    {
      id: 'ia-no-copiar',
      tono: 'animo',
      texto: 'No te va a resolver la consigna, y es a propósito: si te la resuelve, en la prueba estás solo.',
    },
    {
      id: 'ia-material',
      tono: 'tip',
      texto: 'Tiene el material que publicaron tus docentes. Nombrá la materia o el tema y te responde con eso, no con cualquier cosa de internet.',
    },
    {
      id: 'ia-ejemplo',
      tono: 'tip',
      texto: 'Buena pregunta: "explicame con un ejemplo distinto al del apunte". Mala: "hacé el punto 3".',
    },
    {
      id: 'ia-verificar',
      tono: 'tip',
      texto: 'Cerrá siempre pidiéndole que te tome un ejemplo para resolver vos. Ahí se ve si entendiste o si te convenció.',
    },
  ];
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
