import React, { useState } from 'react';
import NexiaAvatar from '../NexiaAvatar';
import NexiaMascota from '../NexiaMascota';
import type { AvatarExpresion, AvatarSize, ConImagenDePerfil } from '../../Types/perfil';
import { pxAvatar } from '../../utils/avatar';
import { getIniciales, getProfileImage } from '../../utils/profileImage';
import './profileImage.css';

/* ─────────────────────────────────────────────
   PROFILE IMAGE — resuelve avatar / foto / default
   y lo renderiza redondo. Es el punto único donde
   la app decide qué imagen mostrarle a un usuario:
   sidebar, listados, mensajes y comentarios montan
   este componente, no un <img> propio.

   Para "quién está hablando" (compañero, guía,
   vacíos) va <AvatarAnimado /> en su lugar: ahí la
   foto no sirve porque no gesticula.
───────────────────────────────────────────── */

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
  const px = pxAvatar(size);

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

  // Sin imagen: las iniciales identifican mejor a una persona concreta en un
  // listado que un dibujo repetido. Cuando no hay ni nombre legible, aparece
  // Nexo — es el rostro por defecto de la app, no una silueta anónima.
  const iniciales = getIniciales(nombre, apellido);

  if (!iniciales) {
    return <NexiaMascota size={px} frame="circle" className={className} alt={alt} />;
  }

  return (
    <span
      className={`nx-profile-default ${className}`.trim()}
      style={{ width: px, height: px }}
      role={alt ? 'img' : undefined}
      aria-label={alt}
      aria-hidden={alt ? undefined : true}
    >
      <span className="nx-profile-initials" style={{ fontSize: px * 0.38 }}>
        {iniciales}
      </span>
    </span>
  );
};

export default ProfileImage;
