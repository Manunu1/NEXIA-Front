import { useState } from 'react'
import './App.css'
import MisCursos from './Paginas/Profesores/MisMaterias'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MateriaDetalle from './Paginas/Alumnos/MateriaDetalle'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/profesor" element={<MisCursos />} />
          <Route path="/alumnos" element={<MateriaDetalle />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
