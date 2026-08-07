import React, { useState } from 'react';
import Modal from '../Modal';
import NexiaAvatar from '../NexiaAvatar';
import type { AvatarConfig, GlassesStyle, HairStyle, HatStyle } from '../../Types/perfil';
import {
  AVATAR_POR_DEFECTO,
  COLORES_OJOS,
  COLORES_PELO,
  COLORES_REMERA,
  ESTILOS_PELO,
  LENTES,
  PIELES,
  SOMBREROS,
  avatarAleatorio,
  normalizarAvatar,
  type OpcionColor,
} from '../../utils/avatar';
import './avatarEditor.css';

/* ─────────────────────────────────────────────
   EDITOR DE AVATAR — vista previa en vivo a la
   izquierda, controles a la derecha.

   La config en edición es local: hasta que el
   usuario guarda, nada sale del componente. Así
   "Cancelar" es realmente descartar y el padre no
   tiene que revertir nada.

   Cada miniatura muestra el avatar del usuario con
   esa opción puesta —no un ícono genérico—, que es
   lo que hace que elegir sea inmediato.
───────────────────────────────────────────── */

interface AvatarEditorProps {
  open: boolean;
  /** Config de partida. null → se arranca del avatar por defecto. */
  configInicial: AvatarConfig | null;
  guardando?: boolean;
  onGuardar: (config: AvatarConfig) => void;
  onCancelar: () => void;
}

/* ── Piezas internas ───────────────────────── */

const Seccion: React.FC<{ titulo: string; children: React.ReactNode }> = ({ titulo, children }) => (
  <section className="ave-seccion">
    <h3 className="ave-seccion-titulo">{titulo}</h3>
    {children}
  </section>
);

interface SwatchesProps {
  opciones: OpcionColor[];
  valor: string;
  etiqueta: string;
  onChange: (color: string) => void;
}

const Swatches: React.FC<SwatchesProps> = ({ opciones, valor, etiqueta, onChange }) => (
  <div className="ave-swatches" role="radiogroup" aria-label={etiqueta}>
    {opciones.map((o) => (
      <button
        key={o.value}
        type="button"
        role="radio"
        aria-checked={valor === o.value}
        aria-label={o.label}
        title={o.label}
        className={`ave-swatch${valor === o.value ? ' is-active' : ''}`}
        style={{ background: o.value }}
        onClick={() => onChange(o.value)}
      />
    ))}
  </div>
);

interface MiniaturasProps<T> {
  opciones: { value: T; label: string }[];
  valor: T;
  etiqueta: string;
  /** Config resultante de elegir esa opción — alimenta la miniatura. */
  preview: (valor: T) => AvatarConfig;
  onChange: (valor: T) => void;
}

