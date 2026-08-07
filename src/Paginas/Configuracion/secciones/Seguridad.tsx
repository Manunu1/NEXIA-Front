import React, { useState } from 'react';
import api from '../../../api';
import { useToast } from '../../../Componentes/Toast/context';
import { mensajeDeError } from '../../../utils/apiError';

/* ─────────────────────────────────────────────
   SEGURIDAD — cambio de contraseña.

   Las reglas del backend se muestran como checklist
   en vivo: es mejor que el usuario vea qué le falta
   mientras escribe y no después de un 400.
───────────────────────────────────────────── */

const MIN = 8;

const IconOjo = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconOjoTachado = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.6 6.2A9.9 9.9 0 0 1 12 5c6.5 0 10.5 7 10.5 7a18 18 0 0 1-3.4 4.1M6.5 7.4A17.6 17.6 0 0 0 1.5 12S5.5 19 12 19c1.7 0 3.2-.5 4.5-1.2" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M2 2l20 20" />
  </svg>
);

interface CampoProps {
  id: string;
  label: string;
  valor: string;
  autoComplete: string;
  onChange: (v: string) => void;
}

const CampoPassword: React.FC<CampoProps> = ({ id, label, valor, autoComplete, onChange }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="nx-field">
      <label className="nx-label" htmlFor={id}>{label}</label>
      <div className="cfg-password-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="nx-control"
          value={valor}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        <button
          type="button"
          className="cfg-password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          tabIndex={-1}
        >
          {visible ? IconOjoTachado : IconOjo}
        </button>
      </div>
    </div>
  );
};

const Requisito: React.FC<{ ok: boolean; children: React.ReactNode }> = ({ ok, children }) => (
  <li className={`cfg-requisito${ok ? ' is-ok' : ''}`}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ok ? <path d="M20 6 9 17l-5-5" /> : <circle cx="12" cy="12" r="7" />}
    </svg>
    {children}
  </li>
);

const Seguridad: React.FC = () => {
  const toast = useToast();

  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [guardando, setGuardando] = useState(false);

  const largoOk = nueva.length >= MIN;
  const numeroOk = /\d/.test(nueva);
  const coincideOk = nueva.length > 0 && nueva === confirmacion;
  const valido = largoOk && numeroOk && coincideOk && actual.length > 0;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!actual) return toast.error('Ingresá tu contraseña actual');
    if (!largoOk) return toast.error(`La nueva contraseña debe tener al menos ${MIN} caracteres`);
    if (!numeroOk) return toast.error('La nueva contraseña debe incluir al menos un número');
    if (!coincideOk) return toast.error('Las contraseñas nuevas no coinciden');

    setGuardando(true);
    try {
      await api.put('/api/perfil/me/password', {
        password_actual: actual,
        password_nueva: nueva,
      });
      setActual('');
      setNueva('');
      setConfirmacion('');
      toast.success('Contraseña actualizada');
    } catch (err) {
      toast.error(mensajeDeError(err, 'No pudimos cambiar tu contraseña'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form className="cfg-form" onSubmit={enviar}>
      <CampoPassword
        id="cfg-pass-actual"
        label="Contraseña actual"
        valor={actual}
        autoComplete="current-password"
        onChange={setActual}
      />

      <div className="cfg-row">
        <CampoPassword
          id="cfg-pass-nueva"
          label="Nueva contraseña"
          valor={nueva}
          autoComplete="new-password"
          onChange={setNueva}
        />
        <CampoPassword
          id="cfg-pass-confirmar"
          label="Repetir nueva contraseña"
          valor={confirmacion}
          autoComplete="new-password"
          onChange={setConfirmacion}
        />
      </div>

      <ul className="cfg-requisitos" aria-live="polite">
        <Requisito ok={largoOk}>Al menos {MIN} caracteres</Requisito>
        <Requisito ok={numeroOk}>Al menos un número</Requisito>
        <Requisito ok={coincideOk}>Las dos contraseñas coinciden</Requisito>
      </ul>

      <div className="cfg-savebar">
        <button type="submit" className="cfg-btn cfg-btn--primary" disabled={guardando || !valido}>
          {guardando && <span className="cfg-btn-spinner" aria-hidden="true" />}
          {guardando ? 'Actualizando…' : 'Actualizar contraseña'}
        </button>
      </div>
    </form>
  );
};

export default Seguridad;
