import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Clientes from './pages/Clientes'
import Proyectos from './pages/Proyectos'
import Modulos from './pages/Modulos'
import Tareas from './pages/Tareas'
import Perfiles from './pages/Perfiles'
import Usuarios from './pages/Usuarios'
import MisHoras from './pages/MisHoras'
import RutaProtegida from './components/RutaProtegida'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
        <Route path="/mis-horas" element={<RutaProtegida><MisHoras /></RutaProtegida>} />
        <Route path="/clientes" element={<RutaProtegida soloAdmin><Clientes /></RutaProtegida>} />
        <Route path="/proyectos" element={<RutaProtegida soloAdmin><Proyectos /></RutaProtegida>} />
        <Route path="/modulos" element={<RutaProtegida soloAdmin><Modulos /></RutaProtegida>} />
        <Route path="/tareas" element={<RutaProtegida soloAdmin><Tareas /></RutaProtegida>} />
        <Route path="/perfiles" element={<RutaProtegida soloAdmin><Perfiles /></RutaProtegida>} />
        <Route path="/usuarios" element={<RutaProtegida soloAdmin><Usuarios /></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App