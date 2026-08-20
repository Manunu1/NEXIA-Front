import React from 'react';
import type { AvatarConfig, HairStyle } from '../../Types/perfil';
import { mezclar, tenir } from '../../utils/avatar';
import type { Gesto } from './gestos';
import {
  AURICULARES,
  BANDA_GORRA,
  BANDA_GORRO,
  BEANIE,
  BIRRETE,
  BOCA,
  CEJAS,
  CHISPAS,
  CIRCUITO,
  CONTORNO_LUZ,
  DESTELLO,
  DOMO_GORRA,
  DOMO_GORRO,
  ESCOTE,
  IRIS_R,
  LENTE_AVIADOR,
  LENTE_CUADRADO,
  LENTE_GATO,
  LENTE_REDONDO_R,
  LENTE_SOL,
  LUNAR,
  MECHON,
  NARIZ,
  OJO_DER,
  OJO_FELIZ,
  OJO_FORMA,
  OJO_INFERIOR,
  OJO_IZQ,
  OJO_LINEA,
  OJO_PARPADO,
  OJO_PARPADO_BORDE,
  OJO_PESTANIA,
  OREJA,
  PATILLA_DER,
  PATILLA_IZQ,
  PECAS,
  PEINADOS,
  PELO_OFFSET,
  PLIEGUES,
  POMULOS,
  PUENTE_REDONDO,
  PUPILA_R,
  REMERA,
  ROSTRO,
  RUBOR,
  SOMBRA_HOMBROS,
  VELLO_FACIAL,
  VINCHA,
  VISERA_GORRA,
} from './paths';
// Las piezas traen su hoja: Nexo monta <Chispas /> sin montar <NexiaAvatar />,
// y sin este import se quedaría sin los keyframes de la celebración.
import './nexiaAvatar.css';

/* ─────────────────────────────────────────────
   PIEZAS DEL RETRATO.

   Cada parte del avatar es un componente chico y
   sin estado que recibe la paleta ya calculada y el
   nivel de detalle. Separarlas del orquestador tiene
   dos motivos concretos:

   · el render de <NexiaAvatar /> se lee como una
     lista de capas, en el orden en que se pintan;
   · agregar un sombrero o un peinado toca UNA pieza
     y no un archivo de 600 líneas.

   Criterio de dibujo: TODO tenue. Las sombras nunca
   pasan de un tercio de opacidad y los trazos de los
   rasgos son finos. El volumen se construye con
   muchas capas suaves, no con dos capas fuertes —
   ese es exactamente el salto entre "figurita" e
   "ilustración".
───────────────────────────────────────────── */

const NAVY = '#1A237E';
const NAVY_D = '#0D1654';
const NAVY_L = '#3949AB';
const ORANGE = '#FF9800';
const MINT = '#E0F2F1';

/**
 * Nivel de detalle. No es una preferencia: es una decisión de legibilidad y
 * de costo. Una peca de 1 px en un avatar de 28 px es ruido, y veinte filtros
 * de desenfoque en un listado son veinte capas que el navegador rasteriza.
 */
export type Detalle = 'bajo' | 'medio' | 'alto';

export interface Paleta {
  piel: string;
  pielLuz: string;
  pielSombra: string;
  pielProfunda: string;
  pelo: string;
  peloLuz: string;
  peloSombra: string;
  /** Tinta de cejas y pestañas — deriva del pelo, nunca es negro puro. */
  tinta: string;
  ojos: string;
  labios: string;
  labiosLuz: string;
  interiorBoca: string;
  lengua: string;
  rubor: string;
  remera: string;
  remeraSombra: string;
  remeraBorde: string;
  remeraClara: boolean;
  logo: string;
  circuito: string;
}

/** Traduce un nombre de gradiente/filtro al id único de esta instancia. */
export type Id = (nombre: string) => string;

/* ── Definiciones ──────────────────────────── */

