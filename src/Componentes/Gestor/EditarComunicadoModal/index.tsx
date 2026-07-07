import React, { useState } from 'react';
import Modal from '../../Modal';
import api from '../../../api';
import './editarComunicadoModal.css';

/* ─────────────────────────────────────────────
   EDITAR COMUNICADO — modal de edición (Gestor).
   Reutiliza los estilos de formulario del módulo
   de comunicados y el Modal compartido.
───────────────────────────────────────────── */

export interface ComunicadoCambios {
  titulo: string;
  contenido: string;
  imagen_url: string | null;
}

interface EditarComunicadoModalProps {
  comunicado: { id: number } & ComunicadoCambios;
  onClose: () => void;
  /** Se invoca con los campos guardados para actualizar la lista sin recargar */
  onSaved: (cambios: ComunicadoCambios) => void;
}

const EditarComunicadoModal: React.FC<EditarComunicadoModalProps> = ({
  comunicado,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState({
    titulo: comunicado.titulo,
    contenido: comunicado.contenido,
    imagen_url: comunicado.imagen_url ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const disabled = saving || saved;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.titulo.trim() || !form.contenido.trim()) {
      setError('El título y el contenido son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      const cambios: ComunicadoCambios = {
        titulo: form.titulo.trim(),
        contenido: form.contenido.trim(),
        imagen_url: form.imagen_url.trim() || null,
      };
      await api.put(`/api/comunicados/${comunicado.id}`, cambios);
      onSaved(cambios);
      setSaved(true);
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } }; message?: string };
      setError(ex?.response?.data?.message || ex?.message || 'Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={disabled ? () => {} : onClose} size="md" labelledBy="ecm-title">
      <div className="com-form-header ecm-header">
        <div className="com-form-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
        <div>
          <span id="ecm-title" className="com-form-title">Editar comunicado</span>
          <span className="com-form-sub">Los cambios serán visibles para toda la institución</span>
        </div>
        <button
          type="button"
          className="ecm-close"
          onClick={onClose}
          disabled={disabled}
          aria-label="Cerrar sin guardar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="ecm-form">
        <div className="com-form-body ecm-body">
          {error && <div className="com-form-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="ecm-titulo">Título</label>
            <input
              id="ecm-titulo"
              name="titulo"
              type="text"
              value={form.titulo}
              onChange={handleChange}
              disabled={disabled}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="ecm-contenido">Contenido</label>
            <textarea
              id="ecm-contenido"
              name="contenido"
              className="com-textarea"
              value={form.contenido}
              onChange={handleChange}
              rows={5}
              disabled={disabled}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="ecm-imagen">
              Imagen — URL
              <span className="com-field-optional">opcional</span>
            </label>
            <input
              id="ecm-imagen"
              name="imagen_url"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={form.imagen_url}
              onChange={handleChange}
              disabled={disabled}
            />
          </div>

          {form.imagen_url.trim() && (
            <div className="com-img-preview">
              <img
                src={form.imagen_url}
                alt="Vista previa"
                onError={(e) => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        <div className="ecm-footer">
          {saved && (
            <span className="ecm-saved" role="status">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Cambios guardados
            </span>
          )}
          <div className="ecm-footer-actions">
            <button type="button" className="ecm-btn ecm-btn--ghost" onClick={onClose} disabled={disabled}>
              Cancelar
            </button>
            <button type="submit" className="ecm-btn ecm-btn--primary" disabled={disabled}>
              {saving && <span className="ecm-btn-spinner" aria-hidden="true" />}
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditarComunicadoModal;
