import React, { useState } from 'react';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import ListaContenido from '../../../Componentes/profesor/listaContenido';
import { useParams } from 'react-router-dom';
import type { typeContenido } from '../../../Types/profesores/types';
import axios from 'axios';

const ContenidosAlumnos: React.FC = () => {
    const{ profeCursoMateriaId } = useParams<{profeCursoMateriaId: string}>();
  const [contenido, setContenido] = useState<typeContenido[]>([]);
  const traerContenidos = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/contenidos/profe-curso-materia/${profeCursoMateriaId}`);
        const contenido: typeContenido[] = res.data.data.contenidos;
        setContenido(contenido);
      } catch (error) {
        console.error("Error al obtener los datos de los contenidos:", error);
      }
    };
    traerContenidos();

  return (
    <>
      <Sidebar />
      <section>
        <h1>Contenidos</h1>
        <ListaContenido contenidos={contenido} />
        </section>
      <Footer />
    </>
  );
}

export default ContenidosAlumnos;