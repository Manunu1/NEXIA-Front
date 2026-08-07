import React, { useState } from 'react';
import { useToast } from '../../../Componentes/Toast/context';
import type { Genero, Perfil } from '../../../Types/perfil';
import { useGuardarPerfil } from '../useGuardarPerfil';

/* ─────────────────────────────────────────────
   DATOS PERSONALES — lo que el usuario controla de
   su identidad. Email y DNI son de la institución:
   se muestran para que se entienda con qué cuenta
   está trabajando, pero no se editan acá.
───────────────────────────────────────────── */

const MAX_BIO = 300;

const GENEROS: { value: Genero | ''; label: string }[] = [
  { value: '', label: 'Sin especificar' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
  { value: 'prefiero_no_decir', label: 'Prefiero no decirlo' },
];

/** El backend puede devolver la fecha con hora; <input type="date"> quiere YYYY-MM-DD. */
const soloFecha = (valor: string | null) => (valor ? valor.slice(0, 10) : '');

const HOY = new Date().toISOString().slice(0, 10);

interface Props {
  perfil: Perfil;
  onActualizado: (perfil: Perfil) => void;
}

const DatosPersonales: React.FC<Props> = ({ perfil, onActualizado }) => {
  const toast = useToast();
  const { guardar, guardando } = useGuardarPerfil(onActualizado);

  const [nombre, setNombre] = useState(perfil.nombre ?? '');
  const [apellido, setApellido] = useState(perfil.apellido ?? '');
  const [telefono, setTelefono] = useState(perfil.telefono ?? '');
  const [nacimiento, setNacimiento] = useState(soloFecha(perfil.fecha_nacimiento));
  const [genero, setGenero] = useState<Genero | ''>(perfil.genero ?? '');
  const [biografia, setBiografia] = useState(perfil.biografia ?? '');

  const restantes = MAX_BIO - biografia.length;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) return toast.error('El nombre no puede quedar vacío');
    if (!apellido.trim()) return toast.error('El apellido no puede quedar vacío');
    if (biografia.length > MAX_BIO) return toast.error(`La biografía no puede superar los ${MAX_BIO} caracteres`);
    if (nacimiento && nacimiento > HOY) return toast.error('La fecha de nacimiento no puede ser futura');

    await guardar({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: telefono.trim() || null,
      fecha_nacimiento: nacimiento || null,
      genero: genero || null,
      biografia: biografia.trim() || null,
    });
  };

  return (
    <form className="cfg-form" onSubmit={enviar}>
      <div className="cfg-row">
        <div className="nx-field">
          <label className="nx-label" htmlFor="cfg-nombre">Nombre</label>
          <input
            id="cfg-nombre"
            className="nx-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            autoComplete="given-name"
            maxLength={80}
            required
          />
        </div>
        <div className="nx-field">
          <label className="nx-label" htmlFor="cfg-apellido">Apellido</label>
          <input
            id="cfg-apellido"
            className="nx-control"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            autoComplete="family-name"
            maxLength={80}
            required
          />
        </div>
      </div>

      <div className="cfg-row">
        <div className="nx-field">
          <label className="nx-label" htmlFor="cfg-email">Email</label>
          <input id="cfg-email" className="nx-control" value={perfil.email ?? ''} disabled />
          <p className="nx-hint">Lo gestiona tu institución.</p>
        </div>
        <div className="nx-field">
          <label className="nx-label" htmlFor="cfg-dni">DNI</label>
          <input id="cfg-dni" className="nx-control" value={perfil.dni ?? ''} disabled />
          <p className="nx-hint">Lo gestiona tu institución.</p>
        </div>
      </div>

      <div className="cfg-row">
        <div className="nx-field">
          <label className="nx-label" htmlFor="cfg-telefono">
            Teléfono <span className="nx-optional">Opcional</span>
          </label>
          <input
            id="cfg-telefono"
            type="tel"
            className="nx-control"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            autoComplete="tel"
            placeholder="+54 11 5555 5555"
            maxLength={30}
          />
        </div>
        <div className="nx-field">
          <label className="nx-label" htmlFor="cfg-nacimiento">
            Fecha de nacimiento <span className="nx-optional">Opcional</span>
          </label>
          <input
            id="cfg-nacimiento"
            type="date"
            className="nx-control"
            value={nacimiento}
            max={HOY}
            onChange={(e) => setNacimiento(e.target.value)}
          />
        </div>
      </div>

      <div className="nx-field">
        <label className="nx-label" htmlFor="cfg-genero">
          Género <span className="nx-optional">Opcional</span>
        </label>
        <select
          id="cfg-genero"
          className="nx-control cfg-select-ancho"
          value={genero}
          onChange={(e) => setGenero(e.target.value as Genero | '')}
        >
          {GENEROS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </div>

      <div className="nx-field">
        <label className="nx-label" htmlFor="cfg-bio">
          Biografía <span className="nx-optional">Opcional</span>
        </label>
        <textarea
          id="cfg-bio"
          className="nx-control"
          value={biografia}
          onChange={(e) => setBiografia(e.target.value.slice(0, MAX_BIO))}
          maxLength={MAX_BIO}
          rows={4}
          placeholder="Contá en pocas líneas quién sos dentro del campus."
          aria-describedby="cfg-bio-contador"
        />
        <p
          id="cfg-bio-contador"
          className={`cfg-contador${restantes <= 30 ? ' is-limite' : ''}`}
          aria-live="polite"
        >
          {restantes} caracteres restantes
        </p>
      </div>

      <div className="cfg-savebar">
        <button type="submit" className="cfg-btn cfg-btn--primary" disabled={guardando}>
          {guardando && <span className="cfg-btn-spinner" aria-hidden="true" />}
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
};

export default DatosPersonales;
