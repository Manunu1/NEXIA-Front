import React, { useId, useMemo } from 'react';
import type {
  AvatarConfig,
  AvatarExpresion,
  AvatarFrame,
  AvatarSize,
} from '../../Types/perfil';
import { luminancia, mezclar, normalizarAvatar, pxAvatar, sobre } from '../../utils/avatar';
import {
  BOCA_PENSANDO,
  CABEZA,
  CEJAS,
  CIRCUITO,
  CUELLO,
  DOMO_GORRA,
  DOMO_GORRO,
  ESCOTE,
  MIRADA_PENSANDO,
  NARIZ,
  OJO_DER,
  OJO_FELIZ,
  OJO_IZQ,
  PATILLA_DER,
  PATILLA_IZQ,
  PEINADOS,
  PUENTE_REDONDO,
  REMERA,
  SONRISA,
  SONRISA_ALEGRE,
  VINCHA,
  VISERA_GORRA,
} from './paths';
import './nexiaAvatar.css';

/* ─────────────────────────────────────────────
   NEXIA AVATAR — retrato SVG generado a partir de
   una AvatarConfig. Sin estado, sin fetch y sin
   dependencia del formulario: sirve igual para el
   editor, la sidebar, un listado o —a futuro— un
   ranking o una tarjeta de logro.

   Todo el color se deriva de la config: las luces y
   sombras salen de mezclar() sobre el tono elegido,
   así cualquier combinación queda coherente sin
   pedirle más decisiones al usuario.
───────────────────────────────────────────── */

const NAVY = '#1A237E';
const NAVY_D = '#0D1654';
const ORANGE = '#FF9800';
const MINT = '#E0F2F1';

export interface NexiaAvatarProps {
  /** Config del avatar. Se sanea siempre: null o incompleta cae en el default. */
  config?: AvatarConfig | string | null;
  /** Tamaño nombrado o ancho exacto en px. */
  size?: AvatarSize | number;
  /**
   * 'circle' recorta el busto en redondo (listados, sidebar, comentarios).
   * 'full' muestra la figura completa (editor, perfil).
   * 'head' acerca la cabeza — para miniaturas donde hay que distinguir
   * peinados o accesorios a pocos píxeles.
   */
  frame?: AvatarFrame;
  /** Fondo degradado detrás de la figura. */
  backdrop?: boolean;
  /** Expresión de la cara. Por defecto la neutra de siempre. */
  expresion?: AvatarExpresion;
  className?: string;
  /** Texto para lectores de pantalla. Sin él, el avatar es decorativo. */
  alt?: string;
}

