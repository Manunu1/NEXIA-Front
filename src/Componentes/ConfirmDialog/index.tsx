import React from 'react';
import Modal from '../Modal';
import './confirmDialog.css';

/* ─────────────────────────────────────────────
   CONFIRM DIALOG — confirmación reutilizable
   para acciones destructivas o importantes.
───────────────────────────────────────────── */

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true = acción destructiva (botón rojo) */
  danger?: boolean;
  /** deshabilita los botones y muestra spinner mientras se ejecuta la acción */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) => (
  <Modal open={open} onClose={busy ? () => {} : onCancel} size="sm" labelledBy="confirm-dialog-title">
    <div className="confirm-dialog">
      <div className={`confirm-icon${danger ? ' confirm-icon--danger' : ''}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <h2 id="confirm-dialog-title" className="confirm-title">{title}</h2>
      <div className="confirm-message">{message}</div>

      <div className="confirm-actions">
        <button type="button" className="confirm-btn confirm-btn--ghost" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`confirm-btn ${danger ? 'confirm-btn--danger' : 'confirm-btn--primary'}`}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy && <span className="confirm-btn-spinner" aria-hidden="true" />}
          {confirmLabel}
        </button>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;
