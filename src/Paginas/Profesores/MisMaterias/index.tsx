import React, { useState } from 'react';
import Materia from '../../../Componentes/profesor/Materia';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import './misCursos.css';

interface CursoData {
  id: number;
  materia: string;
  grado: string;
  anio: number;
  descripcion: string;
}

const MisCursos: React.FC = () => {
const [materias, setMaterias] = useState<CursoData[]>([
  {
    id: 1,
    materia: "Matemáticas",
    grado: "A",
    anio: 5,
    descripcion: "Estudio avanzado de análisis matemático, funciones y cálculo diferencial."
  },
  {
    id: 2,
    materia: "Lengua",
    grado: "A",
    anio: 5,
    descripcion: "Análisis literario crítico, comprensión de textos complejos y redacción académica."
  },
  {
    id: 3,
    materia: "Ciencias Naturales",
    grado: "A",
    anio: 5,
    descripcion: "Conceptos profundizados de física y química aplicados a fenómenos del mundo real."
  },
  {
    id: 4,
    materia: "Historia",
    grado: "A",
    anio: 5,
    descripcion: "Análisis de procesos históricos contemporáneos, geopolítica y formación del estado moderno."
  },
  {
    id: 5,
    materia: "Geografía",
    grado: "A",
    anio: 5,
    descripcion: "Estudio de las dinámicas socioeconómicas globales y organización del territorio nacional."
  }
]);

  return (
    <>
      <Sidebar />
      <section>
        <h1>Mis Cursos</h1>
        <div className="materias-grid">
          {materias.map((item) => (
            <Materia
              key={item.id}
              materia={item.materia}
              grado={item.grado}
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