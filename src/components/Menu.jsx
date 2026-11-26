import Logo from './Logo'
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

  // Accesos según el rol (por ahora siguen Módulos y Tareas; se van cuando armemos la página del proyecto)
  const accesos = esAdmin
    ? [
        { to: '/', icono: 'bi-house', texto: 'Inicio' },
        { to: '/proyectos', icono: 'bi-folder2-open', texto: 'Proyectos' },
        { to: '/clientes', icono: 'bi-building', texto: 'Clientes' },
        { to: '/equipo', icono: 'bi-people', texto: 'Equipo' },
      ]
    : [
        { to: '/', icono: 'bi-house', texto: 'Inicio' },
        { to: '/mis-horas', icono: 'bi-clock-history', texto: 'Mis horas' },
      ]

  return (
    <>
      {/* Franja de arriba: solo logo, usuario y cerrar sesión */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
                    <Link className="navbar-brand" to="/">
            <Logo fondo="oscuro" size={30} />
          </Link>
          <div className="d-flex align-items-center">
            <span className="navbar-text me-3">
              <i className="bi bi-person-circle me-1"></i>
              {usuario?.nombre} {usuario?.apellido} · {usuario?.rol}
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={cerrarSesion}>
              <i className="bi bi-box-arrow-right me-1"></i>Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Franja de abajo: accesos centrados con ícono */}
      <div className="subnav">
        <div className="container">
          <nav className="nav justify-content-center">
            {accesos.map((a) => (
              <NavLink key={a.to} to={a.to} end={a.to === '/'} className="nav-link">
                <i className={`bi ${a.icono}`}></i>
                {a.texto}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

export default Menu