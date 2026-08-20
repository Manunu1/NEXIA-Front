import React, { useId } from 'react';
import type { AvatarExpresion, AvatarFrame, AvatarSize } from '../../Types/perfil';
import { mezclar, pxAvatar } from '../../utils/avatar';
import { CIRCUITO, CUELLO, ESCOTE, MIRADA_PENSANDO, REMERA } from '../NexiaAvatar/paths';
import { Chispas } from '../NexiaAvatar/piezas';
import {
  ANTENA,
  BOCA_PENSANDO,
  BRILLO_VISOR,
  CABEZA,
  NODOS_LATERALES,
  OJO_ARCO,
  OJO_DER,
  OJO_IZQ,
  OJO_R,
  SONRISA,
  SONRISA_ALEGRE,
  VISOR,
} from './paths';
import './nexiaMascota.css';

/* ─────────────────────────────────────────────
   NEXO — la mascota de NEXIA.

   Es el avatar por defecto de la app: lo ve quien
   todavía no armó el suyo, y también quien usa una
   foto de perfil (una foto no gesticula, y el
   compañero necesita una cara que sí).

   Deliberadamente NO es un humano genérico. Un
   retrato "por defecto" obliga a elegir un tono de
   piel para toda la institución; Nexo no tiene ese
   problema y además se lee siempre como la marca.

   Sin estado y sin fetch, igual que NexiaAvatar:
   sirve en el rail, en una tarjeta, en un vacío o
   en una miniatura de 28 px.
───────────────────────────────────────────── */

const NAVY = '#1A237E';
const NAVY_D = '#0D1654';
const NAVY_L = '#3949AB';
const ORANGE = '#FF9800';
const MINT = '#E0F2F1';
const VISOR_CLARO = '#EEF2FF';
const VISOR_SOMBRA = '#D7DEF7';

export interface NexiaMascotaProps {
  /** Tamaño nombrado o ancho exacto en px. */
  size?: AvatarSize | number;
  frame?: AvatarFrame;
  /** Fondo degradado detrás de la figura. */
  backdrop?: boolean;
  expresion?: AvatarExpresion;
  /**
   * Vida propia: la antena late y la figura respira. Se activa sólo donde
   * Nexo actúa como personaje (compañero, guía, vacíos); en listados y
   * miniaturas queda quieto para no convertir la pantalla en un carrusel.
   */
  animado?: boolean;
  className?: string;
  /** Texto para lectores de pantalla. Sin él, la mascota es decorativa. */
  alt?: string;
}

