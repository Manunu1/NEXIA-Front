import React, { useState } from 'react';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import ListaContenido from '../../../Componentes/profesor/listaContenido';
import { useParams } from 'react-router-dom';




const Contenidos: React.FC = () => {
  const{id} = useParams<{id: string}>();
  return (
    <>
      <Sidebar />
      <section>
        <h1>Contenidos</h1>
        <ListaContenido idCurso={Number(id)} />
        </section>
      <Footer />
    </>
  );
}

export default Contenidos;