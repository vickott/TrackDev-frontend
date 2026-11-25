import { useEffect, useState } from 'react'
import { obtenerEstimacion, crearEstimacion, actualizarEstimacion, eliminarEstimacion } from '../api/estimaciones'
import { listarPerfiles } from '../api/perfiles'

const formVacio = { perfilEstimadoId: '', horasEstimadas: '' }

function EstimacionTarea({ tarea, onCerrar }) {
  const [estimacion, setEstimacion] = useState(null)
  const [perfiles, setPerfiles] = useState([])
  const [form, setForm] = useState(formVacio)
  const [error, setError] = useState('')


  function cargarEstimacion() {
    obtenerEstimacion(tarea.id)
      .then((est) => {
        setEstimacion(est)
        setForm({ perfilEstimadoId: est.perfilEstimado.id, horasEstimadas: est.horasEstimadas })
      })
      .catch((err) => {
        // 404 = la tarea todavía no tiene estimación (no es un error)
        if (err.response?.status === 404) {
          setEstimacion(null)
          setForm(formVacio)
        } else {
          setError('No se pudo cargar la estimación')
        }
      })
  }

  // Cada vez que se elige otra tarea: recargar su estimación y los perfiles
  useEffect(() => {
    setError('')
    cargarEstimacion()
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
      <h3>Estimación de: {tarea.nombre}</h3>

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
    </div>
  )
}

export default EstimacionTarea