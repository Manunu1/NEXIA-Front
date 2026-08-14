import { useCallback, useEffect, useRef, useState } from 'react';
import type { ConfigPomodoro, FasePomodoro } from '../Types/estudio';

/* ─────────────────────────────────────────────
   POMODORO — el motor del temporizador.

   Decisión central: el tiempo restante NO se lleva
   con un contador que se decrementa cada segundo.
   Los navegadores estrangulan los timers de las
   pestañas en segundo plano (a 1/s, y bastante
   menos si además se minimiza la ventana), así que
   un contador que resta llegaría al final de los 25
   minutos con varios minutos de atraso — justo en
   el caso de uso normal: dejar el Pomodoro corriendo
   mientras estudiás en otra pestaña.

   En su lugar se guarda el instante de finalización
   (`finEn`) y el restante se deriva de Date.now().
   El intervalo sólo dispara re-renders; si se atrasa
   o se saltea, el número que se muestra sigue siendo
   correcto.

   El estado se persiste en localStorage y no en el
   backend: es efímero y propio del dispositivo. Lo
   que sí viaja al servidor es la sesión terminada.
───────────────────────────────────────────── */

export const CONFIG_POR_DEFECTO: ConfigPomodoro = {
  enfoque: 25,
  descanso: 5,
  descansoLargo: 20,
  ciclosHastaLargo: 4,
  autoContinuar: false,
  sonido: true,
};

const CLAVE_ESTADO = 'nexia:pomodoro:estado';
const CLAVE_CONFIG = 'nexia:pomodoro:config';

interface EstadoPersistido {
  fase: FasePomodoro;
  /** Timestamp de finalización; null si está pausado o detenido. */
  finEn: number | null;
  /** Restante congelado mientras está en pausa. */
  restantePausado: number;
  corriendo: boolean;
  ciclosCompletados: number;
  minutosEnfoque: number;
  foco: string;
  objetivoId: number | null;
}

const ESTADO_INICIAL: EstadoPersistido = {
  fase: 'enfoque',
  finEn: null,
  restantePausado: CONFIG_POR_DEFECTO.enfoque * 60,
  corriendo: false,
  ciclosCompletados: 0,
  minutosEnfoque: 0,
  foco: '',
  objetivoId: null,
};

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? { ...porDefecto, ...(JSON.parse(raw) as T) } : porDefecto;
  } catch {
    return porDefecto;
  }
}

function duracionDe(fase: FasePomodoro, config: ConfigPomodoro): number {
  if (fase === 'enfoque') return config.enfoque * 60;
  if (fase === 'descanso') return config.descanso * 60;
  return config.descansoLargo * 60;
}

/** mm:ss, con horas sólo si hicieran falta. */
export function formatearTiempo(segundos: number): string {
  const s = Math.max(0, Math.round(segundos));
  const m = Math.floor(s / 60);
  const resto = s % 60;
  return `${String(m).padStart(2, '0')}:${String(resto).padStart(2, '0')}`;
}

/**
 * Aviso sonoro corto generado con WebAudio.
 *
 * Se sintetiza en vez de cargar un archivo: evita sumar un binario al bundle
 * y un pedido de red que podría no llegar justo cuando termina la fase.
 */
function sonar() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
    osc.start();
    osc.stop(ctx.currentTime + 0.95);
    osc.onended = () => ctx.close();
  } catch {
    /* Sin audio disponible: el aviso visual alcanza. */
  }
}

function notificar(titulo: string, cuerpo: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(titulo, { body: cuerpo, icon: '/favicon.ico' });
    }
  } catch {
    /* Notificaciones bloqueadas: no es crítico. */
  }
}

export const ETIQUETA_FASE: Record<FasePomodoro, string> = {
  enfoque: 'Enfoque',
  descanso: 'Descanso',
  'descanso-largo': 'Descanso largo',
};

/**
 * @param alTerminarEnfoque Se invoca al completarse un bloque de enfoque.
 *   Recibe el objetivo vinculado además de los minutos: si quien llama
 *   tuviera que leerlo del valor devuelto por este hook, necesitaría
 *   referenciarlo antes de que exista.
 */
