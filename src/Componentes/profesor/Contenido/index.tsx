import React from "react";

interface ContenidoProps {
  titulo: string;
  descripcion: string;
  tipo: string;
}

const Contenido: React.FC<ContenidoProps> = ({ titulo, descripcion, tipo }) => {
  return (
    <div className="card">
        <h2>{titulo}</h2>
        <h3>{tipo}</h3>
        <p>{descripcion}</p>
    </div>
  );
};

export default Contenido;