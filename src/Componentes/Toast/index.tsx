import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext, type Toast, type ToastApi, type ToastTipo } from './context';
import './toast.css';

/* ─────────────────────────────────────────────
   TOAST PROVIDER — avisos efímeros de éxito/error.
   Reemplaza los alert() nativos: no bloquean, no
   sacan el foco y se apilan sin tapar la acción.

   Montado una sola vez en la raíz de la app.
───────────────────────────────────────────── */

const DURACION = 4200;
/** Más de 3 avisos a la vez es ruido: el más viejo se va. */
const MAX_VISIBLES = 3;

const ICONOS: Record<ToastTipo, React.ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5v.5" />
    </svg>
  ),
};

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const siguienteId = useRef(1);

  const quitar = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (tipo: ToastTipo, mensaje: string) => {
      if (!mensaje) return;
      const id = siguienteId.current++;
      setToasts((prev) => [...prev, { id, tipo, mensaje }].slice(-MAX_VISIBLES));
      window.setTimeout(() => quitar(id), DURACION);
    },
    [quitar]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => mostrar('success', m),
      error: (m) => mostrar('error', m),
      info: (m) => mostrar('info', m),
    }),
    [mostrar]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="nx-toasts" aria-live="polite" aria-atomic="false">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`nx-toast nx-toast--${t.tipo}`}
              role={t.tipo === 'error' ? 'alert' : 'status'}
            >
              <span className="nx-toast-icon" aria-hidden="true">{ICONOS[t.tipo]}</span>
              <p className="nx-toast-msg">{t.mensaje}</p>
              <button
                type="button"
                className="nx-toast-close"
                onClick={() => quitar(t.id)}
                aria-label="Cerrar aviso"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
