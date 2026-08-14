import { useId } from 'react';
import Select from 'react-select';
import type { GroupBase, Props as ReactSelectProps } from 'react-select';
import './select.css';

/* ─────────────────────────────────────────────
   NEXIA SELECT — único combo de la plataforma.

   react-select se usaba "pelado" en cada form y
   eso traía tres problemas reales:

   1. El menú se renderizaba dentro de la tarjeta,
      y toda tarjeta de formulario tiene overflow
      hidden → la lista quedaba recortada y parecía
      que faltaban opciones.
   2. Los overrides apuntaban a clases de emotion
      (css-xxxx-option), que no incluyen el estado
      isFocused → navegar con teclado no se veía.
   3. Cada pantalla repetía su propio placeholder,
      su propio "sin resultados" y ningún inputId,
      así que los <label> no apuntaban a nada.

   Acá se resuelve una vez: classNamePrefix estable
   (el CSS deja de pelear con emotion vía !important),
   menú porteado al body y label atado por inputId.
───────────────────────────────────────────── */

export interface OpcionSelect {
  value: string | number;
  label: string;
}

type NexiaSelectProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
> = Omit<ReactSelectProps<Option, IsMulti, Group>, 'classNamePrefix' | 'unstyled'> & {
  /** Texto del label asociado. Si se omite, pasar aria-label. */
  label?: string;
  /** Mensaje bajo el control (ayuda o error). */
  hint?: string;
  /** Pinta el control en estado de error. */
  invalid?: boolean;
};

function NexiaSelect<
  Option = OpcionSelect,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  label,
  hint,
  invalid = false,
  inputId,
  placeholder = 'Seleccionar…',
  noOptionsMessage = () => 'Sin resultados',
  loadingMessage = () => 'Cargando…',
  ...rest
}: NexiaSelectProps<Option, IsMulti, Group>) {
  const autoId = useId();
  const id = inputId ?? `nx-sel-${autoId}`;

  return (
    <div className={`nx-sel-field${invalid ? ' nx-sel-field--invalid' : ''}`}>
      {label && (
        <label className="nx-sel-label" htmlFor={id}>
          {label}
        </label>
      )}

      <Select<Option, IsMulti, Group>
        {...rest}
        inputId={id}
        unstyled
        classNamePrefix="nx-sel"
        placeholder={placeholder}
        noOptionsMessage={noOptionsMessage}
        loadingMessage={loadingMessage}
        /* Por prop y no por CSS: react-select escribe el max-height del
           listado con emotion, que gana en un empate de especificidad. */
        maxMenuHeight={264}
        /* Al body: ningún ancestro con overflow hidden o transform
           (tarjetas de formulario, modales) puede recortar la lista. */
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
        menuPosition="fixed"
        menuPlacement="auto"
        /* Sólo el z-index va inline: es lo único que depende del stacking
           context del portal y no se puede resolver desde la hoja de estilos. */
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 400 }) }}
      />

      {hint && <p className="nx-sel-hint">{hint}</p>}
    </div>
  );
}

export default NexiaSelect;
