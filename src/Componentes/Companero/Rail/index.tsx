import React from 'react';
import { Link } from 'react-router-dom';
import AvatarAnimado from '../../AvatarAnimado';
import { useSesionUsuario } from '../../../hooks/useSesionUsuario';
import type { MensajeBuddy } from '../../../utils/buddy';
import { EXPRESION_POR_TONO, ICONO_POR_TONO, ICONO_IR, ICONO_OTRA } from '../tono';
import { useMensajeRotativo } from '../useMensajeRotativo';
import './rail.css';

/* ─────────────────────────────────────────────
   COMPAÑERO — presentación de rail.

   Tu avatar (o Nexo) en el inicio, diciéndote algo
   que se ganó con tus datos.

   Deliberadamente NO es una mascota flotante que
   interrumpe: vive en el rail, no tapa nada y no
   aparece solo. El usuario decide cuándo escuchar
   otra cosa, tocándolo.

   Los mensajes los calcula quien lo monta (ver
   utils/buddy.ts); acá sólo se muestran.
───────────────────────────────────────────── */

interface CompaneroRailProps {
  /** Ya ordenados por prioridad. Si viene vacío, el componente no se monta. */
  mensajes: MensajeBuddy[];
}

const CompaneroRail: React.FC<CompaneroRailProps> = ({ mensajes }) => {
  const usuario = useSesionUsuario();
  const { actual, siguiente, hayMas, pulso } = useMensajeRotativo(mensajes);

  if (!actual) return null;

  return (
    <section className={`cr cr--${actual.tono}`} aria-label="Tu compañero NEXIA">
      <div className="cr-top">
        <button
          type="button"
          className="cr-avatar"
          onClick={siguiente}
          disabled={!hayMas}
          aria-label={hayMas ? 'Ver otro mensaje' : 'Tu compañero NEXIA'}
          title={hayMas ? 'Tocame para otro mensaje' : undefined}
        >
          {/* key: remonta el avatar en cada cambio para relanzar el rebote */}
          <AvatarAnimado
            key={pulso}
            usuario={usuario}
            size={46}
            expresion={EXPRESION_POR_TONO[actual.tono]}
            animado
            className="cr-avatar-img"
          />
        </button>

        <span className="cr-rotulo">Tu compañero</span>

        <span className="cr-icono" aria-hidden="true">
          {ICONO_POR_TONO[actual.tono]}
        </span>
      </div>

      {/* La burbuja va a lo ancho: en el rail no entra al lado del avatar
          sin partir el texto en tiras de tres palabras. */}
      <div className="cr-bubble" key={pulso}>
        <p className="cr-texto" aria-live="polite">{actual.texto}</p>
      </div>

      {(actual.accion || hayMas) && (
        <div className="cr-pie">
          {actual.accion && (
            <Link to={actual.accion.to} className="cr-accion">
              {actual.accion.label}
              {ICONO_IR}
            </Link>
          )}

          {hayMas && (
            <button type="button" className="cr-otra" onClick={siguiente}>
              Decime otra
              {ICONO_OTRA}
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default CompaneroRail;