function Miniaturas<T extends string | null>({
  opciones,
  valor,
  etiqueta,
  preview,
  onChange,
}: MiniaturasProps<T>) {
  return (
    <div className="ave-minis" role="radiogroup" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={valor === o.value}
          className={`ave-mini${valor === o.value ? ' is-active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          <NexiaAvatar config={preview(o.value)} size={56} frame="head" backdrop={false} />
          <span className="ave-mini-label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Editor ────────────────────────────────── */

/**
 * El contenido se monta sólo con el modal abierto, así que su estado nace
 * de configInicial en cada apertura: cerrar y volver a entrar siempre parte
 * de lo guardado, sin necesidad de resetear nada a mano.
 */
const Contenido: React.FC<Omit<AvatarEditorProps, 'open'>> = ({
  configInicial,
  guardando = false,
  onGuardar,
  onCancelar,
}) => {
  const [cfg, setCfg] = useState<AvatarConfig>(() =>
    configInicial ? normalizarAvatar(configInicial) : { ...AVATAR_POR_DEFECTO }
  );

  const setPelo = (parcial: Partial<AvatarConfig['hair']>) =>
    setCfg((c) => ({ ...c, hair: { ...c.hair, ...parcial } }));

  const setAccesorio = (parcial: Partial<AvatarConfig['accessories']>) =>
    setCfg((c) => ({ ...c, accessories: { ...c.accessories, ...parcial } }));

  return (
    <div className="ave">
      <header className="ave-head">
        <div>
          <h2 id="ave-titulo" className="ave-titulo">Personalizá tu avatar</h2>
          <p className="ave-sub">Los cambios se ven al instante. Nada se guarda hasta que confirmes.</p>
        </div>
        <button
          type="button"
          className="ave-cerrar"
          onClick={onCancelar}
          disabled={guardando}
          aria-label="Cerrar editor"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </header>

      <div className="ave-body">
        {/* ── Vista previa ── */}
        <div className="ave-preview">
          <div className="ave-preview-stage">
            <NexiaAvatar config={cfg} size={240} frame="full" alt="Vista previa de tu avatar" />
          </div>
          <button
            type="button"
            className="ave-btn ave-btn--ghost ave-random"
            onClick={() => setCfg(avatarAleatorio())}
            disabled={guardando}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
            </svg>
            Aleatorio
          </button>
        </div>

        {/* ── Controles ── */}
        <div className="ave-controles">
          <Seccion titulo="Piel">
            <Swatches
              opciones={PIELES}
              valor={cfg.skin}
              etiqueta="Tono de piel"
              onChange={(skin) => setCfg((c) => ({ ...c, skin }))}
            />
          </Seccion>

          <Seccion titulo="Pelo">
            <Miniaturas<HairStyle>
              opciones={ESTILOS_PELO}
              valor={cfg.hair.style}
              etiqueta="Estilo de pelo"
              preview={(style) => ({ ...cfg, hair: { ...cfg.hair, style }, accessories: { ...cfg.accessories, hat: null } })}
              onChange={(style) => setPelo({ style })}
            />
            <Swatches
              opciones={COLORES_PELO}
              valor={cfg.hair.color}
              etiqueta="Color de pelo"
              onChange={(color) => setPelo({ color })}
            />
          </Seccion>

          <Seccion titulo="Ojos">
            <Swatches
              opciones={COLORES_OJOS}
              valor={cfg.eyes}
              etiqueta="Color de ojos"
              onChange={(eyes) => setCfg((c) => ({ ...c, eyes }))}
            />
          </Seccion>

          <Seccion titulo="Lentes">
            <Miniaturas<GlassesStyle | null>
              opciones={LENTES}
              valor={cfg.accessories.glasses}
              etiqueta="Lentes"
              preview={(glasses) => ({ ...cfg, accessories: { ...cfg.accessories, glasses } })}
              onChange={(glasses) => setAccesorio({ glasses })}
            />
          </Seccion>

          <Seccion titulo="Sombrero">
            <Miniaturas<HatStyle | null>
              opciones={SOMBREROS}
              valor={cfg.accessories.hat}
              etiqueta="Sombrero"
              preview={(hat) => ({ ...cfg, accessories: { ...cfg.accessories, hat } })}
              onChange={(hat) => setAccesorio({ hat })}
            />
          </Seccion>

          <Seccion titulo="Color de remera">
            <Swatches
              opciones={COLORES_REMERA}
              valor={cfg.shirt_color}
              etiqueta="Color de remera"
              onChange={(shirt_color) => setCfg((c) => ({ ...c, shirt_color }))}
            />
          </Seccion>
        </div>
      </div>

      <footer className="ave-foot">
        <button type="button" className="ave-btn ave-btn--ghost" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button
          type="button"
          className="ave-btn ave-btn--primary"
          onClick={() => onGuardar(cfg)}
          disabled={guardando}
        >
          {guardando && <span className="ave-spinner" aria-hidden="true" />}
          {guardando ? 'Guardando…' : 'Guardar avatar'}
        </button>
    </footer>
    </div>
  );
};

const AvatarEditor: React.FC<AvatarEditorProps> = ({ open, ...props }) => (
  <Modal
    open={open}
    onClose={props.guardando ? () => {} : props.onCancelar}
    size="full"
    labelledBy="ave-titulo"
  >
    <Contenido {...props} />
  </Modal>
);

export default AvatarEditor;
