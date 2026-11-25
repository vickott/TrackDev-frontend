import { Navigate } from 'react-router-dom'
import Menu from './Menu'
import { tokenVencido, limpiarSesion } from '../api/sesion'

function RutaProtegida({ children, soloAdmin = false }) {
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario'))

    if (!token || tokenVencido(token)) {
    limpiarSesion()
    return <Navigate to="/login" replace />
  }

  if (soloAdmin && usuario?.rol !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

   return (
    <>
      <Menu />
      <div className="container pb-5">
        {children}
      </div>
    </>
  )
}

export default RutaProtegida