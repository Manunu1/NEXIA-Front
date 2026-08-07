import { useCallback, useState } from 'react';
import api from '../../api';
import { useToast } from '../../Componentes/Toast/context';
import type { Perfil, PerfilEditable } from '../../Types/perfil';
import { mensajeDeError } from '../../utils/apiError';

/* ─────────────────────────────────────────────
   Guardado parcial del perfil.

   Datos personales, ubicación y preferencias pegan
   todas al mismo PUT /api/perfil/me con distintos
   campos: la llamada, el estado de carga y el aviso
   viven acá una sola vez.
───────────────────────────────────────────── */

export function useGuardarPerfil(onActualizado: (perfil: Perfil) => void) {
  const toast = useToast();
  const [guardando, setGuardando] = useState(false);

  const guardar = useCallback(
    async (cambios: PerfilEditable, exito = 'Cambios guardados'): Promise<boolean> => {
      setGuardando(true);
      try {
        const res = await api.put('/api/perfil/me', cambios);
        onActualizado(res.data.data);
        toast.success(exito);
        return true;
      } catch (err) {
        toast.error(mensajeDeError(err, 'No pudimos guardar los cambios'));
        return false;
      } finally {
        setGuardando(false);
      }
    },
    [onActualizado, toast]
  );

  return { guardar, guardando };
}
