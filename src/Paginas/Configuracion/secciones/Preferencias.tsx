import React, { useState } from 'react';
import { useToast } from '../../../Componentes/Toast/context';
import type { Perfil } from '../../../Types/perfil';
import { getTemaGuardado, setTema, type Tema } from '../../../utils/theme';
import { useGuardarPerfil } from '../useGuardarPerfil';

/* ─────────────────────────────────────────────
   PREFERENCIAS — apariencia y avisos.

   El tema se aplica apenas se toca (el usuario tiene
   que ver el resultado para elegir), pero recién se
   sincroniza con el backend al guardar. Por eso el
   texto aclara la diferencia entre "se ve" y "queda
   guardado en todos tus dispositivos".

   perfil = null es el caso de las cuentas sin perfil
   editable (gestor / director): mismo control, pero
   la preferencia sólo se guarda en este dispositivo.
───────────────────────────────────────────── */

const IDIOMAS = [{ value: 'es', label: 'Español' }];

/**
 * El backend todavía acepta idiomas que la interfaz aún no ofrece (hay
 * cuentas guardadas con 'en'). Sin esto el <select> quedaba en blanco.
 */
const idiomaOfrecido = (valor?: string | null) =>
  IDIOMAS.some((i) => i.value === valor) ? (valor as string) : 'es';

const IconSol = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

const IconLuna = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

interface Props {
  perfil: Perfil | null;
  onActualizado: (perfil: Perfil) => void;
}

const Preferencias: React.FC<Props> = ({ perfil, onActualizado }) => {
  const toast = useToast();
  const { guardar, guardando } = useGuardarPerfil(onActualizado);

  const [tema, setTemaLocal] = useState<Tema>(perfil?.tema ?? getTemaGuardado());
  const [idioma, setIdioma] = useState(() => idiomaOfrecido(perfil?.idioma));
  const [notiEmail, setNotiEmail] = useState(perfil?.notificaciones_email ?? true);

  const elegirTema = (t: Tema) => {
    setTemaLocal(t);
    setTema(t); // feedback inmediato
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!perfil) {
      setTema(tema);
      localStorage.setItem('idioma', idioma);
      toast.success('Preferencias guardadas en este dispositivo');
      return;
    }

    const ok = await guardar({ tema, idioma, notificaciones_email: notiEmail });
    if (ok) localStorage.setItem('idioma', idioma);
  };

  return (
    <form className="cfg-form" onSubmit={enviar}>
      <div className="cfg-setting">
        <div className="cfg-setting-info">
          <span className="cfg-setting-label">Tema</span>
          <span className="cfg-setting-sub">
            {perfil
              ? 'Se aplica al instante. Guardá para conservarlo en todos tus dispositivos.'
              : 'Se aplica al instante y se guarda en este dispositivo.'}
          </span>
        </div>
        <div className="cfg-segmented" role="radiogroup" aria-label="Tema de la interfaz">
          <button
            type="button"
            role="radio"
            aria-checked={tema === 'claro'}
            className={`cfg-segmented-opt${tema === 'claro' ? ' is-active' : ''}`}
            onClick={() => elegirTema('claro')}
          >
            {IconSol} Claro
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={tema === 'oscuro'}
            className={`cfg-segmented-opt${tema === 'oscuro' ? ' is-active' : ''}`}
            onClick={() => elegirTema('oscuro')}
          >
            {IconLuna} Oscuro
          </button>
        </div>
      </div>

      <div className="cfg-divider" />

      <div className="cfg-setting">
        <div className="cfg-setting-info">
          <span className="cfg-setting-label">Idioma</span>
          <span className="cfg-setting-sub">Idioma de la interfaz. Pronto vamos a sumar más.</span>
        </div>
        <select
          className="nx-control cfg-select"
          value={idioma}
          onChange={(e) => setIdioma(e.target.value)}
          aria-label="Idioma de la interfaz"
        >
          {IDIOMAS.map((i) => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
      </div>

      {perfil && (
        <>
          <div className="cfg-divider" />

          <div className="cfg-setting">
            <div className="cfg-setting-info">
              <span className="cfg-setting-label">Notificaciones por email</span>
              <span className="cfg-setting-sub">
                Comunicados, entregas próximas y novedades de tus materias.
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notiEmail}
              aria-label="Notificaciones por email"
              className={`cfg-switch${notiEmail ? ' is-on' : ''}`}
              onClick={() => setNotiEmail((v) => !v)}
            >
              <span className="cfg-switch-knob" />
            </button>
          </div>
        </>
      )}

      <div className="cfg-savebar">
        <button type="submit" className="cfg-btn cfg-btn--primary" disabled={guardando}>
          {guardando && <span className="cfg-btn-spinner" aria-hidden="true" />}
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
};

export default Preferencias;
