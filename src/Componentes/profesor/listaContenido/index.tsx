
import React, { useEffect, useState } from "react";
import Contenido from "../Contenido";
import type { typeContenido } from "../../../Types/profesores/types";
import axios from "axios";


const ListaContenido = ({idCurso:Number}) => {
  const [contenido, setContenido] = useState<typeContenido[]>([]);

 let id = 1;
useEffect(() => {
    const traerMaterias = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/contenidos/profesor/${id}`);
        const contenido: typeContenido[] = res.data.data;
        setContenido(contenido);
      } catch (error) {
        console.error("Error al obtener los datos de los contenidos:", error);
      }
    };
    traerMaterias();
  }, []);

  return (

        <div className="materias-grid">
                {contenido.map((item) => (
                    <Contenido id={id}key={item.id}titulo={item.titulo} descripcion={item.descripcion} tipo_contenido={item.tipo_contenido}
                    />
                ))}
        </div>
  );
};

export default ListaContenido;