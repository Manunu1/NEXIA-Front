import React, { useEffect, useState } from 'react';
import Materia from '../../../Componentes/profesor/Materia';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import './misCursos.css';
import type { typeCurso } from '../../../Types/profesores/types';
import axios from 'axios';



  const MisCursos: React.FC = () => {
const [listaMaterias, setlistaMaterias] = useState<typeCurso[]>([])
let id = 1;
useEffect(() => {
    const traerMaterias = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/contenidos/profesor/${id}`);
        const materia: typeCurso[] = res.data.data;
        setlistaMaterias(materia);
      } catch (error) {
        console.error("Error al obtener los datos de los contenidos:", error);
      }
    };

    traerMaterias();
  });


  return (
    <>
      <Sidebar />
      <section>
        <h1>Mis Cursos</h1>
        <div className="materias-grid">
          {listaMaterias.map((item) => (
            <Materia
              key={item.id}
              materia={item.materia_nombre}
              grado={item.division}
              anio={item.anio}
              descripcion={item.descripcion}
            />
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default MisCursos;