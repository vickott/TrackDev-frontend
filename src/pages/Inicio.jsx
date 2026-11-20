import { useNavigate, Link } from 'react-router-dom'

function Inicio() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario'))

  function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <div>
      <h2>Inicio</h2>
      <p>Hola {usuario?.nombre} {usuario?.apellido} ({usuario?.rol})</p>
      <button onClick={cerrarSesion}>Cerrar sesión</button>
      <p><Link to="/clientes">Ir a Clientes</Link></p>
      <p><Link to="/proyectos">Ir a Proyectos</Link></p>
      <p><Link to="/modulos">Ir a Módulos</Link></p>  
      <p><Link to="/tareas">Ir a Tareas</Link></p>
      <p><Link to="/perfiles">Ir a Perfiles</Link></p>      
      
      </div>
  )
}

export default Inicio