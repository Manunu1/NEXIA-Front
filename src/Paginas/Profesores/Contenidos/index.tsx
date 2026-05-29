import React, { useState } from 'react';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import Contenido from '../../../Componentes/profesor/Contenido';


interface TrabajoData {
  id: string; 
  titulo: string;
  descripcion: string;
  tipo: string;
}

const Contenidos: React.FC = () => {
  const [trabajos, setTrabajos] = useState<TrabajoData[]>([]);

  return (
    <>
      <Sidebar />
      <section>
        <h1>Contenidos</h1>
        <div className="materias-grid">
          {trabajos.map((item) => (
            <Contenido 
              key={item.id}
              titulo={item.titulo} 
              descripcion={item.descripcion} 
              tipo={item.tipo}
            />
          ))}
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Contenidos;