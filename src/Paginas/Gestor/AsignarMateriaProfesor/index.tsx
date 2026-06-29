import SidebarGestor from "../../../Componentes/Gestor/SidebarGestor";
import FormAsignarMateriaProfesor from "../../../Componentes/Gestor/FormAsignarMateriaProfesor";
import "./asignarMateriaProfesor.css";

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

          <div className="gestor-page-layout">
            <aside className="gestor-page-info">
              <div className="gpi-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </div>
              <div>
                <h3 className="gpi-title">Vincular docente</h3>
                <p className="gpi-desc">Seleccioná el profesor, el curso y la materia para crear la asignación. El docente podrá gestionar contenidos para ese grupo.</p>
              </div>
              <ul className="gpi-steps">
                <li className="gpi-step">
                  <span className="gpi-step-num">1</span>
                  <span className="gpi-step-text">Elegí el profesor</span>
                </li>
                <li className="gpi-step">
                  <span className="gpi-step-num">2</span>
                  <span className="gpi-step-text">Seleccioná el curso</span>
                </li>
                <li className="gpi-step">
                  <span className="gpi-step-num">3</span>
                  <span className="gpi-step-text">Asignale la materia</span>
                </li>
              </ul>
            </aside>

            <FormAsignarMateriaProfesor />
          </div>
        </main>
      </div>
    </>
  );
}

export default AsignacionesGestor;
