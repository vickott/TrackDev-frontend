import Dashboard from './Dashboard'

function Inicio() {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const esAdmin = usuario?.rol === 'ADMIN'

  return (
    <div>
      <h2>Hola, {usuario?.nombre}</h2>
      {esAdmin ? (
        <Dashboard />
      ) : (
        <p>Desde "Mis horas" podés cargar las horas que trabajaste en cada tarea.</p>
      )}
    </div>
  )
}

export default Inicio