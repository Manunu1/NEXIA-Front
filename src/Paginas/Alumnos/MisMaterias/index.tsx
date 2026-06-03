import React, { useEffect, useState } from 'react';
import CardMateria from '../../../Componentes/alumnos/CardMaterias';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import './misMaterias.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface MateriaBackend {
  materia_id: string;
  materia_nombre: string;
  curso_id: string;
  anio: number;
  division: string;
  profesor_nombre: string;
  profesor_apellido: string;
  avatar_url?: string;
}

const MisMaterias: React.FC = () => {
  const [materias, setMaterias] = useState<MateriaBackend[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const traerMaterias = async () => {
      try {
        const session = localStorage.getItem('usuario');
        if (!session) {
          setError("No se detectó una sesión activa. Por favor, iniciá sesión.");
          return;
        }

        const userParsed = JSON.parse(session);
        const alumnoId = userParsed.alumno_id; // Asegurate que esto sea el ID autoincremental y no el DNI

        if (!alumnoId) {
          setError("El perfil de usuario no corresponde a un alumno válido.");
          return;
        }

        const res = await axios.get(`http://localhost:3000/api/alumnos/${alumnoId}/materias`);
        
        // Guardamos los datos directamente como hacías en Profesores
        setMaterias(res.data.data);
      } catch (error) {
        console.error("Error al obtener las materias del alumno:", error);
        setError("Error al conectar con el servidor de la plataforma.");
      }
    };

    traerMaterias();
  }, []); // Array vacío para que no se ejecute infinitamente

  return (
    <>
      <Sidebar />
      <section className="mismaterias-section">
        <h1 className="mismaterias-title">Mis Materias</h1>
        
        {error && <p className="error-mensaje" style={{ color: 'red' }}>{error}</p>}

        {/* Si la API devuelve [], mostramos el cartel de advertencia */}
        {materias.length === 0 ? (
          <div className="no-materias-fallback">
            <p>No te encontrás inscrito en ninguna materia para este ciclo lectivo.</p>
          </div>
        ) : (
          <div className="materias-grid">
            {materias.map((item) => (
              /* Enlazamos directo a la ruta de tu App.tsx: /materia/:materiaId */
              <Link key={item.materia_id} to={`/materia/${item.materia_id}`}>
                <CardMateria
                  titulo={item.materia_nombre}
                  curso={`${item.anio}° "${item.division}"`}
                  profesor={`${item.profesor_nombre} ${item.profesor_apellido}`}
                  avatarUrl={item.avatar_url || "https://via.placeholder.com/150"}
                />
              </Link>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}

export default MisMaterias;