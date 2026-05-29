import React from "react";
import type { typeContenido } from "../../../Types/profesores/types";

const Contenido: React.FC<typeContenido> = ({ titulo, descripcion, tipo }) => {
  return (
    <div className="card">
        <h2>{titulo}</h2>
        <h3>{tipo}</h3>
        <p>{descripcion}</p>
    </div>
  );
};

export default Contenido;