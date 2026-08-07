import React, { useState } from 'react';
import NexiaAvatar from '../NexiaAvatar';
import type { AvatarExpresion, AvatarSize } from '../NexiaAvatar';
import type { ConImagenDePerfil } from '../../Types/perfil';
import { getIniciales, getProfileImage } from '../../utils/profileImage';
import './profileImage.css';

/* ─────────────────────────────────────────────
   PROFILE IMAGE — resuelve avatar / foto / default
   y lo renderiza redondo. Es el punto único donde
   la app decide qué imagen mostrarle a un usuario:
   sidebar, listados, mensajes y comentarios montan
   este componente, no un <img> propio.
───────────────────────────────────────────── */

const TAMANIOS: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 96,
  xl: 220,
};

interface ProfileImageProps {
  usuario?: ConImagenDePerfil | null;
  size?: AvatarSize | number;
  /** Nombre y apellido — sólo para las iniciales del estado por defecto. */
  nombre?: string | null;
  apellido?: string | null;
  className?: string;
  alt?: string;
  /** Sólo aplica si la imagen es un avatar generado; una foto no gesticula. */
  expresion?: AvatarExpresion;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  usuario,
  size = 'md',
  nombre,
  apellido,
  className = '',
  alt,
  expresion,
}) => {
  const imagen = getProfileImage(usuario);
  const px = typeof size === 'number' ? size : TAMANIOS[size];

  // Una foto rota (bucket limpiado, URL vencida) no puede dejar un hueco:
  // se cae al estado por defecto como si no hubiera imagen. Se guarda la URL
  // que falló —y no un booleano— para que una foto nueva se reintente sola.
  const [urlFallida, setUrlFallida] = useState<string | null>(null);

  if (imagen.type === 'avatar') {
    return (
      <NexiaAvatar
        config={imagen.config}
        size={px}
        frame="circle"
        className={className}
        alt={alt}
        expresion={expresion}
      />
    );
  }

  if (imagen.type === 'foto' && urlFallida !== imagen.url) {
    const url = imagen.url;
    return (
      <img
        className={`nx-profile-img ${className}`.trim()}
        style={{ width: px, height: px }}
        src={url}
        alt={alt ?? ''}
        loading="lazy"
        onError={() => setUrlFallida(url)}
      />
    );
  }

  // Sin imagen: iniciales si las hay, si no la marca de Nexia.
  const iniciales = getIniciales(nombre, apellido);

  return (
    <span
      className={`nx-profile-default ${className}`.trim()}
      style={{ width: px, height: px }}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    >
      {iniciales ? (
        <span className="nx-profile-initials" style={{ fontSize: px * 0.38 }}>
          {iniciales}
        </span>
      ) : (
        <svg viewBox="0 0 48 48" width={px} height={px}>
          <circle cx="24" cy="18" r="8" fill="#FFFFFF" opacity="0.9" />
          <path
            d="M 8 44 C 8 33 15 28 24 28 C 33 28 40 33 40 44 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
          <circle cx="37" cy="12" r="4" fill="#FF9800" />
        </svg>
      )}
    </span>
  );
};

export default ProfileImage;
