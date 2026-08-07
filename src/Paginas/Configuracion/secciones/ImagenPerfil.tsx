import React, { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../../api';
import AvatarEditor from '../../../Componentes/AvatarEditor';
import ConfirmDialog from '../../../Componentes/ConfirmDialog';
import NexiaAvatar from '../../../Componentes/NexiaAvatar';
import ProfileImage from '../../../Componentes/ProfileImage';
import { useToast } from '../../../Componentes/Toast/context';
import type { AvatarConfig, Perfil } from '../../../Types/perfil';
import { mensajeDeError } from '../../../utils/apiError';
import { getProfileImage } from '../../../utils/profileImage';

/* ─────────────────────────────────────────────
   IMAGEN DE PERFIL — avatar generado, foto propia
   o la imagen por defecto. Son excluyentes: el
   backend borra una al guardar la otra, así que la
   UI lo avisa antes y no después.
───────────────────────────────────────────── */

const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];

interface Props {
  perfil: Perfil;
  onActualizado: (perfil: Perfil) => void;
}

const IconAvatar = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8.5" r="4" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    <path d="m18.5 3 .7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
  </svg>
);

const IconFoto = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1.8-2.5h6.4L17 6h3a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="12.5" r="3.5" />
  </svg>
);

const ImagenPerfil: React.FC<Props> = ({ perfil, onActualizado }) => {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editorAbierto, setEditorAbierto] = useState(false);
  const [guardandoAvatar, setGuardandoAvatar] = useState(false);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const [confirmarReset, setConfirmarReset] = useState(false);
  const [reseteando, setReseteando] = useState(false);

  const imagen = getProfileImage(perfil);
  const tieneImagen = imagen.type !== 'default';

  // El preview se deriva del archivo elegido; el object URL se libera al
  // cambiar de archivo o al desmontar, para no dejar blobs colgados.
  const preview = useMemo(() => (archivo ? URL.createObjectURL(archivo) : null), [archivo]);
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const elegirArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;

    if (!TIPOS.includes(file.type)) {
      toast.error('Formato no válido. Usá JPG, PNG o WEBP.');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('La imagen supera los 5 MB.');
      return;
    }
    setArchivo(file);
  };

  const guardarAvatar = async (config: AvatarConfig) => {
    setGuardandoAvatar(true);
    try {
      const res = await api.put('/api/perfil/me/avatar', config);
      onActualizado(res.data.data);
      setEditorAbierto(false);
      setArchivo(null);
      toast.success('Avatar actualizado');
    } catch (err) {
      toast.error(mensajeDeError(err, 'No pudimos guardar tu avatar'));
    } finally {
      setGuardandoAvatar(false);
    }
  };

  const subirFoto = async () => {
    if (!archivo) return;
    setSubiendo(true);
    try {
      const form = new FormData();
      form.append('imagen', archivo);
      // Sin Content-Type manual: axios arma el boundary del multipart.
      const res = await api.post('/api/perfil/me/foto', form);
      onActualizado(res.data.data);
      setArchivo(null);
      toast.success('Foto actualizada');
    } catch (err) {
      toast.error(mensajeDeError(err, 'No pudimos subir tu foto'));
    } finally {
      setSubiendo(false);
    }
  };

  const volverAlDefault = async () => {
    setReseteando(true);
    try {
      const res = await api.delete('/api/perfil/me/imagen');
      onActualizado(res.data.data);
      setArchivo(null);
      setConfirmarReset(false);
      toast.success('Volviste a la imagen por defecto');
    } catch (err) {
      toast.error(mensajeDeError(err, 'No pudimos restablecer tu imagen'));
    } finally {
      setReseteando(false);
    }
  };

  return (
    <div className="cfg-imagen">
      {/* ── Estado actual ── */}
      <div className="cfg-imagen-actual">
        <div className="cfg-imagen-stage">
          {imagen.type === 'avatar' ? (
            <NexiaAvatar config={imagen.config} size={180} frame="full" alt="Tu avatar actual" />
          ) : (
            <ProfileImage
              usuario={perfil}
              size={180}
              nombre={perfil.nombre}
              apellido={perfil.apellido}
              alt="Tu imagen de perfil actual"
            />
          )}
        </div>
        <p className="cfg-imagen-tipo">
          {imagen.type === 'avatar' && 'Estás usando un avatar NEXIA'}
          {imagen.type === 'foto' && 'Estás usando una foto propia'}
          {imagen.type === 'default' && 'Estás usando la imagen por defecto'}
        </p>
      </div>

      {/* ── Acciones ── */}
      <div className="cfg-imagen-panel">
        <div className="cfg-opciones">
          <button
            type="button"
            className="cfg-opcion"
            onClick={() => setEditorAbierto(true)}
            disabled={subiendo || reseteando}
          >
            <span className="cfg-opcion-icon">{IconAvatar}</span>
            <span className="cfg-opcion-texto">
              <span className="cfg-opcion-titulo">Personalizar avatar</span>
              <span className="cfg-opcion-desc">Creá tu personaje: piel, pelo, ojos y accesorios.</span>
            </span>
          </button>

          <button
            type="button"
            className="cfg-opcion"
            onClick={() => fileRef.current?.click()}
            disabled={subiendo || reseteando}
          >
            <span className="cfg-opcion-icon">{IconFoto}</span>
            <span className="cfg-opcion-texto">
              <span className="cfg-opcion-titulo">Subir foto</span>
              <span className="cfg-opcion-desc">JPG, PNG o WEBP · hasta 5 MB.</span>
            </span>
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={elegirArchivo}
        />

        {/* ── Preview de la foto elegida ── */}
        {preview && (
          <div className="cfg-preview">
            <img className="cfg-preview-img" src={preview} alt="Vista previa de la foto elegida" />
            <div className="cfg-preview-info">
              <span className="cfg-preview-nombre">{archivo?.name}</span>
              <span className="cfg-preview-peso">
                {((archivo?.size ?? 0) / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <div className="cfg-preview-acciones">
              <button
                type="button"
                className="cfg-btn cfg-btn--ghost"
                onClick={() => setArchivo(null)}
                disabled={subiendo}
              >
                Descartar
              </button>
              <button
                type="button"
                className="cfg-btn cfg-btn--primary"
                onClick={subirFoto}
                disabled={subiendo}
              >
                {subiendo && <span className="cfg-btn-spinner" aria-hidden="true" />}
                {subiendo ? 'Subiendo…' : 'Guardar foto'}
              </button>
            </div>
          </div>
        )}

        {/* Regla del backend, dicha antes de que sorprenda */}
        <p className="cfg-aviso">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 7.5v.5" />
          </svg>
          Sólo podés tener una imagen a la vez: al guardar un avatar se elimina tu foto,
          y al subir una foto se elimina tu avatar.
        </p>

        {tieneImagen && (
          <>
            <div className="cfg-divider cfg-divider--ancho" />
            <button
              type="button"
              className="cfg-link-btn cfg-link-btn--danger"
              onClick={() => setConfirmarReset(true)}
              disabled={subiendo || reseteando}
            >
              Volver a la imagen por defecto
            </button>
          </>
        )}
      </div>

      <AvatarEditor
        open={editorAbierto}
        configInicial={perfil.avatar_config}
        guardando={guardandoAvatar}
        onGuardar={guardarAvatar}
        onCancelar={() => setEditorAbierto(false)}
      />

      <ConfirmDialog
        open={confirmarReset}
        title="¿Volver a la imagen por defecto?"
        message={
          imagen.type === 'foto'
            ? 'Se va a eliminar tu foto de perfil. Esta acción no se puede deshacer.'
            : 'Se va a eliminar tu avatar personalizado. Esta acción no se puede deshacer.'
        }
        confirmLabel="Sí, restablecer"
        danger
        busy={reseteando}
        onConfirm={volverAlDefault}
        onCancel={() => setConfirmarReset(false)}
      />
    </div>
  );
};

export default ImagenPerfil;
