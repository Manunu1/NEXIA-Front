import React from 'react';
import './cardmaterias.css';

interface CardMateriaProps {
  curso: string | number;
  titulo: string;
  profesor: string;
  avatarUrl: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const CardMateria: React.FC<CardMateriaProps> = ({ curso, titulo, profesor, avatarUrl }) => {
  const nombreProfe = profesor && profesor.trim() && profesor !== 'undefined undefined' ? profesor : '';
  const initials = nombreProfe ? getInitials(nombreProfe) : 'P';
  const [imgOk, setImgOk] = React.useState(!!avatarUrl);

  return (
    <div className="card-materia">
      <div className="card-header">
        <span className="card-badge">{curso}</span>
      </div>

      <h2 className="card-title">{titulo}</h2>

      {nombreProfe && (
        <div className="card-profesor">
          <div className="profesor-avatar-wrap">
            {imgOk && avatarUrl ? (
              <img
                src={avatarUrl}
                alt={nombreProfe}
                className="profesor-avatar"
                onError={() => setImgOk(false)}
              />
            ) : (
              <span className="profesor-avatar-initials">{initials}</span>
            )}
          </div>
          <span className="profesor-nombre">{nombreProfe}</span>
        </div>
      )}
    </div>
  );
};

export default CardMateria;
