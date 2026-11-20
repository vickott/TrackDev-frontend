import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import RutaProtegida from './components/RutaProtegida'
import Clientes from './pages/Clientes'
import Proyectos from './pages/Proyectos'
import Modulos from './pages/Modulos'
import Tareas from './pages/Tareas'
import Perfiles from './pages/Perfiles'

function App() {
  return (
    <BrowserRouter>
      <h1>TrackDev</h1>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
        <Route path="/clientes" element={<RutaProtegida><Clientes /></RutaProtegida>} />
        <Route path="/proyectos" element={<RutaProtegida><Proyectos /></RutaProtegida>} />
        <Route path="/modulos" element={<RutaProtegida><Modulos /></RutaProtegida>} />
        <Route path="/tareas" element={<RutaProtegida><Tareas /></RutaProtegida>} />
        <Route path="/perfiles" element={<RutaProtegida><Perfiles /></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App