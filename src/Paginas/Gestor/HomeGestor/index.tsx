import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./homeGestor.css";

function HomeGestor() {
  const navigate = useNavigate();

  const [alumnos, setAlumnos] = useState(0);
  const [profesores, setProfesores] = useState(0);
  const [cursos, setCursos] = useState(0);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const institucionId = localStorage.getItem("institucion_id");

        if (!institucionId) {
          console.error("No se encontró institucion_id en localStorage");
          return;
        }

        const [alumnosRes, profesoresRes, cursosRes] = await Promise.all([
          fetch(
            `http://localhost:3000/api/alumnos?institucion_id=${institucionId}`
          ),
          fetch(
            `http://localhost:3000/api/profesores?institucion_id=${institucionId}`
          ),
          fetch(
            `http://localhost:3000/api/cursos?institucion_id=${institucionId}`
          ),
        ]);

        const alumnosData = await alumnosRes.json();
        const profesoresData = await profesoresRes.json();
        const cursosData = await cursosRes.json();

        setAlumnos(alumnosData.data?.length || 0);
        setProfesores(profesoresData.data?.length || 0);
        setCursos(cursosData.data?.length || 0);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className="home-gestor">
      <h1>Panel de Gestión</h1>

      <div className="resumen-grid">
        <div className="resumen-card">
          <h2>{alumnos}</h2>
          <p>Alumnos</p>
        </div>

        <div className="resumen-card">
          <h2>{profesores}</h2>
          <p>Profesores</p>
        </div>

        <div className="resumen-card">
          <h2>{cursos}</h2>
          <p>Cursos</p>
        </div>
      </div>

      <div className="acciones-grid">
        <button onClick={() => navigate("/gestor/alumnos")}>
          Gestionar Alumnos
        </button>

        <button onClick={() => navigate("/gestor/profesores")}>
          Gestionar Profesores
        </button>

        <button onClick={() => navigate("/gestor/asignaciones")}>
          Asignaciones
        </button>
      </div>
    </div>
  );
}

export default HomeGestor;