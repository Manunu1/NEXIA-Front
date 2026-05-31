import "./App.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./Paginas/Login";
import MisCursos from "./Paginas/Profesores/MisMaterias";
import MateriaDetalle from "./Paginas/Alumnos/MateriaDetalle";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profesor" element={<MisCursos />} />
        <Route path="/alumnos" element={<MateriaDetalle />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
