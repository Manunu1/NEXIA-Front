import React, { useEffect, useState } from 'react';
import CardMateria from '../../../Componentes/alumnos/CardMaterias';
import Sidebar from '../../../Componentes/alumnos/Sidebar';
import Footer from '../../../Componentes/footer';
import './misMaterias.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Estructura de datos que devuelve el Backend
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

  useEffect(() => {
    const traerMaterias = async () => {
      try {
        const session = localStorage.getItem('usuario');
        if (session) {
          const userParsed = JSON.parse(session);
          const alumnoId = userParsed.alumno_id;
          
          const res = await axios.get(`http://localhost:3000/api/alumnos/${alumnoId}/materias`);
          
          // Accedemos a res.data.data basándonos en tu interfaz ApiResponse
          setMaterias(res.data.data);
        }
      } catch (error) {
        console.error("Error al obtener las materias del alumno:", error);
      }
    };

    traerMaterias();
  }, []);

  return (
    <>
      <Sidebar />
      <section className="mismaterias-section">
        <h1 className="mismaterias-title">Mis Materias</h1>
        <div className="materias-grid">
          {materias.map((item) => (
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
      </section>
      <Footer />
    </>
  );
}

export default MisMaterias;