import { Link, useNavigate } from 'react-router-dom'

function Menu() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const esAdmin = usuario?.rol === 'ADMIN'

  function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <nav style={{ borderBottom: '1px solid gray', paddingBottom: '8px', marginBottom: '15px' }}>
      <Link to="/">Inicio</Link>
      {esAdmin ? (
        <>
          {' | '}<Link to="/clientes">Clientes</Link>
          {' | '}<Link to="/proyectos">Proyectos</Link>
          {' | '}<Link to="/modulos">Módulos</Link>
          {' | '}<Link to="/tareas">Tareas</Link>
          {' | '}<Link to="/perfiles">Perfiles</Link>
          {' | '}<Link to="/usuarios">Usuarios</Link>
        </>
      ) : (
        <>
          {' | '}<Link to="/mis-horas">Mis horas</Link>
        </>
      )}
      <span style={{ marginLeft: '20px' }}>
        {usuario?.nombre} {usuario?.apellido} ({usuario?.rol})
      </span>{' '}
      <button onClick={cerrarSesion}>Cerrar sesión</button>
    </nav>
  )
}

export default Menu