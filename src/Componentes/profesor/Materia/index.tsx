import React from "react";
import './materia.css';

interface MateriaProps {
  materia: string;
  grado: string;
  anio: number;
  descripcion: string;
}

const Materia: React.FC<MateriaProps> = ({ materia, grado, anio, descripcion}) => {
  return (
    <div className="card">
        <h2>{materia} {anio} {grado}</h2>
        <p>{descripcion}</p>
    </div>
  );
};
export default Materia;