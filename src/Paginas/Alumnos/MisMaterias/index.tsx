import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import CardMateria from '../../../Componentes/alumnos/CardMaterias'
import Sidebar from '../../../Componentes/alumnos/Sidebar'
import Footer from '../../../Componentes/footer'
import './misMaterias.css'

// Estructura de datos real que devuelve el Backend de NEXIA para las materias
interface MateriaBackend {
  materia_id: string;
  materia_nombre: string;
  curso_id: string;
  anio: number;
  division: string;
  profesor_nombre: string;
  profesor_apellido: string;
  avatar_url?: string; // URL opcional para el avatar del docente
}

interface ApiResponse {
  ok: boolean;
  message: string;
  data: MateriaBackend[];
}

function MisMaterias() {
  const navigate = useNavigate();
  
  // Estado con tipado estricto para almacenar las materias de la base de datos
  const [materias, setMaterias] = useState<MateriaBackend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMateriasAlumno = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtención segura de los datos de sesión almacenados en el Login
        const session = localStorage.getItem('user');
        if (!session) {
          setError('No se detectó una sesión activa. Por favor, iniciá sesión.');
          setLoading(false);
          return;
        }

        const userParsed = JSON.parse(session);
        const alumnoId = userParsed.alumno_id; // Mapeado directamente del objeto data del login

        if (!alumnoId) {
          setError('El perfil de usuario no corresponde a un alumno válido.');
          setLoading(false);
          return;
        }

        // Petición al endpoint correspondiente detallado en la documentación de la API
        const response = await axios.get<ApiResponse>(
          `http://localhost:3000/api/alumnos/${alumnoId}/materias`
        );

        if (response.data.ok && response.data.data) {
          setMaterias(response.data.data);
        } else {
          setError(response.data.message || 'Error al recuperar las materias.');
        }
      } catch (err: any) {
        console.error('Error en la conexión con la API de materias:', err);
        setError('Error al conectar con el servidor de la plataforma.');
      } finally {
        setLoading(false);
      }
    };

    fetchMateriasAlumno();
  }, []);

  // Navegación hacia la pantalla VerContenido enviando el ID de la materia
  // Pasamos "inicio" como parámetro por defecto para que el visualizador cargue el primer recurso disponible
  const handleMateriaClick = (materiaId: string) => {
    navigate(`/materia/${materiaId}/contenido/inicio`);
  };

  if (loading) {
    return (
      <>
        <Sidebar />
        <section className="nexia-status-container">
          <div className="nexia-loading-spinner"></div>
          <p>Cargando tus materias asignadas...</p>
        </section>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Sidebar />
        <section className="nexia-status-container">
          <div className="nexia-error-box">
            <p>{error}</p>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <section className="mismaterias-section">
        <h1 className="mismaterias-title">Mis Materias</h1>
        
        {materias.length === 0 ? (
          <div className="no-materias-fallback">
            <p>No te encontrás inscrito en ninguna materia para este ciclo lectivo.</p>
          </div>
        ) : (
          <div className="materias-grid">
            {materias.map((item) => (
              <div 
                key={item.materia_id} 
                onClick={() => handleMateriaClick(item.materia_id)}
                className="card-materia-wrapper"
                style={{ cursor: 'pointer' }}
                title={`Ver contenido de ${item.materia_nombre}`}
              >
                <CardMateria
                  titulo={item.materia_nombre}
                  curso={`${item.anio}° "${item.division}"`}
                  profesor={`${item.profesor_nombre} ${item.profesor_apellido}`}
                  avatarUrl={item.avatar_url || "https://via.placeholder.com/150"}
                />
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  )
}

export default MisMaterias;