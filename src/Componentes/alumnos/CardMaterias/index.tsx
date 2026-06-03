
import React from 'react';
import './cardmaterias.css';

interface CardMateriaProps {
  curso: string | number;
  titulo: string;
  profesor: string;
  avatarUrl: string;
}

const CardMateria: React.FC<CardMateriaProps> = ({ curso, titulo, profesor, avatarUrl }) => {
  return (
    <div className="card-materia">
      <div className="card-header">
        <span className="card-badge">{curso}</span>
      </div>
      
      <h2 className="card-title">{titulo}</h2>
      
      <div className="card-profesor">
        <img 
          src={avatarUrl} 
          alt={`Avatar de ${profesor}`} 
          className="profesor-avatar" 
        />
        <span className="profesor-nombre">{profesor}</span>
      </div>
    </div>
  );
};

export default CardMateria;