export function usePomodoro(
  alTerminarEnfoque?: (minutos: number, objetivoId: number | null) => void
) {
  const [config, setConfigInterno] = useState<ConfigPomodoro>(() =>
    leer(CLAVE_CONFIG, CONFIG_POR_DEFECTO)
  );
  const [estado, setEstado] = useState<EstadoPersistido>(() => leer(CLAVE_ESTADO, ESTADO_INICIAL));

  /* Restante en segundos. Vive en su propio estado porque cambia cada
     segundo, mientras que `estado` sólo cambia al pasar de fase. */
  const [restante, setRestante] = useState(() => {
    const guardado = leer(CLAVE_ESTADO, ESTADO_INICIAL);
    if (guardado.corriendo && guardado.finEn) {
      return Math.max(0, Math.round((guardado.finEn - Date.now()) / 1000));
    }
    return guardado.restantePausado;
  });

  /* El callback se guarda en una ref para que no reinicie el intervalo en
     cada render del componente que lo pasa.

     La asignación va en un efecto y no en el cuerpo del render: escribir
     una ref durante el render la deja inconsistente si React descarta ese
     render (StrictMode lo hace a propósito en desarrollo). */
  const alTerminarRef = useRef(alTerminarEnfoque);

  useEffect(() => {
    alTerminarRef.current = alTerminarEnfoque;
  }, [alTerminarEnfoque]);

  useEffect(() => {
    localStorage.setItem(CLAVE_ESTADO, JSON.stringify(estado));
  }, [estado]);

  useEffect(() => {
    localStorage.setItem(CLAVE_CONFIG, JSON.stringify(config));
  }, [config]);

  /** Pasa a la fase siguiente según los ciclos ya completados. */
  const avanzarFase = useCallback((anterior: EstadoPersistido): EstadoPersistido => {
    if (anterior.fase === 'enfoque') {
      const ciclos = anterior.ciclosCompletados + 1;
      const tocaLargo = ciclos % config.ciclosHastaLargo === 0;
      const siguiente: FasePomodoro = tocaLargo ? 'descanso-largo' : 'descanso';

      return {
        ...anterior,
        fase: siguiente,
        ciclosCompletados: ciclos,
        minutosEnfoque: anterior.minutosEnfoque + config.enfoque,
        corriendo: config.autoContinuar,
        finEn: config.autoContinuar ? Date.now() + duracionDe(siguiente, config) * 1000 : null,
        restantePausado: duracionDe(siguiente, config),
      };
    }

    // Terminó un descanso: vuelve el enfoque.
    return {
      ...anterior,
      fase: 'enfoque',
      corriendo: config.autoContinuar,
      finEn: config.autoContinuar ? Date.now() + duracionDe('enfoque', config) * 1000 : null,
      restantePausado: duracionDe('enfoque', config),
    };
  }, [config]);

  /* Tic. El intervalo sólo recalcula desde finEn; si el navegador lo
     estrangula, el próximo tic corrige la diferencia de una. */
  useEffect(() => {
    if (!estado.corriendo || !estado.finEn) return;

    const tic = () => {
      const quedan = Math.max(0, Math.round((estado.finEn! - Date.now()) / 1000));
      setRestante(quedan);

      if (quedan === 0) {
        const eraEnfoque = estado.fase === 'enfoque';

        if (config.sonido) sonar();
        notificar(
          eraEnfoque ? '¡Pomodoro completo!' : 'Se terminó el descanso',
          eraEnfoque ? 'Tomate un descanso.' : 'Volvé a lo tuyo.'
        );
        if (eraEnfoque) alTerminarRef.current?.(config.enfoque, estado.objetivoId);

        setEstado(avanzarFase);
      }
    };

    tic();
    const id = setInterval(tic, 250);
    return () => clearInterval(id);
  }, [estado.corriendo, estado.finEn, estado.fase, estado.objetivoId, config, avanzarFase]);

  /* El tiempo restante en la pestaña: deja ver cuánto falta sin volver a
     la ventana de Nexia. */
  useEffect(() => {
    if (!estado.corriendo) return;
    const previo = document.title;
    document.title = `${formatearTiempo(restante)} · ${ETIQUETA_FASE[estado.fase]}`;
    return () => { document.title = previo; };
  }, [restante, estado.corriendo, estado.fase]);

  // ── Acciones ────────────────────────────────

  const iniciar = useCallback(() => {
    // Se piden las notificaciones acá y no al montar: pedir permiso apenas
    // se abre la página es intrusivo y la mayoría lo rechaza por reflejo.
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    setEstado((prev) => {
      const segundos = prev.restantePausado > 0 ? prev.restantePausado : duracionDe(prev.fase, config);
      return { ...prev, corriendo: true, finEn: Date.now() + segundos * 1000 };
    });
  }, [config]);

  const pausar = useCallback(() => {
    setEstado((prev) => {
      if (!prev.corriendo || !prev.finEn) return prev;
      return {
        ...prev,
        corriendo: false,
        finEn: null,
        restantePausado: Math.max(0, Math.round((prev.finEn - Date.now()) / 1000)),
      };
    });
  }, []);

  /** Reinicia la fase actual sin tocar los ciclos ya hechos. */
  const reiniciarFase = useCallback(() => {
    setEstado((prev) => ({
      ...prev,
      corriendo: false,
      finEn: null,
      restantePausado: duracionDe(prev.fase, config),
    }));
    setRestante(duracionDe(estado.fase, config));
  }, [config, estado.fase]);

  /** Saltea a la fase siguiente. Un enfoque salteado NO cuenta como ciclo. */
  const saltear = useCallback(() => {
    setEstado((prev) => {
      if (prev.fase === 'enfoque') {
        const siguiente: FasePomodoro =
          (prev.ciclosCompletados + 1) % config.ciclosHastaLargo === 0 ? 'descanso-largo' : 'descanso';
        return {
          ...prev,
          fase: siguiente,
          corriendo: false,
          finEn: null,
          restantePausado: duracionDe(siguiente, config),
        };
      }
      return {
        ...prev,
        fase: 'enfoque',
        corriendo: false,
        finEn: null,
        restantePausado: duracionDe('enfoque', config),
      };
    });
  }, [config]);

  /** Cierra la sesión y devuelve lo que hay que registrar en el servidor. */
  const terminarSesion = useCallback(() => {
    const resumen = {
      foco: estado.foco,
      ciclos_completados: estado.ciclosCompletados,
      minutos_enfoque: estado.minutosEnfoque,
    };

    setEstado({ ...ESTADO_INICIAL, restantePausado: duracionDe('enfoque', config), foco: estado.foco });
    setRestante(duracionDe('enfoque', config));

    return resumen;
  }, [estado.foco, estado.ciclosCompletados, estado.minutosEnfoque, config]);

  const setFoco = useCallback((foco: string) => {
    setEstado((prev) => ({ ...prev, foco }));
  }, []);

  const setObjetivoId = useCallback((objetivoId: number | null) => {
    setEstado((prev) => ({ ...prev, objetivoId }));
  }, []);

  const setConfig = useCallback((parcial: Partial<ConfigPomodoro>) => {
    setConfigInterno((prev) => {
      const nueva = { ...prev, ...parcial };

      // Si se cambia la duración de la fase en curso mientras está detenida,
      // el reloj tiene que reflejarlo de inmediato; si está corriendo, se
      // respeta la cuenta en marcha para no mover el piso bajo los pies.
      setEstado((e) => {
        if (e.corriendo) return e;
        const nuevoRestante = duracionDe(e.fase, nueva);
        setRestante(nuevoRestante);
        return { ...e, restantePausado: nuevoRestante };
      });

      return nueva;
    });
  }, []);

  const duracionFase = duracionDe(estado.fase, config);

  return {
    // estado
    fase: estado.fase,
    corriendo: estado.corriendo,
    restante,
    duracionFase,
    /** 0..1 — cuánto de la fase ya transcurrió. */
    progreso: duracionFase > 0 ? 1 - restante / duracionFase : 0,
    ciclosCompletados: estado.ciclosCompletados,
    minutosEnfoque: estado.minutosEnfoque,
    foco: estado.foco,
    objetivoId: estado.objetivoId,
    config,
    /** Posición dentro de la tanda actual (1..ciclosHastaLargo). */
    cicloEnTanda: (estado.ciclosCompletados % config.ciclosHastaLargo) + 1,
    haySesion: estado.ciclosCompletados > 0 || estado.minutosEnfoque > 0,

    // acciones
    iniciar,
    pausar,
    reiniciarFase,
    saltear,
    terminarSesion,
    setFoco,
    setObjetivoId,
    setConfig,
  };
}
