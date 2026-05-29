import { useState } from 'react'
import './App.css'
import MisCursos from './Paginas/Profesores/MisMaterias'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/profesor" element={<MisCursos />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
