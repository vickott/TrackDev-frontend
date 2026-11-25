import { useEffect, useState } from 'react'
import { listarTareasDisponibles } from '../api/tareas'
import { listarMisRegistros, crearRegistro, actualizarRegistro, eliminarRegistro } from '../api/registros'

// Fecha de hoy en formato AAAA-MM-DD, en hora local
const hoy = new Date().toLocaleDateString('sv-SE')

const formVacio = { tareaId: '', fecha: hoy, horasTrabajadas: '', descripcion: '' }

function MisHoras() {
  const [tareas, setTareas] = useState([])
  const [registros, setRegistros] = useState([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')

  function cargarRegistros() {
    listarMisRegistros()
      .then(setRegistros)
      .catch(() => setError('No se pudieron cargar tus registros'))
  }

  useEffect(() => {
    cargarRegistros()
    listarTareasDisponibles()
      .then(setTareas)
      .catch(() => setError('No se pudieron cargar las tareas'))
  }, [])

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    const datos = {
      tareaId: Number(form.tareaId),
      fecha: form.fecha,
      horasTrabajadas: Number(form.horasTrabajadas),
      descripcion: form.descripcion.trim() || null,
    }
    try {
      if (editandoId) {
        await actualizarRegistro(editandoId, datos)
      } else {
        await crearRegistro(datos)
      }
      limpiarFormulario()
      cargarRegistros()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el registro')
    }
  }

  function editar(registro) {
    setEditandoId(registro.id)
    setForm({
      tareaId: registro.tarea.id,
      fecha: registro.fecha,
      horasTrabajadas: registro.horasTrabajadas,
      descripcion: registro.descripcion || '',
    })
  }

  function limpiarFormulario() {
    setForm(formVacio)
    setEditandoId(null)
  }

  async function eliminar(registro) {
    if (!window.confirm(`¿Eliminar el registro del ${registro.fecha}?`)) return
    setError('')
    try {
      await eliminarRegistro(registro.id)
      cargarRegistros()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el registro')
    }
  }

  return (
    <div>
      <h2>Mis horas</h2>

      <h3>{editandoId ? 'Editar registro' : 'Cargar horas'}</h3>
      <form onSubmit={manejarSubmit}>
        <div>
          <label>Tarea *</label>
          <select name="tareaId" value={form.tareaId} onChange={manejarCambio} required disabled={editandoId !== null}>
            <option value="">-- Elegí una tarea --</option>
            {tareas.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre} (módulo {t.modulo?.nombre})</option>
            ))}
          </select>
        </div>
        <div>
          <label>Fecha *</label>
          <input type="date" name="fecha" value={form.fecha} onChange={manejarCambio} max={hoy} required />
        </div>
        <div>
          <label>Horas trabajadas *</label>
          <input type="number" step="0.01" min="0.01" max="24" name="horasTrabajadas" value={form.horasTrabajadas} onChange={manejarCambio} required />
        </div>
        <div>
          <label>Descripción</label>
          <input name="descripcion" value={form.descripcion} onChange={manejarCambio} maxLength={300} />
        </div>
        <button type="submit">{editandoId ? 'Guardar cambios' : 'Cargar'}</button>
        {editandoId && <button type="button" onClick={limpiarFormulario}>Cancelar edición</button>}
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tarea</th>
            <th>Horas</th>
            <th>Costo/hora</th>
            <th>Costo real</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {registros.length === 0 && (
            <tr><td colSpan="7">Todavía no cargaste horas</td></tr>
          )}
          {registros.map((r) => (
            <tr key={r.id}>
              <td>{r.fecha}</td>
              <td>{r.tarea?.nombre}</td>
              <td>{r.horasTrabajadas}</td>
              <td>${r.costoHoraAplicado}</td>
              <td>${r.costoReal}</td>
              <td>{r.descripcion}</td>
              <td>
                <button onClick={() => editar(r)}>Editar</button>
                <button onClick={() => eliminar(r)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MisHoras