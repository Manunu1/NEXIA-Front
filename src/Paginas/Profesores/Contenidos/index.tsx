import React, { useState } from 'react';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import ListaContenido from '../../../Componentes/profesor/listaContenido';
import { Link, useParams } from 'react-router-dom';




const Contenidos: React.FC = () => {
  const{ profeCursoMateriaId } = useParams<{profeCursoMateriaId: string}>();
  return (
    <>
      <Sidebar />
      <section>
        <h1>Contenidos</h1>
        <Link key={profeCursoMateriaId} to={`/crear-contenido/${profeCursoMateriaId}`}>
          <button className="btn-simple">Crear Contenido</button>
        </Link>
        <ListaContenido />
        </section>
      <Footer />
    </>
  );
}

export default Contenidos;