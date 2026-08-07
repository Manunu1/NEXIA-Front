import { createContext, useContext } from 'react';

/* ─────────────────────────────────────────────
   TOAST — contrato. Separado del provider para que
   el hot reload no reinicie el componente cada vez
   que se toca el hook (react-refresh).
───────────────────────────────────────────── */

export type ToastTipo = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  tipo: ToastTipo;
  mensaje: string;
}

export interface ToastApi {
  success: (mensaje: string) => void;
  error: (mensaje: string) => void;
  info: (mensaje: string) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return ctx;
}
