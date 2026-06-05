import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import type { typeContenido } from '../../Types/profesores/types';
import Sidebar from '../../Componentes/alumnos/Sidebar';
import Footer from '../../Componentes/footer';

const VerContenido: React.FC = () => {
  // Capturamos el id del contenido desde la URL
  const { contenidoId } = useParams<{ contenidoId: string }>();
  const [contenido, setContenido] = useState<typeContenido | null>(null);

useEffect(() => {
    const traerContenido = async () => {
      try {
        const idparseado = Number(contenidoId);
        
        // Usamos la ruta exacta que me mostraste del router
        const res = await axios.get(`http://localhost:3000/api/contenidos/contenido/${idparseado}`);
        
        console.log("Respuesta del backend:", res.data);

        const dbData = res.data.data || res.data;

        if (!dbData) {
          console.error("No se encontró el contenido en la base de datos");
          return;
        }

        // Mapeo adaptado a tu nueva interfaz
        const contenidoMapeado: typeContenido = {
          contenido_id: dbData.contenido_id, // Ahora coinciden los nombres
          titulo: dbData.titulo,
          descripcion: dbData.descripcion,
          tipo_contenido: dbData.tipo_contenido,
          url: dbData.archivo_url
        };

        setContenido(contenidoMapeado);
      } catch (error) {
        console.error("Error al obtener los datos del contenido:", error);
      }
    };

    if (contenidoId) {
      traerContenido();
    }
  }, [contenidoId]);

  return (
    <>
      <Sidebar />
      <section>
        {contenido ? (
          <div>
            <span>{contenido.tipo_contenido}</span>
            <h1>{contenido.titulo}</h1>
            <p>{contenido.descripcion}</p>
            
            {/* Botón para abrir el recurso */}
            <a href={contenido.url} target="_blank" rel="noopener noreferrer">
              <button className="btn-simple">Abrir Archivo / Enlace</button>
            </a>
            
            <br /><br />
            
            {/* Botón para volver atrás. Ajustá la ruta del 'to' según necesites */}
          </div>
        ) : (
          <p>Cargando contenido...</p>
        )}
      </section>
      <Footer />
    </>
  );
}

export default VerContenido;