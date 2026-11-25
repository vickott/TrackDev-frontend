function Inicio() {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const esAdmin = usuario?.rol === 'ADMIN'

  return (
    <div>
      <h2>Hola, {usuario?.nombre}</h2>
      {esAdmin ? (
        <p>Desde el menú podés gestionar clientes, proyectos, tareas, perfiles y usuarios. Acá va a ir el dashboard.</p>
      ) : (
        <p>Desde "Mis horas" podés cargar las horas que trabajaste en cada tarea.</p>
      )}
    </div>
  )
}

export default Inicio