const NexiaAvatar: React.FC<NexiaAvatarProps> = ({
  config,
  size = 'md',
  frame = 'circle',
  backdrop = true,
  expresion = 'normal',
  className = '',
  alt,
}) => {
  const uid = useId().replace(/:/g, '');
  const cfg: AvatarConfig = useMemo(() => normalizarAvatar(config), [config]);

  const ancho = pxAvatar(size);
  const alto = frame === 'full' ? Math.round(ancho * 1.5) : ancho;

  const pensando = expresion === 'pensando';
  const mirada = pensando ? MIRADA_PENSANDO : { dx: 0, dy: 0 };

  // Cada encuadre recorta una zona distinta del mismo lienzo 160 × 240.
  const viewBox =
    frame === 'full' ? '0 0 160 240' : frame === 'head' ? '18 12 124 124' : '0 14 160 160';

  const { skin, hair, eyes, accessories, shirt_color: remera } = cfg;
  const peinado = PEINADOS[hair.style];

  // Derivados de color — mantienen el volumen sin ensuciar la paleta.
  const pielSombra = mezclar(skin, -0.16);
  const pielLuz = mezclar(skin, 0.16);
  const peloLuz = mezclar(hair.color, 0.18);
  const peloSombra = mezclar(hair.color, -0.22);

  // Oscurecer una remera clara (menta) la vuelve gris: sobre colores claros
  // la sombra es mucho más suave y se agrega un contorno que la despega del fondo.
  const remeraClara = luminancia(remera) > 0.5;
  const remeraSombra = mezclar(remera, remeraClara ? -0.09 : -0.2);
  const remeraBorde = mezclar(remera, remeraClara ? -0.22 : -0.34);
  // Sobre remeras claras (menta, naranja) el naranja se pierde: el logo pasa a navy.
  const colorLogo = sobre(remera, ORANGE, NAVY);
  const colorCircuito = sobre(remera, MINT, NAVY);

  const id = (nombre: string) => `${nombre}-${uid}`;

  return (
    <span
      className={`nx-avatar nx-avatar--${frame} ${className}`.trim()}
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

          <linearGradient id={id('remera')} gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="240">
            <stop offset="0%" stopColor={mezclar(remera, 0.08)} />
            <stop offset="100%" stopColor={remeraSombra} />
          </linearGradient>

          {/* userSpaceOnUse: el pelo se dibuja en varias piezas (atrás, frente,
              bucles) y con gradiente por-elemento se verían las costuras. */}
          <linearGradient id={id('pelo')} gradientUnits="userSpaceOnUse" x1="30" y1="30" x2="130" y2="150">
            <stop offset="0%" stopColor={peloLuz} />
            <stop offset="55%" stopColor={hair.color} />
            <stop offset="100%" stopColor={peloSombra} />
          </linearGradient>

          <linearGradient id={id('gorro')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={mezclar(ORANGE, 0.14)} />
            <stop offset="100%" stopColor={ORANGE} />
          </linearGradient>

          <radialGradient id={id('piel')} cx="0.38" cy="0.32" r="0.78">
            <stop offset="0%" stopColor={pielLuz} />
            <stop offset="70%" stopColor={skin} />
            <stop offset="100%" stopColor={pielSombra} />
          </radialGradient>

          <linearGradient id={id('lente')} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={mezclar(NAVY, 0.22)} />
            <stop offset="100%" stopColor={NAVY_D} />
          </linearGradient>
        </defs>

        {/* ── Fondo ── */}
        {backdrop && (
          <g>
            <rect x="0" y="0" width="160" height="240" fill={`url(#${id('fondo')})`} />
            <circle cx="132" cy="46" r="30" fill={MINT} opacity="0.34" />
          </g>
        )}

        {/* ── Pelo de atrás (volumen detrás de la cabeza) ── */}
        {peinado.atras && <path d={peinado.atras} fill={peloSombra} />}

        {/* ── Cuello ── */}
        <rect
          x={CUELLO.x}
          y={CUELLO.y}
          width={CUELLO.w}
          height={CUELLO.h}
          rx={CUELLO.rx}
          fill={skin}
        />
        <ellipse cx="80" cy="137" rx="13" ry="8" fill={pielSombra} opacity="0.55" />

        {/* ── Torso ── */}
        <path
          d={REMERA}
          fill={`url(#${id('remera')})`}
          stroke={remeraClara ? remeraBorde : 'none'}
          strokeWidth="1.5"
        />
        <path
          d={ESCOTE}
          fill="none"
          stroke={remeraBorde}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Detalle de circuito — guiño tech, discreto */}
        <g stroke={colorCircuito} fill={colorCircuito} opacity="0.8">
          <circle cx={CIRCUITO.nodo1.cx} cy={CIRCUITO.nodo1.cy} r={CIRCUITO.nodo1.r} stroke="none" />
          <path d={CIRCUITO.traza} fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={CIRCUITO.nodo2.cx} cy={CIRCUITO.nodo2.cy} r={CIRCUITO.nodo2.r} stroke="none" />
        </g>

        <text
          x="80"
          y="212"
          className="nx-avatar-logo"
          textAnchor="middle"
          fill={colorLogo}
          fontSize="15"
          fontWeight="700"
          letterSpacing="1.5"
        >
          NEXIA
        </text>

        {/* ── Cabeza ── */}
        <ellipse cx="34" cy="92" rx="7" ry="9" fill={pielSombra} />
        <ellipse cx="126" cy="92" rx="7" ry="9" fill={pielSombra} />
        <circle cx={CABEZA.cx} cy={CABEZA.cy} r={CABEZA.r} fill={`url(#${id('piel')})`} />

        {/* ── Cara ── */}
        <g>
          {/* Rubor — muy sutil, sólo aporta calidez */}
          <ellipse cx="50" cy="102" rx="9" ry="6" fill={mezclar('#E8735A', 0.2)} opacity="0.22" />
          <ellipse cx="110" cy="102" rx="9" ry="6" fill={mezclar('#E8735A', 0.2)} opacity="0.22" />

          <path
            d={NARIZ}
            fill="none"
            stroke={pielSombra}
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Ojos — en 'alegre' se cierran en arco; en 'guino', sólo el derecho */}
          {[OJO_IZQ, OJO_DER].map((ojo, i) => {
            const cerrado =
              expresion === 'alegre' || (expresion === 'guino' && i === 1);

            return cerrado ? (
              <path
                key={ojo.cx}
                d={OJO_FELIZ(ojo.cx, ojo.cy)}
                fill="none"
                stroke={mezclar(skin, -0.6)}
                strokeWidth="3.4"
                strokeLinecap="round"
              />
            ) : (
              <g key={ojo.cx}>
                <ellipse cx={ojo.cx} cy={ojo.cy} rx="9" ry="10.5" fill="#FFFFFF" />
                {/* Sólo el iris sigue la mirada: mover también la esclerótica
                    haría girar el ojo entero y parecería un tic. */}
                <circle cx={ojo.cx + mirada.dx} cy={ojo.cy + 0.5 + mirada.dy} r="5.4" fill={eyes} />
                <circle cx={ojo.cx + mirada.dx} cy={ojo.cy + 0.5 + mirada.dy} r="2.4" fill="#101828" />
                <circle
                  cx={ojo.cx + mirada.dx - 1.9}
                  cy={ojo.cy + mirada.dy - 2.6}
                  r="1.9"
                  fill="#FFFFFF"
                />
              </g>
            );
          })}

          {expresion === 'alegre' && <path d={SONRISA_ALEGRE} fill={mezclar(skin, -0.62)} />}

          {pensando && (
            <path
              d={BOCA_PENSANDO}
              fill="none"
              stroke={mezclar(skin, -0.55)}
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {!pensando && expresion !== 'alegre' && (
            <path
              d={SONRISA}
              fill="none"
              stroke={mezclar(skin, -0.55)}
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* Cejas — el rapado no las pinta al ras, así que van siempre */}
          <g fill="none" stroke={peloSombra} strokeWidth="4" strokeLinecap="round">
            <path d={CEJAS.izq} />
            <path d={CEJAS.der} />
          </g>
        </g>

        {/* ── Pelo de adelante ── */}
        <g fill={`url(#${id('pelo')})`}>
          <path d={peinado.frente} />
          {peinado.bucles?.map((b) => (
            <circle key={`${b.cx}-${b.cy}`} cx={b.cx} cy={b.cy} r={b.r} />
          ))}
        </g>

        {/* ── Lentes ── */}
        {accessories.glasses && (
          <g
            stroke={NAVY}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {accessories.glasses === 'redondos' && (
              <>
                <circle cx={OJO_IZQ.cx} cy={OJO_IZQ.cy} r="13.5" fill="#FFFFFF" fillOpacity="0.18" />
                <circle cx={OJO_DER.cx} cy={OJO_DER.cy} r="13.5" fill="#FFFFFF" fillOpacity="0.18" />
                <path d={PUENTE_REDONDO} />
                <path d={PATILLA_IZQ} />
                <path d={PATILLA_DER} />
              </>
            )}

            {accessories.glasses === 'cuadrados' && (
              <>
                <rect x="48.5" y="77" width="29" height="22" rx="6" fill="#FFFFFF" fillOpacity="0.18" />
                <rect x="82.5" y="77" width="29" height="22" rx="6" fill="#FFFFFF" fillOpacity="0.18" />
                <path d="M 77.5 85 L 82.5 85" />
                <path d={PATILLA_IZQ} />
                <path d={PATILLA_DER} />
              </>
            )}

            {accessories.glasses === 'sol' && (
              <>
                <rect
                  x="47"
                  y="76"
                  width="31"
                  height="23"
                  rx="9"
                  fill={`url(#${id('lente')})`}
                  fillOpacity="0.95"
                />
                <rect
                  x="82"
                  y="76"
                  width="31"
                  height="23"
                  rx="9"
                  fill={`url(#${id('lente')})`}
                  fillOpacity="0.95"
                />
                <path d="M 78 84 L 82 84" />
                <path d={PATILLA_IZQ} />
                <path d={PATILLA_DER} />
                {/* Reflejo — le da el brillo que distingue los lentes de sol */}
                <g stroke="#FFFFFF" strokeWidth="3" opacity="0.4" strokeLinecap="round">
                  <path d="M 54 94 L 62 82" />
                  <path d="M 89 94 L 97 82" />
                </g>
              </>
            )}
          </g>
        )}

        {/* ── Sombreros ── */}
        {accessories.hat === 'nexia' && (
          <g>
            <path d={DOMO_GORRO} fill={`url(#${id('gorro')})`} />
            <rect x="26" y="55" width="108" height="19" rx="9" fill={NAVY} />
            <text
              x="80"
              y="68.5"
              className="nx-avatar-logo"
              textAnchor="middle"
              fill={ORANGE}
              fontSize="10"
              fontWeight="700"
              letterSpacing="1.5"
            >
              NEXIA
            </text>
          </g>
        )}

        {accessories.hat === 'gorra' && (
          <g>
            <path d={VISERA_GORRA} fill={NAVY_D} />
            <path d={DOMO_GORRA} fill={NAVY} />
            <rect x="29" y="56" width="102" height="14" rx="7" fill={NAVY_D} />
            <circle cx="80" cy="25" r="4" fill={ORANGE} />
          </g>
        )}

        {accessories.hat === 'vincha' && (
          <path d={VINCHA} fill={MINT} stroke={NAVY} strokeWidth="2.4" strokeLinejoin="round" />
        )}
      </svg>
    </span>
  );
};

export default NexiaAvatar;
