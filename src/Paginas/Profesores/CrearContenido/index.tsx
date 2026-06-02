import React, { useEffect, useState } from 'react';
import type { typeContenido, typeContenidoForm, typeTipoContenido } from '../../../Types/profesores/types';
import './CrearContenido.css';
import axios from 'axios';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';

const CrearContenido: React.FC = () => {
  // Estado del formulario
  const [formData, setFormData] = useState<typeContenidoForm>({
    titulo: '',
    descripcion: '',
    tipo_contenido_id: 0,
    archivo_url: '',
    profe_curso_materia_id: 1,
  });

  const [tipos, setTipos] = useState<typeTipoContenido[]>([]);

  useEffect(() => {
      const traerMaterias = async () => {
        try {
          const res = await axios.get(`http://localhost:3000/api/tipos-contenido `);
          const listaTipos: typeTipoContenido[] = res.data.data;
          setTipos(listaTipos);
        } catch (error) {
          console.error("Error al obtener los datos de los contenidos:", error);
        }
      };
      traerMaterias();
    }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tipo_contenido_id' ? Number(value) : value
    }));
  };

  const Submit = async  (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post<typeContenidoForm>(
        'http://localhost:3000/api/contenidos',
        formData
      );
      alert('Contenido guardado correctamente');
    } catch (error) {
      alert('Hubo un error al guardar');
      console.error('Error al guardar contenido:', error);
    }
   
  };

  return (
    <>
    <Sidebar />

    <section>
    <form onSubmit={Submit} className="form-subida">
      <h2>Subir Nuevo Contenido</h2>

      <input
        name="titulo"
        placeholder="Título del contenido"
        value={formData.titulo}
        onChange={handleChange}
        required
      />

      <textarea
        name="descripcion"
        placeholder="Descripción"
        value={formData.descripcion}
        onChange={handleChange}
      />

      <select 
        name="tipo_contenido_id" 
        value={formData.tipo_contenido_id} 
        onChange={handleChange}
        required
      >
        <option value={0}>Seleccione un tipo...</option>
        {tipos.map(t => (
          <option key={t.id} value={t.id}>{t.nombre}</option>
        ))}
      </select>

      <input
        name="archivo_url"
        placeholder="URL del archivo"
        value={formData.archivo_url}
        onChange={handleChange}
        required
      />

      <button type="submit">Guardar Contenido</button>
    </form>
    </section>
    <Footer/>
    </>
  );
};

export default CrearContenido;