import React from 'react';
import NexiaAvatar from '../NexiaAvatar';
import NexiaMascota from '../NexiaMascota';
import type { AvatarExpresion, AvatarFrame, AvatarSize, ConImagenDePerfil } from '../../Types/perfil';
import { getAvatarAnimable } from '../../utils/profileImage';

/* ─────────────────────────────────────────────
   AVATAR ANIMADO — la cara del compañero.

   Punto único donde la app decide QUIÉN te habla:
   tu avatar si lo armaste, y Nexo si no (o si usás
   una foto, porque una foto no gesticula).

   Es el hermano de <ProfileImage />, no su reemplazo:
   ProfileImage responde "¿quién es esta persona?" y
   se usa en listados, mensajes y sidebar. Este
   responde "¿quién está hablando?" y se usa donde
   el avatar actúa como personaje.
───────────────────────────────────────────── */

interface AvatarAnimadoProps {
  usuario?: ConImagenDePerfil | null;
  size?: AvatarSize | number;
  frame?: AvatarFrame;
  expresion?: AvatarExpresion;
  /** Vida propia. Sólo la respeta Nexo: un retrato no respira. */
  animado?: boolean;
  backdrop?: boolean;
  className?: string;
  alt?: string;
}

const AvatarAnimado: React.FC<AvatarAnimadoProps> = ({
  usuario,
  size = 'md',
  frame = 'circle',
  expresion = 'normal',
  animado = false,
  backdrop = true,
  className = '',
  alt,
}) => {
  const cara = getAvatarAnimable(usuario);

  if (cara.type === 'avatar') {
    return (
      <NexiaAvatar
        config={cara.config}
        size={size}
        frame={frame}
        expresion={expresion}
        backdrop={backdrop}
        className={className}
        alt={alt}
      />
    );
  }

  return (
    <NexiaMascota
      size={size}
      frame={frame}
      expresion={expresion}
      animado={animado}
      backdrop={backdrop}
      className={className}
      alt={alt ?? 'Nexo, tu compañero de NEXIA'}
    />
  );
};

export default AvatarAnimado;
