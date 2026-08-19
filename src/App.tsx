import "./App.css";

import type { JSX } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import Login from "./Paginas/Login";
import MisCursos from "./Paginas/Profesores/MisMaterias";
import HomeGestor from "./Paginas/Gestor/HomeGestor";
import ProfesoresGestor from "./Paginas/Gestor/CrearProfesoresGestor";
import AsignacionesGestor from "./Paginas/Gestor/AsignarMateriaProfesor";
import AlumnosGestor from "./Paginas/Gestor/CrearAlumnosGestor";
import CursosGestor from "./Paginas/Gestor/CursosGestor";
import Contenidos from "./Paginas/Profesores/Contenidos";
import CrearContenido from "./Paginas/Profesores/CrearContenido";
import MisMaterias from "./Paginas/Alumnos/MisMaterias";
import ContenidosAlumnos from "./Paginas/Alumnos/ContenidosAlumnos";
import VerContenido from "./Paginas/VerContenido";
import ProtectedRoute from "./Componentes/ProtectedRoute";
import LandingPage from "./Paginas/LandingPage";
import Comunicados from "./Paginas/Comunicados";
import Configuracion from "./Paginas/Configuracion";
import NexiaIA from "./Paginas/NexiaIA";
import TrabajosPracticos from "./Paginas/Profesores/TrabajosPracticos";
import CrearTrabajoPractico from "./Paginas/Profesores/CrearTrabajoPractico";
import EditarTrabajoPractico from "./Paginas/Profesores/EditarTrabajoPractico";
import CorregirTrabajoPractico from "./Paginas/Profesores/CorregirTrabajoPractico";
import Notas from "./Paginas/Profesores/Notas";
import Asistencia from "./Paginas/Profesores/Asistencia";
import TomarAsistencia from "./Paginas/Profesores/TomarAsistencia";
import TrabajosPracticosAlumno from "./Paginas/Alumnos/TrabajosPracticos";
import TrabajoPracticoDetalle from "./Paginas/Alumnos/TrabajoPracticoDetalle";
import Boletin from "./Paginas/Alumnos/Boletin";
import ZonaEstudio from "./Paginas/Alumnos/ZonaEstudio";
import Mensajes from "./Paginas/Mensajes";
import Calendario from "./Paginas/Calendario";
import NoEncontrado from "./Paginas/NoEncontrado";
import ScrollToTop from "./Componentes/ScrollToTop";
import Layout from "./Componentes/Layout";
import type { Rol } from "./utils/session";

/** Envuelve una página con autenticación y control de rol. */
const guard = (element: JSX.Element, roles?: Rol[]) => (
  <ProtectedRoute roles={roles}>{element}</ProtectedRoute>
);

function App() {

  useEffect(() => {
    const tituloOriginal = document.title;

    const handleVisibility = () => {
      if (document.hidden) {
        document.title = '¡A estudiar! 📚';
      } else {
        document.title = tituloOriginal;
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ── Públicas ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* ── Autenticadas — Sidebar único vía Layout ── */}
        <Route element={<Layout />}>
          {/* Alumno */}
          <Route path="/alumnos" element={guard(<MisMaterias />, ["alumno"])} />
          <Route path="/materia/:profeCursoMateriaId" element={guard(<ContenidosAlumnos />, ["alumno"])} />
          <Route path="/materia/:profeCursoMateriaId/trabajos-practicos" element={guard(<TrabajosPracticosAlumno />, ["alumno"])} />
          <Route path="/trabajo-practico/:id" element={guard(<TrabajoPracticoDetalle />, ["alumno"])} />
          <Route path="/boletin" element={guard(<Boletin />, ["alumno"])} />
          <Route path="/zona-estudio" element={guard(<ZonaEstudio />, ["alumno"])} />
          {/* Los apuntes ahora viven dentro de la zona de estudio. La ruta
              vieja se conserva y redirige para no romper enlaces guardados. */}
          <Route path="/apuntes" element={<Navigate to="/zona-estudio?panel=apuntes" replace />} />

          {/* Profesor */}
          <Route path="/profesor" element={guard(<MisCursos />, ["profesor"])} />
          <Route path="/contenidos/:profeCursoMateriaId" element={guard(<Contenidos />, ["profesor"])} />
          <Route path="/crear-contenido/:profeCursoMateriaId" element={guard(<CrearContenido />, ["profesor"])} />
          <Route path="/editar-contenido/:contenidoId" element={guard(<CrearContenido />, ["profesor"])} />
          <Route path="/trabajos-practicos/:profeCursoMateriaId" element={guard(<TrabajosPracticos />, ["profesor"])} />
          <Route path="/crear-trabajo-practico/:profeCursoMateriaId" element={guard(<CrearTrabajoPractico />, ["profesor"])} />
          <Route path="/trabajo-practico/:id/editar" element={guard(<EditarTrabajoPractico />, ["profesor"])} />
          <Route path="/trabajo-practico/:id/entregas" element={guard(<CorregirTrabajoPractico />, ["profesor"])} />
          <Route path="/notas/:profeCursoMateriaId" element={guard(<Notas />, ["profesor"])} />
          <Route path="/asistencia/:profeCursoMateriaId" element={guard(<Asistencia />, ["profesor"])} />
          <Route path="/clase/:claseId" element={guard(<TomarAsistencia />, ["profesor"])} />

          {/* Alumno + Profesor */}
          <Route path="/verContenido/:contenidoId" element={guard(<VerContenido />, ["alumno", "profesor"])} />
          <Route path="/nexia-ia" element={guard(<NexiaIA />, ["alumno", "profesor"])} />

          {/* Todos los roles autenticados */}
          <Route path="/comunicados" element={guard(<Comunicados />)} />
          <Route path="/mensajes" element={guard(<Mensajes />)} />
          <Route path="/calendario" element={guard(<Calendario />)} />
          <Route path="/configuracion" element={guard(<Configuracion />)} />

          {/* Gestor */}
          <Route path="/gestor" element={guard(<HomeGestor />, ["gestor"])} />
          <Route path="/gestor/profesores" element={guard(<ProfesoresGestor />, ["gestor"])} />
          <Route path="/gestor/cursos" element={guard(<CursosGestor />, ["gestor"])} />
          <Route path="/gestor/asignaciones" element={guard(<AsignacionesGestor />, ["gestor"])} />
          <Route path="/gestor/alumnos" element={guard(<AlumnosGestor />, ["gestor"])} />
        </Route>

        {/* ── 404 — cualquier otra ruta ── */}
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
