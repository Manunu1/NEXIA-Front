import { useNavigate } from "react-router-dom";

function HomeGestor() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Panel de Gestión</h1>

      <button onClick={() => navigate("/gestor/alumnos")}>Alumnos</button>

      <button onClick={() => navigate("/gestor/profesores")}>Profesores</button>

      <button onClick={() => navigate("/gestor/asignaciones")}>
        Asignaciones
      </button>
    </div>
  );
}

export default HomeGestor;
