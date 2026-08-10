import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import NexiaMascota from '../../NexiaMascota';
import { trazo } from '../tono';
import './primerosPasos.css';

/* ─────────────────────────────────────────────
   PRIMEROS PASOS — la guía de Nexo.

   Existe para resolver el peor momento de cualquier
   campus: el primer día, con todo vacío y sin saber
   qué se hace acá.

   Tres reglas que la hacen soportable:

   1. Los pasos NO se tildan a mano. Cada uno se da
      por hecho leyendo el estado real (¿ya tenés
      avatar? ¿ya entraste a una materia? ¿ya
      entregaste algo?). Una checklist que se tilda
      sola enseña; una que hay que tildar es tarea.

   2. Se va sola. Cuando están todos los pasos, la
      guía desaparece para siempre — no se queda
      ocupando el rail con un cartel de felicitación.

   3. Se puede cerrar en cualquier momento, y no
      vuelve. A quien ya sabe usar la app, esto le
      estorba.
───────────────────────────────────────────── */

const CLAVE_OCULTA = 'nexia:primeros-pasos-oculta';

export interface PasoGuia {
  id: string;
  titulo: string;
  /** Qué se gana con darlo. Sin esto, un paso es una orden. */
  detalle: string;
  to: string;
  /** Estado real, no una marca del usuario. */
  hecho: boolean;
}

interface PrimerosPasosProps {
  pasos: PasoGuia[];
  /** Nombre de pila, para que el saludo no sea de formulario. */
  nombre?: string;
}

const PrimerosPasos: React.FC<PrimerosPasosProps> = ({ pasos, nombre }) => {
  const [oculta, setOculta] = useState(
    () => localStorage.getItem(CLAVE_OCULTA) === '1'
  );

  const hechos = useMemo(() => pasos.filter((p) => p.hecho).length, [pasos]);
  const completa = pasos.length > 0 && hechos === pasos.length;

  const cerrar = useCallback(() => {
    localStorage.setItem(CLAVE_OCULTA, '1');
    setOculta(true);
  }, []);

  if (oculta || completa || pasos.length === 0) return null;

  // El siguiente paso pendiente es el único que se muestra abierto: una lista
  // de cinco cosas por hacer el primer día desalienta más de lo que guía.
  const siguiente = pasos.find((p) => !p.hecho);

  return (
    <section className="pp" aria-label="Primeros pasos en NEXIA">
      <button
        type="button"
        className="pp-cerrar"
        onClick={cerrar}
        aria-label="No mostrar más la guía de primeros pasos"
        title="No mostrar más"
      >
        <svg viewBox="0 0 24 24" {...trazo} strokeWidth={2.2} aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      <div className="pp-top">
        <NexiaMascota size={44} expresion="guino" animado alt="" />
        <div>
          <h2 className="pp-titulo">
            {nombre ? `Bienvenido, ${nombre}` : 'Bienvenido a NEXIA'}
          </h2>
          <p className="pp-sub">Te muestro la app en {pasos.length} pasos</p>
        </div>
      </div>

      <div className="pp-progreso">
        <div
          className="pp-barra"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={pasos.length}
          aria-valuenow={hechos}
          aria-label={`${hechos} de ${pasos.length} primeros pasos completados`}
        >
          <div
            className="pp-barra-fill"
            style={{ width: `${(hechos / pasos.length) * 100}%` }}
          />
        </div>
        <span className="pp-conteo">{hechos}/{pasos.length}</span>
      </div>

      <ol className="pp-lista">
        {pasos.map((paso) => {
          const activo = paso.id === siguiente?.id;

          return (
            <li
              key={paso.id}
              className={`pp-paso${paso.hecho ? ' pp-paso--hecho' : ''}${activo ? ' pp-paso--activo' : ''}`}
            >
              <span className="pp-marca" aria-hidden="true">
                {paso.hecho ? (
                  <svg viewBox="0 0 24 24" {...trazo} strokeWidth={3}>
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                ) : (
                  <span className="pp-punto" />
                )}
              </span>

              <div className="pp-paso-cuerpo">
                <span className="pp-paso-titulo">{paso.titulo}</span>

                {activo && (
                  <>
                    <p className="pp-paso-detalle">{paso.detalle}</p>
                    <Link to={paso.to} className="pp-paso-cta">
                      Vamos
                      <svg viewBox="0 0 24 24" {...trazo} strokeWidth={2.4} aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </>
                )}
              </div>

              {paso.hecho && <span className="pp-listo">Listo</span>}
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default PrimerosPasos;
