import { useEffect, useState } from 'react'
import { obtenerEstimacion, crearEstimacion, actualizarEstimacion, eliminarEstimacion } from '../api/estimaciones'
import { listarPerfiles } from '../api/perfiles'
import { listarRegistrosPorTarea } from '../api/registros'
import { obtenerDesvioTarea } from '../api/reportes'

const formVacio = { perfilEstimadoId: '', horasEstimadas: '' }

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
    <div style={{ border: '1px solid gray', padding: '10px', marginTop: '15px' }}>
      <h3>Tarea: {tarea.nombre}</h3>

      <h4>Estimación</h4>
      {estimacion ? (
        <p>
          Perfil: {estimacion.perfilEstimado.nombre} — Horas: {estimacion.horasEstimadas} —
          Costo estimado: ${estimacion.costoEstimado} — Cargada por: {estimacion.creadoPor.nombre} {estimacion.creadoPor.apellido}
        </p>
      ) : (
        <p>Esta tarea todavía no tiene estimación.</p>
      )}

      <form onSubmit={manejarSubmit}>
        <div>
          <label>Perfil *</label>
          <select name="perfilEstimadoId" value={form.perfilEstimadoId} onChange={manejarCambio} required>
            <option value="">-- Elegí un perfil --</option>
            {perfiles.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} (${p.costoHora}/h)</option>
            ))}
          </select>
        </div>
        <div>
          <label>Horas estimadas *</label>
          <input type="number" step="0.01" min="0.01" name="horasEstimadas" value={form.horasEstimadas} onChange={manejarCambio} required />
        </div>
        <button type="submit">{estimacion ? 'Guardar cambios' : 'Cargar estimación'}</button>
        {estimacion && <button type="button" onClick={eliminar}>Eliminar estimación</button>}
        <button type="button" onClick={onCerrar}>Cerrar</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* NUEVO: desvío de la tarea */}
      {desvio && (
        <>
          <h4>Estimado vs. real</h4>
          <table border="1">
            <thead>
              <tr>
                <th></th>
                <th>Estimado</th>
                <th>Real</th>
                <th>Desvío</th>
                <th>% consumido</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Horas</td>
                <td>{desvio.horasEstimadas}</td>
                <td>{desvio.horasReales}</td>
                <td>{desvio.desvioHoras}</td>
                <td>{desvio.porcentajeConsumidoHoras}%</td>
              </tr>
              <tr>
                <td>Costo</td>
                <td>${desvio.costoEstimado}</td>
                <td>${desvio.costoReal}</td>
                <td>${desvio.desvioCosto}</td>
                <td>{desvio.porcentajeConsumidoCosto}%</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {/* NUEVO: horas cargadas en la tarea */}
      <h4>Horas cargadas</h4>
      <table border="1">
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
            <tr><td colSpan="6">Todavía no se cargaron horas en esta tarea</td></tr>
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
  )
}

export default EstimacionTarea