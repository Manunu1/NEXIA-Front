import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './modal.css';

/* ─────────────────────────────────────────────
   MODAL — contenedor de diálogo reutilizable.
   Overlay con blur, cierre por Escape / click
   afuera, bloqueo de scroll y foco al abrir.
───────────────────────────────────────────── */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** id del elemento que titula el diálogo (aria-labelledby) */
  labelledBy?: string;
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, labelledBy, size = 'md', children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Enfocar el diálogo solo si ningún hijo tomó el foco
    // (ej: un input con autoFocus) — si no, se lo robaríamos.
    if (!dialogRef.current?.contains(document.activeElement)) {
      dialogRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  // Portal a <body>: evita que ancestros con transform/overflow
  // (ej: la sidebar en mobile) atrapen o recorten el diálogo.
  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`modal-dialog modal-dialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
