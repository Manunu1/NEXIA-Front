import SidebarGestor from "../../../Componentes/Gestor/SidebarGestor";
import FormAsignarMateriaProfesor from "../../../Componentes/Gestor/FormAsignarMateriaProfesor";

function AsignacionesGestor() {
  return (
    <>
      <SidebarGestor />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Asignaciones</h1>
              <p className="page-subtitle">Vinculá docentes con sus materias y cursos</p>
            </div>
          </div>
          <FormAsignarMateriaProfesor />
        </main>
      </div>
    </>
  );
}

export default AsignacionesGestor;
