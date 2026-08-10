import React from 'react';
import { Link } from 'react-router-dom';
import AvatarAnimado from '../../AvatarAnimado';
import { useSesionUsuario } from '../../../hooks/useSesionUsuario';
import type { MensajeBuddy } from '../../../utils/buddy';
import { EXPRESION_POR_TONO, ICONO_POR_TONO, ICONO_IR, ICONO_OTRA } from '../tono';
import { useMensajeRotativo } from '../useMensajeRotativo';
import './coach.css';

/* ─────────────────────────────────────────────
   COMPAÑERO — presentación inline.

   El mismo personaje que en el rail, pero al lado
   del trabajo: bajo una consigna, al pie del
   boletín, junto al material de una materia.

   Es una franja, no una tarjeta: no compite con el
   panel que acompaña ni con la acción principal de
   la pantalla. Nunca flota, nunca tapa y nunca se
   mueve solo — quien está entregando un trabajo no
   necesita que algo se le meta en el medio.
───────────────────────────────────────────── */

interface CompaneroCoachProps {
  /** Ya ordenados por prioridad. Si viene vacío, el componente no se monta. */
  mensajes: MensajeBuddy[];
  /**
   * Rótulo de la franja. Por defecto habla en primera persona del rol que
   * cumple ahí; conviene cambiarlo sólo si la pantalla lo necesita.
   */
  rotulo?: string;
  /**
   * Apila avatar, texto y acciones. Para columnas angostas —el panel de
   * material mide 300 px— donde en fila el texto queda en tiras de tres
   * palabras. Es de contenedor, no de viewport: por eso es una prop y no
   * una media query.
   */
  compacto?: boolean;
}

const CompaneroCoach: React.FC<CompaneroCoachProps> = ({
  mensajes,
  rotulo = 'Tu compañero',
  compacto = false,
}) => {
  const usuario = useSesionUsuario();
  const { actual, siguiente, hayMas, pulso } = useMensajeRotativo(mensajes);

  if (!actual) return null;

  return (
    <section
      className={`cc cc--${actual.tono}${compacto ? ' cc--compacto' : ''}`}
      aria-label="Tu compañero NEXIA"
    >
      <AvatarAnimado
        key={pulso}
        usuario={usuario}
        size={42}
        expresion={EXPRESION_POR_TONO[actual.tono]}
        animado
        className="cc-avatar"
      />

      <div className="cc-cuerpo">
        <span className="cc-rotulo">
          <span className="cc-icono" aria-hidden="true">{ICONO_POR_TONO[actual.tono]}</span>
          {rotulo}
        </span>
        <p className="cc-texto" key={pulso} aria-live="polite">{actual.texto}</p>
      </div>

      <div className="cc-acciones">
        {actual.accion && (
          <Link to={actual.accion.to} className="cc-accion">
            {actual.accion.label}
            {ICONO_IR}
          </Link>
        )}

        {hayMas && (
          <button
            type="button"
            className="cc-otra"
            onClick={siguiente}
            aria-label="Ver otro consejo"
          >
            {ICONO_OTRA}
            <span>Otro consejo</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default CompaneroCoach;
