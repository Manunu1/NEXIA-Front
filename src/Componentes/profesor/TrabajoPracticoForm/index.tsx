import React, { useRef, useState } from 'react';
import api from '../../../api';
import './trabajoPracticoForm.css';

export interface TrabajoPracticoFormValues {
  titulo: string;
  descripcion: string;
  fecha_limite: string; // ISO string, o '' si no tiene
  archivo_url: string;
}

interface Props {
  initialValues?: Partial<TrabajoPracticoFormValues>;
  submitLabel: string;
  submitting: boolean;
  submitError?: string | null;
  extraAction?: React.ReactNode;
  onSubmit: (values: TrabajoPracticoFormValues) => void;
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error';

const ACCEPTED_EXT = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.zip'];
const MAX_SIZE_MB = 20;

function isoToLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const TrabajoPracticoForm: React.FC<Props> = ({ initialValues, submitLabel, submitting, submitError, extraAction, onSubmit }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState(initialValues?.titulo ?? '');
  const [descripcion, setDescripcion] = useState(initialValues?.descripcion ?? '');
  const [fechaLimite, setFechaLimite] = useState(isoToLocalInput(initialValues?.fecha_limite));
  const [archivoUrl, setArchivoUrl] = useState(initialValues?.archivo_url ?? '');

  const [uploadState, setUploadState] = useState<UploadState>(archivoUrl ? 'done' : 'idle');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const uploadArchivo = async (file: File) => {
    const name = file.name.toLowerCase();
    const validExt = ACCEPTED_EXT.some(ext => name.endsWith(ext));
    if (!validExt) {
      setUploadError('Formato no soportado. Usá PDF, DOC, DOCX, JPG, PNG o ZIP.');
      setUploadState('error');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`El archivo supera el máximo de ${MAX_SIZE_MB}MB.`);
      setUploadState('error');
      return;
    }
    setUploadState('uploading');
    setUploadedFileName(file.name);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('archivo', file);
      const res = await api.post('/api/trabajos-practicos/upload', fd);
      setArchivoUrl(res.data.data.url);
      setUploadState('done');
    } catch (err: unknown) {
      const ex = err as { response?: { data?: { message?: string } } };
      setUploadError(ex.response?.data?.message || 'Error al subir el archivo.');
      setUploadState('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadArchivo(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadArchivo(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      titulo,
      descripcion,
      fecha_limite: fechaLimite ? new Date(fechaLimite).toISOString() : '',
      archivo_url: archivoUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="tpf-card">
      <div className="tpf-card-header">
        <div className="tpf-card-header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" />
          </svg>
        </div>
        <div>
          <span className="tpf-card-title">Detalles del trabajo</span>
          <span className="tpf-card-sub">Esto es lo que van a ver los alumnos de la materia</span>
        </div>
      </div>

      <div className="tpf-card-body stagger-in">
        {submitError && <div className="tpf-error">{submitError}</div>}

        <div className="tpf-section">
          <label className="tpf-label" htmlFor="tpf-titulo">Título</label>
          <input
            id="tpf-titulo"
            className="tpf-input"
            placeholder="Ej: Trabajo práctico N°3 — Ecuaciones"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>

        <div className="tpf-section">
          <label className="tpf-label" htmlFor="tpf-consigna">
            Consigna
            <span className="tpf-optional">opcional</span>
          </label>
          <textarea
            id="tpf-consigna"
            className="tpf-input tpf-textarea"
            placeholder="Describí qué tienen que hacer, criterios de evaluación, formato de entrega…"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        <div className="tpf-section">
          <label className="tpf-label" htmlFor="tpf-fecha">
            Fecha límite de entrega
            <span className="tpf-optional">opcional</span>
          </label>
          <input
            id="tpf-fecha"
            type="datetime-local"
            className="tpf-input tpf-input--fecha"
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
          />
          <p className="tpf-hint">Si no cargás una fecha, los alumnos podrán entregar en cualquier momento.</p>
        </div>

        <div className="tpf-section">
          <label className="tpf-label">
            Archivo de la consigna
            <span className="tpf-optional">opcional</span>
          </label>

        {uploadState === 'idle' || uploadState === 'error' ? (
          <div
            className={`tpf-drop-zone${dragOver ? ' tpf-drop-zone--over' : ''}${uploadState === 'error' ? ' tpf-drop-zone--error' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {uploadState === 'error' ? (
              <p className="tpf-drop-text tpf-drop-text--error">{uploadError}</p>
            ) : (
              <>
                <p className="tpf-drop-text">Arrastrá un archivo o hacé clic para seleccionar</p>
                <p className="tpf-drop-sub">PDF, DOC, DOCX, JPG, PNG o ZIP · Máximo 20MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        ) : uploadState === 'uploading' ? (
          <div className="tpf-upload-status tpf-upload-status--loading">
            <div className="nexia-loading-spinner" />
            <div>
              <p className="tpf-upload-name">{uploadedFileName}</p>
              <p className="tpf-upload-sub">Subiendo archivo...</p>
            </div>
          </div>
        ) : (
          <div className="tpf-upload-status tpf-upload-status--done">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <div>
              <p className="tpf-upload-name">{uploadedFileName || 'Archivo cargado'}</p>
              <p className="tpf-upload-sub">Listo para publicar</p>
            </div>
            <button
              type="button"
              className="tpf-upload-remove"
              aria-label="Quitar archivo"
              onClick={() => { setUploadState('idle'); setUploadError(''); setArchivoUrl(''); setUploadedFileName(''); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        </div>
      </div>

      <div className="tpf-card-footer">
        {extraAction}
        <button type="submit" className="tpf-submit-btn" disabled={submitting || uploadState === 'uploading'}>
          {submitting && <span className="tpf-btn-spinner" aria-hidden="true" />}
          {submitting ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default TrabajoPracticoForm;
