import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./Paginas/Login";
import MisCursos from "./Paginas/Profesores/MisMaterias";
import MateriaDetalle from "./Paginas/Alumnos/MateriaDetalle";
import HomeGestor from "./Paginas/Gestor/HomeGestor";
import MateriasGestor from "./Paginas/Gestor/ProfesoresGestor";
import AsignacionesGestor from "./Paginas/Gestor/AsignacionesGestor";
import AlumnosGestor from "./Paginas/Gestor/AlumnosGestor";
import Contenidos from "./Componentes/profesor/Contenido";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profesor" element={<MisCursos />} />
        <Route path="/contenido" element={<Contenidos />} />
        <Route path="/alumnos" element={<MateriaDetalle />} />
        <Route path="/gestor" element={<HomeGestor />} />
        <Route path="/gestor/materias" element={<MateriasGestor />} />
        <Route path="/gestor/asignaciones" element={<AsignacionesGestor />} />
        <Route path="/gestor/alumnos" element={<AlumnosGestor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
