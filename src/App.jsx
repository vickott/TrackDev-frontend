import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Inicio from './pages/Inicio'

function App() {
  return (
    <BrowserRouter>
      <h1>TrackDev</h1>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Inicio />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App