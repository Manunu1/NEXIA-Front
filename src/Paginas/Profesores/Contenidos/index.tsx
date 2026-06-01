import React, { useState } from 'react';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import ListaContenido from '../../../Componentes/profesor/listaContenido';




const Contenidos: React.FC = () => {

  return (
    <>
      <Sidebar />
      <section>
        <h1>Contenidos</h1>
        <ListaContenido />
        </section>
      <Footer />
    </>
  );
}

export default Contenidos;