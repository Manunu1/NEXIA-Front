import { useCallback, useState } from 'react';
import type { MensajeBuddy } from '../../utils/buddy';

/* ─────────────────────────────────────────────
   Estado del compañero: qué mensaje está diciendo.

   Se comparte entre el rail y el coach porque las
   dos presentaciones tienen exactamente la misma
   mecánica: el usuario toca y pasa al siguiente,
   en orden de prioridad y sin autoavance.

   No rota solo a propósito. Un mensaje que cambia
   mientras lo estás leyendo no se lee, y un cartel
   que se mueve al costado de una consigna es
   directamente un obstáculo para estudiar.
───────────────────────────────────────────── */

interface MensajeRotativo {
  /** null sólo si la lista vino vacía. */
  actual: MensajeBuddy | null;
  siguiente: () => void;
  hayMas: boolean;
  /**
   * Cambia con cada mensaje. Se usa como `key` para relanzar la animación
   * de entrada: sin esto, cambiar el texto no vuelve a animar el nodo.
   */
  pulso: number;
}

export function useMensajeRotativo(mensajes: MensajeBuddy[]): MensajeRotativo {
  const [indice, setIndice] = useState(0);
  const [pulso, setPulso] = useState(0);

  // El índice se acota con módulo y NO se resetea cuando cambian los mensajes.
  // Resetearlo obligaría a comparar la identidad del array, y basta con que
  // una pantalla arme la lista inline para entrar en un bucle de renders.
  // Con módulo, una lista nueva siempre cae en un mensaje válido.
  const siguiente = useCallback(() => {
    setIndice((i) => i + 1);
    setPulso((p) => p + 1);
  }, []);

  return {
    actual: mensajes.length ? mensajes[indice % mensajes.length] : null,
    siguiente,
    hayMas: mensajes.length > 1,
    pulso,
  };
}
