import React from "react";
import './materia.css';

interface MateriaProps {
  materia: string;
  grado: string | number;
}

const Materia: React.FC<MateriaProps> = ({ materia, grado }) => {
  return (
    <div className="card">
        <h2>{materia} {grado}</h2>
    </div>
  );
};
export default Materia;