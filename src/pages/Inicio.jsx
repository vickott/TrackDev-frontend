import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Dashboard from './Dashboard'
import { listarMisRegistros } from '../api/registros'
import { listarTareasDisponibles } from '../api/tareas'

const COLOR_ESTADO_TAREA = {
  PENDIENTE: 'bg-secondary',
  EN_CURSO: 'bg-primary',
  FINALIZADA: 'bg-success',
}

// Tablero del operador
function InicioOperador() {
  const [registros, setRegistros] = useState([])
  const [tareas, setTareas] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([listarMisRegistros(), listarTareasDisponibles()])
      .then(([misRegistros, tareasDisponibles]) => {
        setRegistros(misRegistros)
        setTareas(tareasDisponibles)
      })
      .catch(() => setError('No se pudieron cargar tus datos'))
  }, [])

  // "2026-11" = año y mes actual
  const mesActual = new Date().toLocaleDateString('sv-SE').slice(0, 7)
  const horasDelMes = registros
    .filter((r) => r.fecha.startsWith(mesActual))
    .reduce((suma, r) => suma + Number(r.horasTrabajadas), 0)
  const horasTotales = registros.reduce((suma, r) => suma + Number(r.horasTrabajadas), 0)

  // Los 5 registros más nuevos
  const ultimos = [...registros].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5)

  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Link to="/mis-horas" className="card acceso text-center h-100">
            <div className="card-body py-4">
              <i className="bi bi-plus-circle icono"></i>
              <div className="fw-semibold mt-2">Cargar horas</div>
              <div className="text-muted small">Registrá lo que trabajaste</div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <div className="card text-center h-100">
            <div className="card-body py-4">
              <div className="text-muted small text-uppercase">Horas de este mes</div>
              <div className="fs-2 fw-bold">{horasDelMes} h</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center h-100">
            <div className="card-body py-4">
              <div className="text-muted small text-uppercase">Horas totales</div>
              <div className="fs-2 fw-bold">{horasTotales} h</div>
            </div>
          </div>
        </div>
      </div>

      <h5 className="mb-3"><i className="bi bi-list-check me-2"></i>Tareas en las que podés cargar horas</h5>
      <div className="card mb-4">
        <div className="card-body">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Módulo</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tareas.length === 0 && (
                <tr><td colSpan="4" className="text-center text-muted">No hay tareas disponibles por ahora</td></tr>
              )}
              {tareas.map((t) => (
                <tr key={t.id}>
                  <td className="fw-semibold">{t.nombre}</td>
                  <td>{t.modulo?.nombre}</td>
                  <td><span className={`badge ${COLOR_ESTADO_TAREA[t.estado]}`}>{t.estado}</span></td>
                  <td className="text-end">
                    <Link to={`/mis-horas?tarea=${t.id}`} className="btn btn-sm btn-primary">
                      <i className="bi bi-clock me-1"></i>Cargar horas
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i>Tus últimos registros</h5>
        <Link to="/mis-horas" className="small">Ver todos <i className="bi bi-arrow-right"></i></Link>
      </div>
      <div className="card">
        <div className="card-body">
          <table className="table table-sm align-middle mb-0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tarea</th>
                <th>Horas</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {ultimos.length === 0 && (
                <tr><td colSpan="4" className="text-center text-muted">Todavía no cargaste horas</td></tr>
              )}
              {ultimos.map((r) => (
                <tr key={r.id}>
                  <td>{r.fecha}</td>
                  <td>{r.tarea?.nombre}</td>
                  <td>{r.horasTrabajadas} h</td>
                  <td className="text-muted">{r.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function Inicio() {
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const esAdmin = usuario?.rol === 'ADMIN'

  return (
    <div>
      <h2 className="mb-4">Hola, {usuario?.nombre}</h2>
      {esAdmin ? <Dashboard /> : <InicioOperador />}
    </div>
  )
}

export default Inicio