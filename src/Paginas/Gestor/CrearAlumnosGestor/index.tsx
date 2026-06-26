import SidebarGestor from "../../../Componentes/Gestor/SidebarGestor";
import FormCrearAlumno from "../../../Componentes/Gestor/FormCrearAlumno";

function AlumnosGestor() {
  return (
    <>
      <SidebarGestor />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Gestionar Alumnos</h1>
              <p className="page-subtitle">Registrá nuevos estudiantes en la institución</p>
            </div>
          </div>
          <FormCrearAlumno />
        </main>
      </div>
    </>
  );
}

export default AlumnosGestor;
