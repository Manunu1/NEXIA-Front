import Sidebar from "../../../Componentes/Sidebar";
import FormCrearAlumno from "../../../Componentes/Gestor/FormCrearAlumno";
import "./CrearAlumnosGestor.css";
import { usePageTitle } from '../../../hooks/usePageTitle';

function AlumnosGestor() {
  usePageTitle('Gestión de alumnos');
  return (
    <>
      <Sidebar />
      <div className="main-wrapper">
        <main className="main-content">
          <div className="page-header page-header--center">
            <div>
              <h1 className="page-title">Gestionar Alumnos</h1>
              <p className="page-subtitle">Registrá nuevos estudiantes en la institución</p>
            </div>
          </div>

          <div className="gestor-page-layout">
            <aside className="gestor-page-info">
              <div className="gpi-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="gpi-title">Alta de alumno</h3>
                <p className="gpi-desc">Completá el formulario para registrar un nuevo estudiante. Las credenciales generadas le permitirán acceder a la plataforma.</p>
              </div>
              <ul className="gpi-steps">
                <li className="gpi-step">
                  <span className="gpi-step-num">1</span>
                  <span className="gpi-step-text">Datos personales del estudiante</span>
                </li>
                <li className="gpi-step">
                  <span className="gpi-step-num">2</span>
                  <span className="gpi-step-text">Selección de institución y curso</span>
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
                  El alumno accede con su <strong>email y contraseña</strong>. Al elegir
                  el curso queda inscripto en todas las materias asignadas a ese curso.
                </p>
              </div>
            </aside>

            <FormCrearAlumno />
          </div>
        </main>
      </div>
    </>
  );
}

export default AlumnosGestor;
