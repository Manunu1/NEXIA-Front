import Sidebar from "../../../Componentes/Sidebar";
import FormCrearProfesor from "../../../Componentes/Gestor/FormCrearProfesor";
import "./crearProfesoresGestor.css";
import { usePageTitle } from '../../../hooks/usePageTitle';

function ProfesoresGestor() {
  usePageTitle('Gestión de profesores');
  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header page-header--center">
            <div>
              <h1 className="page-title">Gestionar Profesores</h1>
              <p className="page-subtitle">Registrá nuevos docentes en la institución</p>
            </div>
          </div>

          <div className="gestor-page-layout">
            <aside className="gestor-page-info">
              <div className="gpi-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div>
                <h3 className="gpi-title">Alta de docente</h3>
                <p className="gpi-desc">Completá el formulario para registrar un nuevo profesor. Una vez creado, podés asignarle materias y cursos desde la sección de asignaciones.</p>
              </div>
              <ul className="gpi-steps">
                <li className="gpi-step">
                  <span className="gpi-step-num">1</span>
                  <span className="gpi-step-text">Datos personales del docente</span>
                </li>
                <li className="gpi-step">
                  <span className="gpi-step-num">2</span>
                  <span className="gpi-step-text">Selección de institución</span>
                </li>
                <li className="gpi-step">
                  <span className="gpi-step-num">3</span>
                  <span className="gpi-step-text">Credenciales de acceso</span>
                </li>
              </ul>
              <div className="gpi-tip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p>
                  Después de crearlo, vinculalo a sus materias y cursos desde{' '}
                  <strong>Asignaciones</strong> para que pueda publicar contenido.
                </p>
              </div>
            </aside>

            <FormCrearProfesor />
          </div>
        </main>
      </div>
    </>
  );
}

export default ProfesoresGestor;
