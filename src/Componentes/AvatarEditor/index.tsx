import React, { useRef, useState } from 'react';
import Modal from '../Modal';
import NexiaAvatar from '../NexiaAvatar';
import type {
  AvatarConfig,
  AvatarExpresion,
  FondoAvatar,
  GlassesStyle,
  HairStyle,
  HatStyle,
  MarcaRostro,
  VelloFacial,
} from '../../Types/perfil';
import {
  AVATAR_POR_DEFECTO,
  COLORES_OJOS,
  COLORES_PELO,
  COLORES_REMERA,
  ESTILOS_PELO,
  FONDOS,
  LENTES,
  MARCAS,
  PIELES,
  SOMBREROS,
  VELLOS,
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

   Dos decisiones de experiencia:

   · Cada miniatura muestra el avatar del usuario con
     esa opción puesta —no un ícono genérico—, que es
     lo que hace que elegir sea inmediato.

   · Las opciones se agrupan en tres pasos (Rostro,
     Pelo, Estilo) en vez de once secciones apiladas.
     Con catorce colores de pelo y siete sombreros,
     la lista corrida obligaba a scrollear a ciegas.
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
  /** Sólo para el fondo: es la única opción que se ve por detrás de la figura. */
  conFondo?: boolean;
}

function Miniaturas<T extends string | null>({
  opciones,
  valor,
  etiqueta,
  preview,
  onChange,
  conFondo = false,
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
          <NexiaAvatar
            config={preview(o.value)}
            size={56}
            frame="head"
            backdrop={conFondo}
            className="ave-mini-cara"
          />
          <span className="ave-mini-label">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Pasos ─────────────────────────────────── */

const PASOS = [
  { id: 'rostro', label: 'Rostro' },
  { id: 'pelo', label: 'Pelo' },
  { id: 'estilo', label: 'Estilo' },
] as const;

type PasoId = (typeof PASOS)[number]['id'];

/* ── Expresiones de prueba ─────────────────────
   No se guardan: son un banco de pruebas. Que el
   usuario vea que su avatar celebra y se concentra
   es lo que lo vuelve un personaje y no una foto.
───────────────────────────────────────────── */

const EXPRESIONES: { value: AvatarExpresion; label: string }[] = [
  { value: 'normal', label: 'Neutra' },
  { value: 'alegre', label: 'Alegre' },
  { value: 'guino', label: 'Guiño' },
  { value: 'pensando', label: 'Pensando' },
  { value: 'celebrando', label: 'Celebrando' },
  { value: 'concentrado', label: 'Concentrada' },
];

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
  const [paso, setPaso] = useState<PasoId>('rostro');
  const [expresion, setExpresion] = useState<AvatarExpresion>('normal');
  // Cambia en cada sorteo para remontar la previa y relanzar su animación
  // de entrada: sin eso, "Aleatorio" cambia colores sin que pase nada.
  const [pulso, setPulso] = useState(0);
  const tabs = useRef<HTMLDivElement>(null);

  const setPelo = (parcial: Partial<AvatarConfig['hair']>) =>
    setCfg((c) => ({ ...c, hair: { ...c.hair, ...parcial } }));

  const setAccesorio = (parcial: Partial<AvatarConfig['accessories']>) =>
    setCfg((c) => ({ ...c, accessories: { ...c.accessories, ...parcial } }));

  const sortear = () => {
    setCfg(avatarAleatorio());
    setPulso((p) => p + 1);
  };

  // Flechas entre pasos: un tablist sin teclado no es un tablist.
  const navegarTabs = (e: React.KeyboardEvent) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const i = PASOS.findIndex((p) => p.id === paso);
    const siguiente = PASOS[(i + dir + PASOS.length) % PASOS.length];
    setPaso(siguiente.id);
    tabs.current?.querySelector<HTMLButtonElement>(`#ave-tab-${siguiente.id}`)?.focus();
  };

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
          <div className="ave-preview-stage" key={pulso}>
            {/* 190 y no más: la previa, los seis gestos y el sorteo tienen
                que entrar juntos en el alto del modal (720 px). Con la figura
                más grande, el botón queda fuera de la vista. */}
            <NexiaAvatar
              config={cfg}
              size={190}
              frame="full"
              expresion={expresion}
              animado
              interactivo
              alt="Vista previa de tu avatar"
            />
          </div>

          <div className="ave-gestos" role="radiogroup" aria-label="Probar una expresión">
            {EXPRESIONES.map((e) => (
              <button
                key={e.value}
                type="button"
                role="radio"
                aria-checked={expresion === e.value}
                className={`ave-gesto${expresion === e.value ? ' is-active' : ''}`}
                onClick={() => setExpresion(e.value)}
              >
                {e.label}
              </button>
            ))}
          </div>

          <p className="ave-pista">Las expresiones son sólo una prueba: no se guardan.</p>

          <button
            type="button"
            className="ave-btn ave-btn--ghost ave-random"
            onClick={sortear}
            disabled={guardando}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
            </svg>
            Sorprendeme
          </button>
        </div>

        {/* ── Controles ── */}
        <div className="ave-controles">
          <div className="ave-tabs" role="tablist" aria-label="Partes del avatar" ref={tabs} onKeyDown={navegarTabs}>
            {PASOS.map((p) => (
              <button
                key={p.id}
                id={`ave-tab-${p.id}`}
                type="button"
                role="tab"
                aria-selected={paso === p.id}
                aria-controls={`ave-panel-${p.id}`}
                tabIndex={paso === p.id ? 0 : -1}
                className={`ave-tab${paso === p.id ? ' is-active' : ''}`}
                onClick={() => setPaso(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="ave-paneles">
            {paso === 'rostro' && (
              <div className="ave-panel" id="ave-panel-rostro" role="tabpanel" aria-labelledby="ave-tab-rostro">
                <Seccion titulo="Tono de piel">
                  <Swatches
                    opciones={PIELES}
                    valor={cfg.skin}
                    etiqueta="Tono de piel"
                    onChange={(skin) => setCfg((c) => ({ ...c, skin }))}
                  />
                </Seccion>
  
                <Seccion titulo="Color de ojos">
                  <Swatches
                    opciones={COLORES_OJOS}
                    valor={cfg.eyes}
                    etiqueta="Color de ojos"
                    onChange={(eyes) => setCfg((c) => ({ ...c, eyes }))}
                  />
                </Seccion>
  
                <Seccion titulo="Detalles">
                  <Miniaturas<MarcaRostro | null>
                    opciones={MARCAS}
                    valor={cfg.marks ?? null}
                    etiqueta="Marcas del rostro"
                    preview={(marks) => ({ ...cfg, marks })}
                    onChange={(marks) => setCfg((c) => ({ ...c, marks }))}
                  />
                </Seccion>
              </div>
            )}
  
            {paso === 'pelo' && (
              <div className="ave-panel" id="ave-panel-pelo" role="tabpanel" aria-labelledby="ave-tab-pelo">
                <Seccion titulo="Estilo">
                  <Miniaturas<HairStyle>
                    opciones={ESTILOS_PELO}
                    valor={cfg.hair.style}
                    etiqueta="Estilo de pelo"
                    preview={(style) => ({
                      ...cfg,
                      hair: { ...cfg.hair, style },
                      accessories: { ...cfg.accessories, hat: null },
                    })}
                    onChange={(style) => setPelo({ style })}
                  />
                </Seccion>
  
                <Seccion titulo="Color">
                  <Swatches
                    opciones={COLORES_PELO}
                    valor={cfg.hair.color}
                    etiqueta="Color de pelo"
                    onChange={(color) => setPelo({ color })}
                  />
                </Seccion>
  
                <Seccion titulo="Vello facial">
                  <Miniaturas<VelloFacial | null>
                    opciones={VELLOS}
                    valor={cfg.facial_hair ?? null}
                    etiqueta="Vello facial"
                    preview={(facial_hair) => ({ ...cfg, facial_hair })}
                    onChange={(facial_hair) => setCfg((c) => ({ ...c, facial_hair }))}
                  />
                </Seccion>
              </div>
            )}
  
            {paso === 'estilo' && (
              <div className="ave-panel" id="ave-panel-estilo" role="tabpanel" aria-labelledby="ave-tab-estilo">
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
  
                <Seccion titulo="Fondo">
                  <Miniaturas<FondoAvatar>
                    opciones={FONDOS}
                    valor={cfg.backdrop ?? 'aurora'}
                    etiqueta="Fondo del avatar"
                    conFondo
                    preview={(backdrop) => ({ ...cfg, backdrop })}
                    onChange={(backdrop) => setCfg((c) => ({ ...c, backdrop }))}
                  />
                </Seccion>
              </div>
            )}
          </div>
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
