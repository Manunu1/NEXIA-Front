
import React, { useEffect, useState } from "react";
import Contenido from "../Contenido";
import type { typeContenido } from "../../../Types/profesores/types";
import axios from "axios";

type Props = {
  profeCursoMateriaID: number;
};

const ListaContenido: React.FC<Props> = ({profeCursoMateriaID}) => {
  const [contenido, setContenido] = useState<typeContenido[]>([]);

useEffect(() => {
    const traerContenidos = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/contenidos/profe-curso-materia/${profeCursoMateriaID}`);
        const contenido: typeContenido[] = res.data.data.contenidos;
        setContenido(contenido);
      } catch (error) {
        console.error("Error al obtener los datos de los contenidos:", error);
      }
    };
    traerContenidos();
  }, []);

  return (

        <div className="materias-grid">
                {contenido.map((item) => (
                    <Contenido id={item.id}key={item.id}titulo={item.titulo} descripcion={item.descripcion} tipo_contenido={item.tipo_contenido}
                    />
                ))}
        </div>
  );
};

export default ListaContenido;