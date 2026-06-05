import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./Paginas/Login";
import MisCursos from "./Paginas/Profesores/MisMaterias";
import HomeGestor from "./Paginas/Gestor/HomeGestor";
import MateriasGestor from "./Paginas/Gestor/ProfesoresGestor";
import AsignacionesGestor from "./Paginas/Gestor/AsignacionesGestor";
import AlumnosGestor from "./Paginas/Gestor/AlumnosGestor";
import Contenidos from "./Paginas/Profesores/Contenidos";
import CrearContenido from "./Paginas/Profesores/CrearContenido";
import MisMaterias from "./Paginas/Alumnos/MisMaterias";
import ContenidosAlumnos from "./Paginas/Alumnos/ContenidosAlumnos";
import VerContenido from "./Paginas/VerContenido";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/verContenido/:contenidoId" element={<VerContenido />} />
        <Route path="/profesor" element={<MisCursos />} />
        <Route path="/contenidos/:profeCursoMateriaId" element={<Contenidos />} />
        <Route path="/crear-contenido/:profeCursoMateriaId" element={<CrearContenido />} />
        <Route path="/alumnos" element={<MisMaterias />} />
        <Route path="/materia/:profeCursoMateriaId" element={<ContenidosAlumnos />} />
        <Route path="/gestor" element={<HomeGestor />} />
        <Route path="/gestor/materias" element={<MateriasGestor />} />
        <Route path="/gestor/asignaciones" element={<AsignacionesGestor />} />
        <Route path="/gestor/alumnos" element={<AlumnosGestor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