export const Defs: React.FC<{ p: Paleta; id: Id; detalle: Detalle }> = ({ p, id, detalle }) => (
  <defs>
    <linearGradient id={id('fondo')} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="var(--nx-avatar-bg1, #EEF1FB)" />
      <stop offset="100%" stopColor="var(--nx-avatar-bg2, #E2F1EF)" />
    </linearGradient>

    <linearGradient id={id('remera')} gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="240">
      <stop offset="0%" stopColor={mezclar(p.remera, 0.08)} />
      <stop offset="100%" stopColor={p.remeraSombra} />
    </linearGradient>

    {/* userSpaceOnUse: el pelo se dibuja en varias piezas (atrás, frente,
        bucles) y con gradiente por-elemento se verían las costuras. */}
    <linearGradient id={id('pelo')} gradientUnits="userSpaceOnUse" x1="32" y1="26" x2="128" y2="148">
      <stop offset="0%" stopColor={p.peloLuz} />
      <stop offset="52%" stopColor={p.pelo} />
      <stop offset="100%" stopColor={p.peloSombra} />
    </linearGradient>

    {/* La piel se ilumina desde arriba-izquierda: la misma dirección de luz
        que el pelo, el torso y el rim del contorno. Una sola luz coherente
        es la diferencia entre "ilustración" y "figurita". */}
    <radialGradient id={id('piel')} gradientUnits="userSpaceOnUse" cx="66" cy="70" r="82">
      <stop offset="0%" stopColor={p.pielLuz} />
      <stop offset="58%" stopColor={p.piel} />
      <stop offset="100%" stopColor={p.pielSombra} />
    </radialGradient>

    <radialGradient id={id('iris')} cx="0.5" cy="0.62" r="0.62">
      <stop offset="0%" stopColor={mezclar(p.ojos, 0.4)} />
      <stop offset="62%" stopColor={p.ojos} />
      <stop offset="100%" stopColor={mezclar(p.ojos, -0.28)} />
    </radialGradient>

    {/* La esclerótica no es blanca: un blanco puro al lado de la piel se ve
        como un agujero, y en pieles oscuras convierte la mirada en un susto.
        Va teñida con el propio tono de piel y sombreada arriba. */}
    <linearGradient id={id('esclera')} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={tenir('#E4DED7', p.piel, 0.18)} />
      <stop offset="45%" stopColor={tenir('#FBF8F5', p.piel, 0.08)} />
      <stop offset="100%" stopColor={tenir('#F1ECE7', p.piel, 0.14)} />
    </linearGradient>

    <linearGradient id={id('gorro')} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={mezclar(ORANGE, 0.14)} />
      <stop offset="100%" stopColor={ORANGE} />
    </linearGradient>

    <linearGradient id={id('lente')} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor={mezclar(NAVY, 0.22)} />
      <stop offset="100%" stopColor={NAVY_D} />
    </linearGradient>

    <linearGradient id={id('metal')} gradientUnits="userSpaceOnUse" x1="20" y1="34" x2="140" y2="120">
      <stop offset="0%" stopColor={NAVY_L} />
      <stop offset="55%" stopColor={NAVY} />
      <stop offset="100%" stopColor={NAVY_D} />
    </linearGradient>

    {/* Los desenfoques sólo existen en tamaño grande: son el 90 % del costo
        de rasterizado y por debajo de 96 px no se distinguen. */}
    {detalle === 'alto' && (
      <>
        <filter id={id('suave')} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id={id('suave-xl')} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </>
    )}

    <clipPath id={id('cara')}>
      <path d={ROSTRO} />
    </clipPath>
  </defs>
);

/* ── Fondo ─────────────────────────────────── */

export const Fondo: React.FC<{ id: Id; detalle: Detalle }> = ({ id, detalle }) => (
  <g className="nx-a-fondo">
    <rect x="0" y="0" width="160" height="240" fill={`url(#${id('fondo')})`} />
    <circle className="nx-a-halo" cx="132" cy="46" r="30" fill="var(--nx-avatar-halo, #E0F2F1)" opacity="0.3" />
    {detalle !== 'bajo' && (
      <circle
        cx="80"
        cy="150"
        r="86"
        fill="none"
        stroke="var(--nx-avatar-halo, #E0F2F1)"
        strokeWidth="1.5"
        opacity="0.32"
      />
    )}
  </g>
);

/* ── Torso ─────────────────────────────────── */

