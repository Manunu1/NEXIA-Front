import React, { useState } from 'react';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import ListaContenido from '../../../Componentes/profesor/listaContenido';


interface TrabajoData {
  id: string; 
  titulo: string;
  descripcion: string;
  tipo: string;
}

const Contenidos: React.FC = () => {

  return (
    <>
      <Sidebar />
      <section>
        <h1>Contenidos</h1>
        <ListaContenido idCurso={1}/>
        </section>
      <Footer />
    </>
  );
}

export default Contenidos;