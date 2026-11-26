import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Proyectos from './pages/Proyectos'
import ProyectoDetalle from './pages/ProyectoDetalle'
import Clientes from './pages/Clientes'
import Equipo from './pages/Equipo'
import MisHoras from './pages/MisHoras'
import RutaProtegida from './components/RutaProtegida'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
        <Route path="/mis-horas" element={<RutaProtegida><MisHoras /></RutaProtegida>} />
        <Route path="/proyectos" element={<RutaProtegida soloAdmin><Proyectos /></RutaProtegida>} />
        <Route path="/proyectos/:id" element={<RutaProtegida soloAdmin><ProyectoDetalle /></RutaProtegida>} />
        <Route path="/clientes" element={<RutaProtegida soloAdmin><Clientes /></RutaProtegida>} />
        <Route path="/equipo" element={<RutaProtegida soloAdmin><Equipo /></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App