export const Torso: React.FC<{ p: Paleta; id: Id; detalle: Detalle }> = ({ p, id, detalle }) => (
  <g>
    <path
      d={REMERA}
      fill={`url(#${id('remera')})`}
      stroke={p.remeraClara ? p.remeraBorde : 'none'}
      strokeWidth="1.5"
    />

    {detalle !== 'bajo' && (
      <>
        <g fill={p.remeraBorde} opacity="0.26">
          {SOMBRA_HOMBROS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g fill="none" stroke={p.remeraBorde} strokeWidth="1.6" strokeLinecap="round" opacity="0.28">
          {PLIEGUES.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </>
    )}

    <path
      d={ESCOTE}
      fill="none"
      stroke={p.remeraBorde}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.7"
    />

    {/* Detalle de circuito — guiño tech, discreto */}
    {detalle !== 'bajo' && (
      <g stroke={p.circuito} fill={p.circuito} opacity="0.75">
        <circle cx={CIRCUITO.nodo1.cx} cy={CIRCUITO.nodo1.cy} r={CIRCUITO.nodo1.r} stroke="none" />
        <path d={CIRCUITO.traza} fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={CIRCUITO.nodo2.cx} cy={CIRCUITO.nodo2.cy} r={CIRCUITO.nodo2.r} stroke="none" />
      </g>
    )}

    {/* El logo pisa fuerte si es grande: es una remera, no un cartel. */}
    <text
      x="80"
      y="212"
      className="nx-avatar-logo"
      textAnchor="middle"
      fill={p.logo}
      fontSize="13"
      fontWeight="700"
      letterSpacing="1.3"
      opacity="0.9"
    >
      NEXIA
    </text>
  </g>
);

/* ── Cabeza ────────────────────────────────── */

export const Cabeza: React.FC<{ p: Paleta; id: Id; detalle: Detalle }> = ({ p, id, detalle }) => (
  <g>
    {/* Orejas: detrás del rostro, para que la silueta las tape en su nacimiento */}
    <g fill={p.pielSombra}>
      <path d={OREJA.izq} />
      <path d={OREJA.der} />
    </g>
    {detalle !== 'bajo' && (
      <g fill="none" stroke={p.pielProfunda} strokeWidth="1.4" strokeLinecap="round" opacity="0.5">
        <path d={OREJA.izqInterior} />
        <path d={OREJA.derInterior} />
      </g>
    )}

    <path d={ROSTRO} fill={`url(#${id('piel')})`} />

    {/* Modelado del volumen. Todo recortado al rostro: son manchas grandes y
        desenfocadas que fuera del clip se verían como halos sueltos. */}
    <g clipPath={`url(#${id('cara')})`}>
      {detalle === 'alto' && (
        <>
          {/* Oclusión del contorno: oscurece el borde y hunde los lados */}
          <path
            d={ROSTRO}
            fill="none"
            stroke={p.pielProfunda}
            strokeWidth="9"
            opacity="0.18"
            filter={`url(#${id('suave')})`}
          />
          {/* Sombra que proyecta el pelo sobre la frente. Muy tenue: subida
              de opacidad se convierte en una banda gris y la frente deja de
              leerse como piel. */}
          <ellipse
            cx="80"
            cy="44"
            rx="52"
            ry="17"
            fill={p.pielProfunda}
            opacity="0.2"
            filter={`url(#${id('suave-xl')})`}
          />
          {/* Pómulos */}
          <g fill={p.pielSombra} opacity="0.3" filter={`url(#${id('suave')})`}>
            {POMULOS.map((o) => (
              <ellipse key={o.cx} cx={o.cx} cy={o.cy} rx={o.rx} ry={o.ry} />
            ))}
          </g>
          {/* Luz de borde del lado iluminado */}
          <path
            d={CONTORNO_LUZ}
            fill="none"
            stroke={p.pielLuz}
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.5"
            filter={`url(#${id('suave')})`}
          />
        </>
      )}

      {/* Sombra del mentón sobre el cuello — existe en todos los tamaños:
          sin ella la cabeza flota sobre el torso. */}
      <ellipse cx="80" cy="146" rx="24" ry="9" fill={p.pielProfunda} opacity="0.26" />
    </g>
  </g>
);

/* ── Cara ──────────────────────────────────── */

interface CaraProps {
  p: Paleta;
  id: Id;
  detalle: Detalle;
  gesto: Gesto;
  cfg: AvatarConfig;
}

const Ojo: React.FC<{
  p: Paleta;
  id: Id;
  detalle: Detalle;
  gesto: Gesto;
  indice: 0 | 1;
}> = ({ p, id, detalle, gesto, indice }) => {
  const { cx, cy } = indice === 0 ? OJO_IZQ : OJO_DER;
  const lado: -1 | 1 = indice === 0 ? -1 : 1;
  const cerrado = gesto.ojos === 'arco' || (gesto.ojos === 'guino' && indice === 1);

  if (cerrado) {
    return (
      <path
        d={OJO_FELIZ(cx, cy)}
        fill="none"
        stroke={p.tinta}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    );
  }

  return (
    <g>
      <clipPath id={id(`ojo${indice}`)}>
        <path d={OJO_FORMA(cx, cy)} />
      </clipPath>

      <path d={OJO_FORMA(cx, cy)} fill={`url(#${id('esclera')})`} />

      <g clipPath={`url(#${id(`ojo${indice}`)})`}>
        {/* Tres capas de transformación, cada una con su responsabilidad:
            la de afuera sigue al puntero (variable CSS), la del medio aplica
            el gesto (atributo SVG) y la de adentro tiene la deriva ociosa. */}
        <g className="nx-a-mirada">
          <g transform={`translate(${gesto.mirada.dx} ${gesto.mirada.dy})`}>
            <g className="nx-a-iris">
              <circle cx={cx} cy={cy + 0.3} r={IRIS_R} fill={`url(#${id('iris')})`} />
              {detalle !== 'bajo' && (
                <circle
                  cx={cx}
                  cy={cy + 0.3}
                  r={IRIS_R - 0.45}
                  fill="none"
                  stroke={mezclar(p.ojos, -0.45)}
                  strokeWidth="0.9"
                  opacity="0.6"
                />
              )}
              <circle cx={cx} cy={cy + 0.3} r={PUPILA_R} fill="#14100E" />
              <circle cx={cx - 1.7} cy={cy - 1.8} r="1.45" fill="#FFFFFF" opacity="0.9" />
              {detalle !== 'bajo' && (
                <circle cx={cx + 1.7} cy={cy + 2} r="0.75" fill="#FFFFFF" opacity="0.45" />
              )}
            </g>
          </g>
        </g>

        {/* Sombra que el párpado proyecta sobre el globo */}
        {detalle !== 'bajo' && (
          <ellipse cx={cx} cy={cy - 5.6} rx="9.5" ry="4.6" fill={p.pielProfunda} opacity="0.18" />
        )}

        {/* Párpado: en reposo apenas toca el iris; al parpadear baja entero */}
        <g className="nx-a-parpado">
          <path d={OJO_PARPADO(cx, cy)} fill={p.piel} />
          <path
            d={OJO_PARPADO_BORDE(cx, cy)}
            fill="none"
            stroke={p.tinta}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      </g>

      <path
        d={OJO_LINEA(cx, cy)}
        fill="none"
        stroke={p.tinta}
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      {detalle !== 'bajo' && (
        <path
          d={OJO_INFERIOR(cx, cy)}
          fill="none"
          stroke={p.pielProfunda}
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.4"
        />
      )}

      {detalle === 'alto' && (
        <path
          d={OJO_PESTANIA(cx, cy, lado)}
          fill="none"
          stroke={p.tinta}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.85"
        />
      )}
    </g>
  );
};

const Boca: React.FC<{ p: Paleta; detalle: Detalle; gesto: Gesto }> = ({ p, detalle, gesto }) => {
  if (gesto.boca === 'abierta') {
    return (
      <g>
        <path d={BOCA.abierta} fill={p.interiorBoca} />
        <ellipse
          cx={BOCA.lengua.cx}
          cy={BOCA.lengua.cy}
          rx={BOCA.lengua.rx}
          ry={BOCA.lengua.ry}
          fill={p.lengua}
        />
        <path d={BOCA.dientes} fill="#FCFAF7" />
        <path
          d={BOCA.abierta}
          fill="none"
          stroke={p.labios}
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </g>
    );
  }

  if (gesto.boca === 'quieta' || gesto.boca === 'firme') {
    return (
      <path
        d={gesto.boca === 'quieta' ? BOCA.quieta : BOCA.firme}
        fill="none"
        stroke={p.labios}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    );
  }

  return (
    <g>
      <path d={BOCA.labios} fill={p.labios} />
      {detalle !== 'bajo' && (
        <ellipse cx="80" cy="120.2" rx="5" ry="1.5" fill={p.labiosLuz} opacity="0.45" />
      )}
      <path
        d={BOCA.union}
        fill="none"
        stroke={mezclar(p.labios, -0.28)}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </g>
  );
};

export const Cara: React.FC<CaraProps> = ({ p, id, detalle, gesto, cfg }) => (
  <g>
    {/* Rubor — apenas insinuado: da calidez sin caer en tono infantil */}
    <g fill={p.rubor} opacity={gesto.rubor}>
      {RUBOR.map((r) => (
        <ellipse key={r.cx} cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry} />
      ))}
    </g>

    {/* Nariz — no se dibuja, se ilumina */}
    <g>
      {detalle !== 'bajo' && (
        <ellipse
          cx={NARIZ.luz.cx}
          cy={NARIZ.luz.cy}
          rx={NARIZ.luz.rx}
          ry={NARIZ.luz.ry}
          fill={p.pielLuz}
          opacity="0.5"
          filter={detalle === 'alto' ? `url(#${id('suave')})` : undefined}
        />
      )}
      <path
        d={NARIZ.sombra}
        fill="none"
        stroke={p.pielSombra}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      {detalle !== 'bajo' && (
        <path
          d={NARIZ.base}
          fill="none"
          stroke={p.pielProfunda}
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.4"
        />
      )}
    </g>

    {/* Marcas del rostro */}
    {detalle !== 'bajo' && cfg.marks === 'pecas' && (
      <g fill={mezclar(p.piel, -0.3)} opacity="0.5">
        {PECAS.map((f) => (
          <circle key={`${f.cx}-${f.cy}`} cx={f.cx} cy={f.cy} r={f.r} />
        ))}
      </g>
    )}
    {detalle !== 'bajo' && cfg.marks === 'lunar' && (
      <circle cx={LUNAR.cx} cy={LUNAR.cy} r={LUNAR.r} fill={mezclar(p.piel, -0.48)} opacity="0.8" />
    )}

    <Ojo p={p} id={id} detalle={detalle} gesto={gesto} indice={0} />
    <Ojo p={p} id={id} detalle={detalle} gesto={gesto} indice={1} />

    <Boca p={p} detalle={detalle} gesto={gesto} />

    {/* Vello facial — sobre la boca, debajo del pelo */}
    {cfg.facial_hair && (
      <g fill={mezclar(p.pelo, -0.06)} opacity="0.92">
        {VELLO_FACIAL[cfg.facial_hair].map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    )}

    {/* Cejas — el rapado no las pinta al ras, así que van siempre.
        La asimetría entre las dos es lo que convierte un gesto en una cara. */}
    <g fill={p.tinta} className="nx-a-cejas" opacity="0.92">
      <path d={CEJAS.izq} transform={`translate(0 ${gesto.cejas})`} />
      <path d={CEJAS.der} transform={`translate(0 ${gesto.cejas + (gesto.cejaDer ?? 0)})`} />
    </g>
  </g>
);

/* ── Pelo ──────────────────────────────────── */

export const PeloAtras: React.FC<{ estilo: HairStyle; p: Paleta }> = ({ estilo, p }) => {
  const peinado = PEINADOS[estilo];
  if (!peinado.atras) return null;
  return (
    <g transform={`translate(0 ${PELO_OFFSET})`}>
      <path d={peinado.atras} fill={p.peloSombra} />
    </g>
  );
};

export const PeloFrente: React.FC<{ estilo: HairStyle; p: Paleta; id: Id; detalle: Detalle }> = ({
  estilo,
  p,
  id,
  detalle,
}) => {
  const peinado = PEINADOS[estilo];
  const mechon = MECHON[estilo];

  return (
    <g transform={`translate(0 ${PELO_OFFSET})`}>
      {/* El clip se arma sólo con las piezas de adelante: incluir el volumen
          de atrás dejaría que el brillo pintara sobre la frente. */}
      <clipPath id={id('pelo-clip')}>
        <path d={peinado.frente} />
        {peinado.bucles?.map((b) => (
          <circle key={`${b.cx}-${b.cy}`} cx={b.cx} cy={b.cy} r={b.r} />
        ))}
      </clipPath>

      <g fill={`url(#${id('pelo')})`}>
        <path d={peinado.frente} />
        {peinado.bucles?.map((b) => (
          <circle key={`${b.cx}-${b.cy}`} cx={b.cx} cy={b.cy} r={b.r} />
        ))}
      </g>

      {/* Brillo especular: dos manchas claras recortadas a la silueta del
          peinado. Un solo recurso que funciona para los diez estilos. */}
      {detalle === 'alto' && (
        <g clipPath={`url(#${id('pelo-clip')})`} filter={`url(#${id('suave-xl')})`}>
          {/* Muy difuso y sobre la coronilla: bajando o endureciendo esta
              mancha aparece una raya diagonal que se lee como una entrada. */}
          <ellipse cx="62" cy="46" rx="26" ry="11" transform="rotate(-20 62 46)" fill={p.peloLuz} opacity="0.34" />
          <ellipse cx="104" cy="60" rx="13" ry="5.5" transform="rotate(30 104 60)" fill={p.peloLuz} opacity="0.2" />
          <ellipse cx="80" cy="126" rx="46" ry="18" fill={p.peloSombra} opacity="0.3" />
        </g>
      )}

      {/* Mechón suelto: la única parte del pelo con inercia propia */}
      {mechon && detalle !== 'bajo' && (
        <path className="nx-a-mechon" d={mechon} fill={`url(#${id('pelo')})`} opacity="0.95" />
      )}

      {peinado.lazos && (
        <g fill={mezclar(p.pelo, -0.4)}>
          {peinado.lazos.map((l) => (
            <rect key={`${l.x}-${l.y}`} x={l.x} y={l.y} width={l.w} height={l.h} rx={l.rx} />
          ))}
        </g>
      )}
    </g>
  );
};

/* ── Lentes ────────────────────────────────── */

export const Lentes: React.FC<{ estilo: NonNullable<AvatarConfig['accessories']['glasses']>; id: Id }> = ({
  estilo,
  id,
}) => (
  <g stroke={NAVY} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {estilo === 'redondos' && (
      <>
        <circle cx={OJO_IZQ.cx} cy={OJO_IZQ.cy} r={LENTE_REDONDO_R} fill="#FFFFFF" fillOpacity="0.16" />
        <circle cx={OJO_DER.cx} cy={OJO_DER.cy} r={LENTE_REDONDO_R} fill="#FFFFFF" fillOpacity="0.16" />
        <path d={PUENTE_REDONDO} />
        <path d={PATILLA_IZQ} />
        <path d={PATILLA_DER} />
      </>
    )}

    {estilo === 'cuadrados' && (
      <>
        <rect {...LENTE_CUADRADO.izq} fill="#FFFFFF" fillOpacity="0.16" />
        <rect {...LENTE_CUADRADO.der} fill="#FFFFFF" fillOpacity="0.16" />
        <path d={LENTE_CUADRADO.puente} />
        <path d={PATILLA_IZQ} />
        <path d={PATILLA_DER} />
      </>
    )}

    {estilo === 'gato' && (
      <>
        <path d={LENTE_GATO.izq} fill="#FFFFFF" fillOpacity="0.18" />
        <path d={LENTE_GATO.der} fill="#FFFFFF" fillOpacity="0.18" />
        <path d={LENTE_GATO.puente} />
        <path d={PATILLA_IZQ} />
        <path d={PATILLA_DER} />
      </>
    )}

    {estilo === 'aviador' && (
      <g stroke={mezclar(ORANGE, -0.16)} strokeWidth="2.2">
        <path d={LENTE_AVIADOR.izq} fill="#FFFFFF" fillOpacity="0.2" />
        <path d={LENTE_AVIADOR.der} fill="#FFFFFF" fillOpacity="0.2" />
        <path d={LENTE_AVIADOR.barra} />
        <path d={LENTE_AVIADOR.puente} />
        <path d={PATILLA_IZQ} />
        <path d={PATILLA_DER} />
      </g>
    )}

    {estilo === 'sol' && (
      <>
        <rect {...LENTE_SOL.izq} fill={`url(#${id('lente')})`} fillOpacity="0.95" />
        <rect {...LENTE_SOL.der} fill={`url(#${id('lente')})`} fillOpacity="0.95" />
        <path d={LENTE_SOL.puente} />
        <path d={PATILLA_IZQ} />
        <path d={PATILLA_DER} />
        {/* Reflejo — le da el brillo que distingue los lentes de sol */}
        <g stroke="#FFFFFF" strokeWidth="2.6" opacity="0.38" strokeLinecap="round">
          {LENTE_SOL.reflejos.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </>
    )}
  </g>
);

/* ── Sombreros ─────────────────────────────── */

export const Sombrero: React.FC<{ estilo: NonNullable<AvatarConfig['accessories']['hat']>; id: Id }> = ({
  estilo,
  id,
}) => {
  if (estilo === 'nexia') {
    return (
      <g>
        <path d={DOMO_GORRO} fill={`url(#${id('gorro')})`} />
        <rect {...BANDA_GORRO} fill={NAVY} />
        <text
          x="80"
          y="66.5"
          className="nx-avatar-logo"
          textAnchor="middle"
          fill={ORANGE}
          fontSize="9.5"
          fontWeight="700"
          letterSpacing="1.4"
        >
          NEXIA
        </text>
      </g>
    );
  }

  if (estilo === 'gorra') {
    return (
      <g>
        <path d={VISERA_GORRA} fill={NAVY_D} />
        <path d={DOMO_GORRA} fill={`url(#${id('metal')})`} />
        <rect {...BANDA_GORRA} fill={NAVY_D} />
        <circle cx="80" cy="25" r="3.6" fill={ORANGE} />
      </g>
    );
  }

  if (estilo === 'vincha') {
    return <path d={VINCHA} fill={MINT} stroke={NAVY} strokeWidth="2.2" strokeLinejoin="round" />;
  }

  if (estilo === 'beanie') {
    return (
      <g>
        {/* Cuerpo en azul medio y puño en menta: al revés —lana menta sobre
            fondo claro— el gorro desaparecía y sólo se veía el pompón. */}
        <path d={BEANIE.domo} fill={NAVY_L} />
        <g fill="none" stroke={mezclar(NAVY_L, -0.2)} strokeWidth="1.8" strokeLinecap="round">
          {BEANIE.costuras.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <rect
          x={BEANIE.puno.x}
          y={BEANIE.puno.y}
          width={BEANIE.puno.w}
          height={BEANIE.puno.h}
          rx={BEANIE.puno.rx}
          fill={MINT}
        />
        <circle cx={BEANIE.pompon.cx} cy={BEANIE.pompon.cy} r={BEANIE.pompon.r} fill={ORANGE} />
      </g>
    );
  }

  if (estilo === 'auriculares') {
    return (
      <g>
        <path
          d={AURICULARES.diadema}
          fill="none"
          stroke={`url(#${id('metal')})`}
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={AURICULARES.brillo}
          fill="none"
          stroke={mezclar(NAVY_L, 0.4)}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.5"
        />
        {[AURICULARES.copaIzq, AURICULARES.copaDer].map((c) => (
          <rect key={c.x} x={c.x} y={c.y} width={c.w} height={c.h} rx={c.rx} fill={NAVY_D} />
        ))}
        {[AURICULARES.almohadaIzq, AURICULARES.almohadaDer].map((a) => (
          <ellipse key={a.cx} cx={a.cx} cy={a.cy} rx={a.rx} ry={a.ry} fill={MINT} opacity="0.85" />
        ))}
        <circle
          className="nx-a-led"
          cx={AURICULARES.luz.cx}
          cy={AURICULARES.luz.cy}
          r={AURICULARES.luz.r}
          fill={ORANGE}
        />
      </g>
    );
  }

  return (
    <g>
      <path d={BIRRETE.base} fill={NAVY} />
      <path d={BIRRETE.tabla} fill={`url(#${id('metal')})`} />
      <circle cx={BIRRETE.boton.cx} cy={BIRRETE.boton.cy} r={BIRRETE.boton.r} fill={ORANGE} />
      <g className="nx-a-borla">
        <path d={BIRRETE.borla} fill="none" stroke={ORANGE} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx={BIRRETE.pompon.cx} cy={BIRRETE.pompon.cy} r={BIRRETE.pompon.r} fill={ORANGE} />
      </g>
    </g>
  );
};

/* ── Celebración ───────────────────────────── */

export const Chispas: React.FC = () => (
  <g className="nx-a-chispas" aria-hidden="true">
    {CHISPAS.map((c, i) => (
      <path
        key={c.cx}
        d={DESTELLO(c.cx, c.cy, c.r)}
        fill={i % 2 === 0 ? ORANGE : NAVY_L}
        style={{ animationDelay: `${c.retardo}s` }}
      />
    ))}
  </g>
);
