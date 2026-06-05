
import React, { useEffect } from "react";
import Contenido from "../Contenido";
import type { typeContenido } from "../../../Types/profesores/types";
import { Link } from "react-router-dom";

type Props = {
  contenidos: typeContenido[];
};

const ListaContenido: React.FC<Props> = ({contenidos}) => {
useEffect(() => {
    
  }, []);

  return (

        <div className="materias-grid">
                {contenidos.map((item) => (
                    <Link 
                      key={item.contenido_id} 
                      to={`/verContenido/${item.contenido_id}`} 
                    >
                      <Contenido 
                        contenido_id={item.contenido_id}
                        titulo={item.titulo} 
                        descripcion={item.descripcion} 
                        tipo_contenido={item.tipo_contenido} 
                        url={item.url}
                      />
                    </Link>
                ))}
        </div>
  );
};

export default ListaContenido;