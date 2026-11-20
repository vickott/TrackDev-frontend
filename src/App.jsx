import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import RutaProtegida from './components/RutaProtegida'
import Clientes from './pages/Clientes'

function App() {
  return (
    <BrowserRouter>
      <h1>TrackDev</h1>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
        <Route path="/clientes" element={<RutaProtegida><Clientes /></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App