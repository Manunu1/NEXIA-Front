import React, { useState } from 'react';
import type { typeContenidoForm, typeTipoContenido } from '../../../Types/profesores/types';

const CrearContenido: React.FC = () => {
  // Estado del formulario
  const [formData, setFormData] = useState<typeContenidoForm>({
    titulo: '',
    descripcion: '',
    tipo_contenido_id: 0,
    archivo_url: '',
  });

  const [tipos, setTipos] = useState<typeTipoContenido[]>([
    { id: 1, nombre: 'Tarea' },
    { id: 2, nombre: 'Teoría' },
    { id: 3, nombre: 'Evaluación' }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tipo_contenido_id' ? Number(value) : value
    }));
  };

  const Submit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos a enviar a la tabla contenido:', formData);
    // Aquí realizarías el POST a tu API
  };

  return (
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
  );
};

export default CrearContenido;