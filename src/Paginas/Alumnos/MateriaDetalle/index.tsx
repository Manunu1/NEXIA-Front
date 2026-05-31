import { useEffect, useState } from 'react';
import axios from 'axios';
import MateriaHeader from '../../../Componentes/alumnos/MateriaHeader';
import ContenidoItem from '../../../Componentes/alumnos/ContenidoItem';
import { type Materia } from '../../../type';
import './materiaDetalle.css';

export default function MateriaDetalle() {
  const [materia, setMateria] = useState<Materia | null>(null);
  const [loading, setLoading] = useState(true);

  // Valores hardcodeados para el ejemplo, deberían venir de tu Auth Context y React Router (useParams)
  const alumnoId = 1; //conseguir alumno_id del localStorage
  const materiaIdTarget = 1; 

  useEffect(() => {
    const fetchMateriaData = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/alumnos/${alumnoId}/materias`);
        const materias: Materia[] = res.data.data;
        
        // Buscamos la materia específica que el usuario clickeó en la pantalla anterior
        const materiaEncontrada = materias.find(m => m.materia_id === materiaIdTarget);
        setMateria(materiaEncontrada || null);
      } catch (error) {
        console.error("Error al obtener los datos de la materia:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMateriaData();
  }, []);

  if (loading) return <div className="layout-materia">Cargando...</div>;
  if (!materia) return <div className="layout-materia">Materia no encontrada</div>;

  // Extraemos datos del profesor del primer contenido (workaround por falta de datos en API)
  const primerContenido = materia.contenidos[0];

  return (
    <div className="layout-materia">
      <MateriaHeader 
        nombre={materia.materia_nombre}
        anio={materia.anio}
        division={materia.division}
        profesorNombre={primerContenido?.profesor_nombre}
        profesorApellido={primerContenido?.profesor_apellido}
      />

      <div className="main-content-area">
        {/* Contenedor principal izquierdo (70%) */}
        <div className="contenidos-list">
          <div className="section-block">
            <div className="section-header">
              <h3>📚 Material de Estudio</h3>
              <span>{materia.contenidos.length} Archivos</span>
            </div>
            
            {materia.contenidos.map(contenido => (
              <ContenidoItem key={contenido.contenido_id} contenido={contenido} />
            ))}
          </div>
        </div>

        {/* El Sidebar derecho (30%) queda vacío por ahora, esperando el backend */}
        <div className="sidebar-derecho">
           {/* Aquí irán los widgets de progreso y tutorías en el futuro */}
        </div>
      </div>
    </div>
  );
}