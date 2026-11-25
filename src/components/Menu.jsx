import { Link, NavLink, useNavigate } from 'react-router-dom'
import { limpiarSesion } from '../api/sesion'

function Menu() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const esAdmin = usuario?.rol === 'ADMIN'

  function cerrarSesion() {
    limpiarSesion()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark mb-4">
      <div className="container">
                <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <span className="logo-marca">TD</span>TrackDev
        </Link>
        <div className="navbar-nav me-auto">
          {esAdmin ? (
            <>
              <NavLink className="nav-link" to="/clientes">Clientes</NavLink>
              <NavLink className="nav-link" to="/proyectos">Proyectos</NavLink>
              <NavLink className="nav-link" to="/modulos">Módulos</NavLink>
              <NavLink className="nav-link" to="/tareas">Tareas</NavLink>
              <NavLink className="nav-link" to="/perfiles">Perfiles</NavLink>
              <NavLink className="nav-link" to="/usuarios">Usuarios</NavLink>
            </>
          ) : (
            <NavLink className="nav-link" to="/mis-horas">Mis horas</NavLink>
          )}
        </div>
        <span className="navbar-text me-3">
          {usuario?.nombre} {usuario?.apellido} · {usuario?.rol}
        </span>
        <button className="btn btn-outline-light btn-sm" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}

export default Menu