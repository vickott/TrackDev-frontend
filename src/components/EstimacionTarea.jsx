import { useEffect, useState } from 'react'
import { obtenerEstimacion, crearEstimacion, actualizarEstimacion, eliminarEstimacion } from '../api/estimaciones'
import { listarPerfiles } from '../api/perfiles'
import { listarRegistrosPorTarea } from '../api/registros'
import { obtenerDesvioTarea } from '../api/reportes'

const formVacio = { perfilEstimadoId: '', horasEstimadas: '' }

// Color de la barra según el % consumido (mismos umbrales que las alertas)
function colorBarra(porcentaje) {
  if (porcentaje >= 100) return 'bg-danger'
  if (porcentaje >= 80) return 'bg-warning'
  return 'bg-success'
}

function EstimacionTarea({ tarea, onCerrar }) {
  const [estimacion, setEstimacion] = useState(null)
  const [perfiles, setPerfiles] = useState([])
  const [form, setForm] = useState(formVacio)
  const [error, setError] = useState('')
  // NUEVO: horas cargadas y desvío de la tarea
  const [registros, setRegistros] = useState([])
  const [desvio, setDesvio] = useState(null)

  function cargarEstimacion() {
    obtenerEstimacion(tarea.id)
      .then((est) => {
        setEstimacion(est)
        setForm({ perfilEstimadoId: est.perfilEstimado.id, horasEstimadas: est.horasEstimadas })
        // NUEVO: si hay estimación, pedimos el desvío
        obtenerDesvioTarea(tarea.id)
          .then(setDesvio)
          .catch(() => setDesvio(null))
      })
      .catch((err) => {
        // 404 = la tarea todavía no tiene estimación (no es un error)
        if (err.response?.status === 404) {
          setEstimacion(null)
          setForm(formVacio)
          setDesvio(null)
        } else {
          setError('No se pudo cargar la estimación')
        }
      })
  }

  // NUEVO
  function cargarRegistros() {
    listarRegistrosPorTarea(tarea.id)
      .then(setRegistros)
      .catch(() => setError('No se pudieron cargar las horas de la tarea'))
  }

  useEffect(() => {
    setError('')
    cargarEstimacion()
    cargarRegistros()
    listarPerfiles()
      .then((lista) => setPerfiles(lista.filter((p) => p.activo)))
      .catch(() => setError('No se pudieron cargar los perfiles'))
  }, [tarea.id])

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    const datos = {
      perfilEstimadoId: Number(form.perfilEstimadoId),
      horasEstimadas: Number(form.horasEstimadas),
    }
    try {
      if (estimacion) {
        await actualizarEstimacion(tarea.id, datos)
      } else {
        await crearEstimacion(tarea.id, datos)
      }
      cargarEstimacion()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la estimación')
    }
  }

  async function eliminar() {
    if (!window.confirm('¿Eliminar la estimación de esta tarea?')) return
    setError('')
    try {
      await eliminarEstimacion(tarea.id)
      cargarEstimacion()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la estimación')
    }
  }

    return (
    <div className="card shadow-sm mt-4 border-dark">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Tarea: {tarea.nombre}</h5>
        <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar}></button>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-4">
          {/* Izquierda: estimación */}
          <div className="col-md-5">
            <h6 className="text-muted text-uppercase small">Estimación</h6>
            {estimacion ? (
              <p className="mb-3">
                <strong>{estimacion.horasEstimadas} h</strong> de perfil <strong>{estimacion.perfilEstimado.nombre}</strong>
                <br />
                Costo estimado: <strong>${estimacion.costoEstimado}</strong>
                <br />
                <span className="text-muted small">Cargada por {estimacion.creadoPor.nombre} {estimacion.creadoPor.apellido}</span>
              </p>
            ) : (
              <p className="text-muted">Esta tarea todavía no tiene estimación.</p>
            )}

            <form onSubmit={manejarSubmit}>
              <div className="mb-2">
                <label htmlFor="perfilEstimadoId" className="form-label">Perfil *</label>
                <select id="perfilEstimadoId" name="perfilEstimadoId" className="form-select" value={form.perfilEstimadoId} onChange={manejarCambio} required>
                  <option value="">-- Elegí un perfil --</option>
                  {perfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} (${p.costoHora}/h)</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="horasEstimadas" className="form-label">Horas estimadas *</label>
                <input id="horasEstimadas" type="number" step="0.01" min="0.01" name="horasEstimadas" className="form-control" value={form.horasEstimadas} onChange={manejarCambio} required />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">{estimacion ? 'Guardar cambios' : 'Cargar estimación'}</button>
              {estimacion && <button type="button" className="btn btn-outline-danger btn-sm ms-2" onClick={eliminar}>Eliminar estimación</button>}
            </form>
          </div>

          {/* Derecha: estimado vs. real */}
          <div className="col-md-7">
            <h6 className="text-muted text-uppercase small">Estimado vs. real</h6>
            {desvio ? (
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th></th>
                    <th>Estimado</th>
                    <th>Real</th>
                    <th>Desvío</th>
                    <th style={{ width: '30%' }}>Consumido</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Horas</td>
                    <td>{desvio.horasEstimadas}</td>
                    <td>{desvio.horasReales}</td>
                    <td>{desvio.desvioHoras}</td>
                    <td>
                      <div className="progress" style={{ height: '18px' }}>
                        <div className={`progress-bar ${colorBarra(desvio.porcentajeConsumidoHoras)}`} style={{ width: `${Math.min(desvio.porcentajeConsumidoHoras, 100)}%` }}>
                          {desvio.porcentajeConsumidoHoras}%
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Costo</td>
                    <td>${desvio.costoEstimado}</td>
                    <td>${desvio.costoReal}</td>
                    <td>${desvio.desvioCosto}</td>
                    <td>
                      <div className="progress" style={{ height: '18px' }}>
                        <div className={`progress-bar ${colorBarra(desvio.porcentajeConsumidoCosto)}`} style={{ width: `${Math.min(desvio.porcentajeConsumidoCosto, 100)}%` }}>
                          {desvio.porcentajeConsumidoCosto}%
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-muted">Sin estimación no hay contra qué comparar.</p>
            )}
          </div>
        </div>

        {/* Abajo: horas cargadas */}
        <h6 className="text-muted text-uppercase small mt-4">Horas cargadas</h6>
        <table className="table table-sm table-hover align-middle mb-0">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Usuario</th>
              <th>Horas</th>
              <th>Costo/hora</th>
              <th>Costo real</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {registros.length === 0 && (
              <tr><td colSpan="6" className="text-center text-muted">Todavía no se cargaron horas en esta tarea</td></tr>
            )}
            {registros.map((r) => (
              <tr key={r.id}>
                <td>{r.fecha}</td>
                <td>{r.usuario?.nombre} {r.usuario?.apellido}</td>
                <td>{r.horasTrabajadas}</td>
                <td>${r.costoHoraAplicado}</td>
                <td>${r.costoReal}</td>
                <td>{r.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default EstimacionTarea