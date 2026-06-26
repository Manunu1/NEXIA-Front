import SidebarGestor from "../../../Componentes/Gestor/SidebarGestor";
import FormCrearProfesor from "../../../Componentes/Gestor/FormCrearProfesor";

function ProfesoresGestor() {
  return (
    <>
      <SidebarGestor />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Gestionar Profesores</h1>
              <p className="page-subtitle">Registrá nuevos docentes en la institución</p>
            </div>
          </div>
          <FormCrearProfesor />
        </main>
      </div>
    </>
  );
}

export default ProfesoresGestor;
