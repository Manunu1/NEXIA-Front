import React from "react";
import type { typeContenido } from "../../../Types/profesores/types";

const Contenido: React.FC<typeContenido> = ({ titulo, descripcion, tipo_contenido }) => {
  return (
    <div className="card">
        <h2>{titulo}</h2>
        <h4>{tipo_contenido}</h4>
        <p>{descripcion}</p>
    </div>
  );
};

export default Contenido;