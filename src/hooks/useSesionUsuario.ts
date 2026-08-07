import { useEffect, useState } from 'react';
import { EVENTO_PERFIL, getUsuarioSesion, type SesionUsuario } from '../utils/session';

/* ─────────────────────────────────────────────
   Usuario de la sesión, reactivo.

   Se resuscribe a EVENTO_PERFIL (cambios hechos en
   esta pestaña) y a 'storage' (otra pestaña), así
   la imagen y el nombre quedan sincronizados en
   toda la app sin recargar.
───────────────────────────────────────────── */

export function useSesionUsuario(): SesionUsuario | null {
  const [usuario, setUsuario] = useState<SesionUsuario | null>(getUsuarioSesion);

  useEffect(() => {
    const releer = () => setUsuario(getUsuarioSesion());

    window.addEventListener(EVENTO_PERFIL, releer);
    window.addEventListener('storage', releer);
    return () => {
      window.removeEventListener(EVENTO_PERFIL, releer);
      window.removeEventListener('storage', releer);
    };
  }, []);

  return usuario;
}
