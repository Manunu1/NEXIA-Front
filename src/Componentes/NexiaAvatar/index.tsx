import React, { useId, useMemo, useRef } from 'react';
import type {
  AvatarConfig,
  AvatarExpresion,
  AvatarFrame,
  AvatarSize,
} from '../../Types/perfil';
import {
  luminancia,
  mezclar,
  normalizarAvatar,
  pxAvatar,
  sobre,
  tenir,
} from '../../utils/avatar';
import { GESTOS } from './gestos';
import { CUELLO } from './paths';
import {
  Cabeza,
  Cara,
  Chispas,
  Defs,
  Fondo,
  Lentes,
  PeloAtras,
  PeloFrente,
  Sombrero,
  Torso,
  type Detalle,
  type Paleta,
} from './piezas';
import { ritmoDe, useMiradaPuntero } from './vida';
import './nexiaAvatar.css';

/* ─────────────────────────────────────────────
   NEXIA AVATAR — retrato SVG generado a partir de
   una AvatarConfig. Sin estado, sin fetch y sin
   dependencia del formulario: sirve igual para el
   editor, la sidebar, un listado o una tarjeta de
   logro.

   Este archivo NO dibuja: decide. Ordena las capas,
   calcula la paleta y elige cuánto detalle y cuánto
   movimiento merece cada situación. El dibujo vive
   en piezas.tsx y la geometría en paths.ts.

   Tres decisiones que sostienen todo lo demás:

   · Una sola luz. Todo el volumen —piel, pelo, tela,
     contorno— se deriva del color elegido mezclando
     hacia esa luz. Cualquier combinación de config
     queda coherente sin pedirle nada al usuario.

   · Detalle por tamaño. A 28 px una peca es ruido y
     un desenfoque es costo puro; a 240 px su ausencia
     se nota. El componente ajusta solo.

   · El movimiento se pide. Por defecto el avatar está
     quieto: en un listado de treinta personas, treinta
     figuras respirando es un carrusel, no una lista.
───────────────────────────────────────────── */

const NAVY = '#1A237E';
const ORANGE = '#FF9800';
const MINT = '#E0F2F1';
/* ── Referencias de color de la piel ───────────
   Ninguna se usa pura: todas se mezclan CONTRA el
   tono elegido. Un labio rosa fijo se ve pintado en
   piel oscura y ausente en piel clara; una sombra
   gris apaga cualquier piel. Por eso la luz tira a
   dorado y la sombra a terracota: así la cara se
   siente cálida en los doce tonos del catálogo.
───────────────────────────────────────────── */
const CARMIN = '#C0705F';
const LUZ_CALIDA = '#FFE2B8';
const SOMBRA_CALIDA = '#C58163';
const SOMBRA_PROFUNDA = '#93513B';

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
  /**
   * Vida propia: respira, parpadea y se balancea. Sólo donde el avatar actúa
   * como personaje (compañero, perfil, editor); en listados queda quieto.
   */
  animado?: boolean;
  /**
   * La mirada sigue al puntero y la cabeza lo acompaña. Se apaga sola en
   * touch y con movimiento reducido. Implica `animado`.
   */
  interactivo?: boolean;
  className?: string;
  /** Texto para lectores de pantalla. Sin él, el avatar es decorativo. */
  alt?: string;
}

/** Umbrales de detalle, en px de ancho renderizado. */
const detalleDe = (px: number): Detalle => (px >= 96 ? 'alto' : px >= 44 ? 'medio' : 'bajo');

