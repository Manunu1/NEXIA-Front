
import React, { useEffect, useState } from "react";
import Contenido from "../Contenido";
import type { typeContenido } from "../../../Types/profesores/types";
import axios from "axios";

type Props = {
  contenidos: typeContenido[];
};

const ListaContenido: React.FC<Props> = ({contenidos}) => {
useEffect(() => {
    
  }, []);

  return (

        <div className="materias-grid">
                {contenidos.map((item) => (
                    <Contenido id={item.id}key={item.id}titulo={item.titulo} descripcion={item.descripcion} tipo_contenido={item.tipo_contenido}
                    />
                ))}
        </div>
  );
};

export default ListaContenido;