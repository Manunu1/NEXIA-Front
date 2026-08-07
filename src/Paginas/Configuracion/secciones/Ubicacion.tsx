import React, { useState } from 'react';
import type { Perfil } from '../../../Types/perfil';
import { useGuardarPerfil } from '../useGuardarPerfil';

/* ─────────────────────────────────────────────
   UBICACIÓN — datos de contacto opcionales.
   Argentina primero porque es el mercado inicial;
   la lista queda abierta para cuando no lo sea.
───────────────────────────────────────────── */

const PAISES = [
  'Argentina',
  'Bolivia',
  'Brasil',
  'Chile',
  'Colombia',
  'Costa Rica',
  'Ecuador',
  'El Salvador',
  'España',
  'Guatemala',
  'Honduras',
  'México',
  'Nicaragua',
  'Panamá',
  'Paraguay',
  'Perú',
  'República Dominicana',
  'Uruguay',
  'Venezuela',
  'Otro',
];

interface Props {
  perfil: Perfil;
  onActualizado: (perfil: Perfil) => void;
}

const Ubicacion: React.FC<Props> = ({ perfil, onActualizado }) => {
  const { guardar, guardando } = useGuardarPerfil(onActualizado);

  const [direccion, setDireccion] = useState(perfil.direccion ?? '');
  const [ciudad, setCiudad] = useState(perfil.ciudad ?? '');
  const [pais, setPais] = useState(perfil.pais ?? 'Argentina');

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    await guardar({
      direccion: direccion.trim() || null,
      ciudad: ciudad.trim() || null,
      pais: pais || null,
    });
  };

  return (
    <form className="cfg-form" onSubmit={enviar}>
      <div className="nx-field">
        <label className="nx-label" htmlFor="cfg-direccion">
          Dirección <span className="nx-optional">Opcional</span>
        </label>
        <input
          id="cfg-direccion"
          className="nx-control"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          autoComplete="street-address"
          placeholder="Av. Siempre Viva 742"
          maxLength={160}
        />
      </div>

      <div className="cfg-row">
        <div className="nx-field">
          <label className="nx-label" htmlFor="cfg-ciudad">
            Ciudad <span className="nx-optional">Opcional</span>
          </label>
          <input
            id="cfg-ciudad"
            className="nx-control"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
            autoComplete="address-level2"
            placeholder="Buenos Aires"
            maxLength={80}
          />
        </div>

        <div className="nx-field">
          <label className="nx-label" htmlFor="cfg-pais">País</label>
          <select
            id="cfg-pais"
            className="nx-control"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            autoComplete="country-name"
          >
            {PAISES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
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

export default Ubicacion;
