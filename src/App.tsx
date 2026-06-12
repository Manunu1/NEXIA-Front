import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./Paginas/Login";
import MisCursos from "./Paginas/Profesores/MisMaterias";
import HomeGestor from "./Paginas/Gestor/HomeGestor";
import MateriasGestor from "./Paginas/Gestor/CrearProfesoresGestor";
import AsignacionesGestor from "./Paginas/Gestor/AsignarMateriaProfesor";
import AlumnosGestor from "./Paginas/Gestor/CrearAlumnosGestor";
import Contenidos from "./Paginas/Profesores/Contenidos";
import CrearContenido from "./Paginas/Profesores/CrearContenido";
import MisMaterias from "./Paginas/Alumnos/MisMaterias";
import ContenidosAlumnos from "./Paginas/Alumnos/ContenidosAlumnos";
import VerContenido from "./Paginas/VerContenido";
import ProtectedRoute from "./Componentes/ProtectedRoute";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
         <Route
          path="/verContenido/:contenidoId"
          element={
            <ProtectedRoute>
              <VerContenido />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profesor"
          element={
            <ProtectedRoute>
              <MisCursos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contenidos/:profeCursoMateriaId"
          element={
            <ProtectedRoute>
              <Contenidos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crear-contenido/:profeCursoMateriaId"
          element={
            <ProtectedRoute>
              <CrearContenido />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumnos"
          element={
            <ProtectedRoute>
              <MisMaterias />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materia/:profeCursoMateriaId"
          element={
            <ProtectedRoute>
              <ContenidosAlumnos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestor"
          element={
            <ProtectedRoute>
              <HomeGestor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestor/materias"
          element={
            <ProtectedRoute>
              <MateriasGestor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestor/asignaciones"
          element={
            <ProtectedRoute>
              <AsignacionesGestor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestor/alumnos"
          element={
            <ProtectedRoute>
              <AlumnosGestor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