const NexiaAvatar: React.FC<NexiaAvatarProps> = ({
  config,
  size = 'md',
  frame = 'circle',
  backdrop = true,
  expresion = 'normal',
  animado = false,
  interactivo = false,
  className = '',
  alt,
}) => {
  const uid = useId().replace(/:/g, '');
  const cfg: AvatarConfig = useMemo(() => normalizarAvatar(config), [config]);
  const raiz = useRef<HTMLSpanElement>(null);

  const ancho = pxAvatar(size);
  const alto = frame === 'full' ? Math.round(ancho * 1.5) : ancho;
  const detalle = detalleDe(ancho);

  // El seguimiento de puntero no tiene sentido en una miniatura: el iris se
  // movería menos de un píxel y sólo dejaría un listener por avatar.
  const sigueAlPuntero = interactivo && ancho >= 64;
  useMiradaPuntero(raiz, sigueAlPuntero);

  const vivo = animado || interactivo;
  const gesto = GESTOS[expresion] ?? GESTOS.normal;

  // Cada encuadre recorta una zona distinta del mismo lienzo 160 × 240.
  // 'head' encuadra de y 12 (arriba del sombrero más alto) a y 144 (dos
  // puntos por debajo del mentón): más ajustado corta birretes o pera.
  const viewBox =
    frame === 'full' ? '0 0 160 240' : frame === 'head' ? '14 12 132 132' : '0 14 160 160';

  const { skin, hair, eyes, accessories, shirt_color: remera } = cfg;

  const paleta: Paleta = useMemo(() => {
    // Oscurecer una remera clara (menta, blanco) la vuelve gris: sobre colores
    // claros la sombra es mucho más suave y se agrega un contorno que la
    // despega del fondo.
    const remeraClara = luminancia(remera) > 0.5;

    return {
      piel: skin,
      pielLuz: tenir(mezclar(skin, 0.2), LUZ_CALIDA, 0.3),
      pielSombra: tenir(mezclar(skin, -0.13), SOMBRA_CALIDA, 0.22),
      pielProfunda: tenir(mezclar(skin, -0.26), SOMBRA_PROFUNDA, 0.25),

      pelo: hair.color,
      peloLuz: mezclar(hair.color, 0.2),
      peloSombra: mezclar(hair.color, -0.24),
      // Las cejas y pestañas siguen al pelo pero nunca lo copian: un pelo
      // platinado con cejas platinadas borra la mitad de la expresión, y un
      // negro puro endurece la cara entera. Van un punto más oscuras y tibias.
      tinta: tenir(mezclar(hair.color, luminancia(hair.color) > 0.45 ? -0.4 : -0.08), '#3B2A20', 0.22),

      ojos: eyes,
      labios: tenir(mezclar(skin, -0.08), CARMIN, 0.34),
      labiosLuz: tenir(mezclar(skin, 0.24), CARMIN, 0.12),
      interiorBoca: tenir(mezclar(skin, -0.5), '#6B2A26', 0.5),
      lengua: tenir(mezclar(skin, -0.15), '#C9736C', 0.55),
      rubor: tenir(skin, '#E8896F', 0.65),

      remera,
      remeraClara,
      remeraSombra: mezclar(remera, remeraClara ? -0.09 : -0.2),
      remeraBorde: mezclar(remera, remeraClara ? -0.22 : -0.34),
      // Sobre remeras claras el naranja se pierde: el logo pasa a navy.
      logo: sobre(remera, ORANGE, NAVY),
      circuito: sobre(remera, MINT, NAVY),
    };
  }, [skin, hair.color, eyes, remera]);

  const id = (nombre: string) => `${nombre}-${uid}`;

  const clases = [
    'nx-avatar',
    `nx-avatar--${frame}`,
    vivo && 'nx-avatar--vivo',
    sigueAlPuntero && 'nx-avatar--interactivo',
    vivo && gesto.celebra && 'nx-avatar--celebra',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      ref={raiz}
      className={clases}
      data-fondo={backdrop ? cfg.backdrop : 'liso'}
      style={{ width: ancho, height: alto, ...(vivo ? ritmoDe(uid) : {}) } as React.CSSProperties}
    >
      <svg
        viewBox={viewBox}
        width={ancho}
        height={alto}
        role={alt ? 'img' : undefined}
        aria-label={alt}
        aria-hidden={alt ? undefined : true}
      >
        <Defs p={paleta} id={id} detalle={detalle} />

        {backdrop && <Fondo id={id} detalle={detalle} />}

        {/* El cuerpo respira; la cabeza además se balancea. Son dos ritmos
            distintos a propósito: sincronizados, el conjunto se mueve como
            un bloque y parece un GIF. */}
        <g className="nx-a-cuerpo">
          {/* El pelo de atrás acompaña a la cabeza pero se pinta antes que el
              torso, así que lleva su misma animación en un grupo aparte. */}
          <g className="nx-a-cabeza">
            <PeloAtras estilo={hair.style} p={paleta} />
          </g>

          <rect
            x={CUELLO.x}
            y={CUELLO.y}
            width={CUELLO.w}
            height={CUELLO.h}
            rx={CUELLO.rx}
            fill={paleta.pielSombra}
          />
          {/* Sombra que la mandíbula proyecta sobre el cuello. Va acá y no
              dentro del recorte del rostro: es la única capa que se pinta
              FUERA de la cara y sin ella el mentón no apoya en nada. */}
          <ellipse cx="80" cy="145" rx="15" ry="5" fill={paleta.pielProfunda} opacity="0.35" />

          <Torso p={paleta} id={id} detalle={detalle} />

          <g className="nx-a-cabeza">
            <Cabeza p={paleta} id={id} detalle={detalle} />
            <Cara p={paleta} id={id} detalle={detalle} gesto={gesto} cfg={cfg} />
            <PeloFrente estilo={hair.style} p={paleta} id={id} detalle={detalle} />

            {accessories.glasses && <Lentes estilo={accessories.glasses} id={id} />}
            {accessories.hat && <Sombrero estilo={accessories.hat} id={id} />}
          </g>
        </g>

        {/* Sin recorte por tamaño: son seis destellos que sólo existen durante
            un logro, y el festejo tiene que verse igual en el rail de 46 px. */}
        {gesto.celebra && <Chispas />}
      </svg>
    </span>
  );
};

export default NexiaAvatar;