const NexiaMascota: React.FC<NexiaMascotaProps> = ({
  size = 'md',
  frame = 'circle',
  backdrop = true,
  expresion = 'normal',
  animado = false,
  className = '',
  alt,
}) => {
  const uid = useId().replace(/:/g, '');
  const id = (nombre: string) => `${nombre}-${uid}`;

  const ancho = pxAvatar(size);
  const alto = frame === 'full' ? Math.round(ancho * 1.5) : ancho;

  // Mismos recortes que el retrato: los dos avatares encuadran igual.
  const viewBox =
    frame === 'full' ? '0 0 160 240' : frame === 'head' ? '18 12 124 124' : '0 14 160 160';

  // Nexo tiene los mismos gestos que el retrato, resueltos con sus propias
  // piezas: si el compañero celebra con tu avatar pero no con Nexo, deja de
  // ser el mismo personaje para quien todavía no armó el suyo.
  const pensando = expresion === 'pensando';
  const celebra = expresion === 'celebrando';
  const bocaAbierta = expresion === 'alegre' || celebra;
  const bocaQuieta = pensando || expresion === 'concentrado';
  const mirada = pensando ? MIRADA_PENSANDO : { dx: 0, dy: 0 };

  const clases = [
    'nx-mascota',
    `nx-mascota--${frame}`,
    animado && 'nx-mascota--viva',
    animado && celebra && 'nx-mascota--celebra',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      className={clases}
      style={{ width: ancho, height: alto }}
    >
      <svg
        viewBox={viewBox}
        width={ancho}
        height={alto}
        role={alt ? 'img' : undefined}
        aria-label={alt}
        aria-hidden={alt ? undefined : true}
      >
        <defs>
          <linearGradient id={id('fondo')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--nx-avatar-bg1, #EEF1FB)" />
            <stop offset="100%" stopColor="var(--nx-avatar-bg2, #E2F1EF)" />
          </linearGradient>

          {/* userSpaceOnUse: cabeza y torso se pintan por separado y con
              gradiente por-elemento se vería la costura entre los dos. */}
          <linearGradient id={id('chasis')} gradientUnits="userSpaceOnUse" x1="30" y1="30" x2="130" y2="240">
            <stop offset="0%" stopColor={NAVY_L} />
            <stop offset="45%" stopColor={NAVY} />
            <stop offset="100%" stopColor={NAVY_D} />
          </linearGradient>

          <linearGradient id={id('visor')} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor={VISOR_CLARO} />
            <stop offset="100%" stopColor={VISOR_SOMBRA} />
          </linearGradient>

          <radialGradient id={id('nodo')} cx="0.35" cy="0.3" r="0.8">
            <stop offset="0%" stopColor={mezclar(ORANGE, 0.36)} />
            <stop offset="100%" stopColor={ORANGE} />
          </radialGradient>
        </defs>

        {backdrop && (
          <g>
            <rect x="0" y="0" width="160" height="240" fill={`url(#${id('fondo')})`} />
            <circle cx="132" cy="46" r="30" fill={MINT} opacity="0.34" />
          </g>
        )}

        {/* ── Antena ── */}
        <g className="nx-mascota-antena">
          <path
            d={ANTENA.tallo}
            stroke={NAVY}
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          <circle
            cx={ANTENA.nodo.cx}
            cy={ANTENA.nodo.cy}
            r={ANTENA.nodo.r}
            fill={`url(#${id('nodo')})`}
          />
        </g>

        {/* ── Nodos laterales ── */}
        {NODOS_LATERALES.map((n) => (
          <rect
            key={n.x}
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx={n.rx}
            fill={NAVY_D}
          />
        ))}

        {/* ── Cuello y torso — los mismos paths que el retrato ── */}
        <rect
          x={CUELLO.x}
          y={CUELLO.y}
          width={CUELLO.w}
          height={CUELLO.h}
          rx={CUELLO.rx}
          fill={NAVY_D}
        />
        <path d={REMERA} fill={`url(#${id('chasis')})`} />
        {/* Cuello en menta y no en navy: en el retrato humano la piel separa
            la cabeza del torso, y acá los dos son del mismo azul. Sin esta
            línea, en encuadre circular la figura se lee como una mancha. */}
        <path
          d={ESCOTE}
          fill="none"
          stroke={MINT}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.5"
        />

        <g stroke={MINT} fill={MINT} opacity="0.8">
          <circle cx={CIRCUITO.nodo1.cx} cy={CIRCUITO.nodo1.cy} r={CIRCUITO.nodo1.r} stroke="none" />
          <path d={CIRCUITO.traza} fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={CIRCUITO.nodo2.cx} cy={CIRCUITO.nodo2.cy} r={CIRCUITO.nodo2.r} stroke="none" />
        </g>

        <text
          x="80"
          y="212"
          className="nx-mascota-logo"
          textAnchor="middle"
          fill={ORANGE}
          fontSize="15"
          fontWeight="700"
          letterSpacing="1.5"
        >
          NEXIA
        </text>

        {/* ── Cabeza ── */}
        <g className="nx-mascota-cabeza">
          {/* El rim claro despega la cabeza de los hombros, que son del mismo
              azul y quedan justo detrás en el encuadre circular. */}
          <rect
            x={CABEZA.x}
            y={CABEZA.y}
            width={CABEZA.w}
            height={CABEZA.h}
            rx={CABEZA.rx}
            fill={`url(#${id('chasis')})`}
            stroke={mezclar(NAVY_L, 0.42)}
            strokeWidth="2"
            strokeOpacity="0.5"
          />

          {/* ── Visor ── */}
          <rect
            x={VISOR.x}
            y={VISOR.y}
            width={VISOR.w}
            height={VISOR.h}
            rx={VISOR.rx}
            fill={`url(#${id('visor')})`}
          />

          {/* ── Cara ── */}
          {[OJO_IZQ, OJO_DER].map((ojo, i) => {
            const cerrado = expresion === 'alegre' || (expresion === 'guino' && i === 1);

            return cerrado ? (
              <path
                key={ojo.cx}
                d={OJO_ARCO(ojo.cx, ojo.cy)}
                fill="none"
                stroke={NAVY_D}
                strokeWidth="4"
                strokeLinecap="round"
              />
            ) : (
              <g key={ojo.cx} className="nx-mascota-ojo">
                <circle
                  cx={ojo.cx + mirada.dx}
                  cy={ojo.cy + mirada.dy}
                  r={OJO_R}
                  fill={NAVY_D}
                />
                <circle
                  cx={ojo.cx + mirada.dx - 2.6}
                  cy={ojo.cy + mirada.dy - 3}
                  r="2.9"
                  fill="#FFFFFF"
                  opacity="0.92"
                />
              </g>
            );
          })}

          {bocaAbierta && <path d={SONRISA_ALEGRE} fill={NAVY_D} />}

          {bocaQuieta && (
            <path
              d={BOCA_PENSANDO}
              fill="none"
              stroke={NAVY_D}
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          )}

          {!bocaQuieta && !bocaAbierta && (
            <path
              d={SONRISA}
              fill="none"
              stroke={NAVY_D}
              strokeWidth="3.4"
              strokeLinecap="round"
            />
          )}

          {/* Reflejo — va al final para cruzar por encima de la cara */}
          <path d={BRILLO_VISOR} fill="#FFFFFF" opacity="0.22" />
        </g>

        {/* Las mismas chispas que el retrato: un logro se festeja igual */}
        {celebra && <Chispas />}
      </svg>
    </span>
  );
};

export default NexiaMascota;
