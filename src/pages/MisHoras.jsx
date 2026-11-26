import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listarTareasDisponibles } from '../api/tareas'
import { listarMisRegistros, crearRegistro, actualizarRegistro, eliminarRegistro } from '../api/registros'

// Fecha de hoy en formato AAAA-MM-DD, en hora local
const hoy = new Date().toLocaleDateString('sv-SE')

const formVacio = { tareaId: '', fecha: hoy, horasTrabajadas: '', descripcion: '' }

function MisHoras() {
  const [tareas, setTareas] = useState([])
  const [registros, setRegistros] = useState([])
  const [parametros] = useSearchParams()
  const [form, setForm] = useState({ ...formVacio, tareaId: parametros.get('tarea') || '' })
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

  // Totales para el resumen
  const totalHoras = registros.reduce((suma, r) => suma + Number(r.horasTrabajadas), 0)
  const totalCosto = registros.reduce((suma, r) => suma + Number(r.costoReal), 0)

  return (
    <div>
      <h2 className="mb-4">Mis horas</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">{editandoId ? 'Editar registro' : 'Cargar horas'}</h5>
          <form onSubmit={manejarSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="tareaId" className="form-label">Tarea *</label>
                <select id="tareaId" name="tareaId" className="form-select" value={form.tareaId} onChange={manejarCambio} required disabled={editandoId !== null}>
                  <option value="">-- Elegí una tarea --</option>
                  {tareas.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre} (módulo {t.modulo?.nombre})</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="fecha" className="form-label">Fecha *</label>
                <input id="fecha" type="date" name="fecha" className="form-control" value={form.fecha} onChange={manejarCambio} max={hoy} required />
              </div>
              <div className="col-md-3">
                <label htmlFor="horasTrabajadas" className="form-label">Horas *</label>
                <input id="horasTrabajadas" type="number" step="0.01" min="0.01" max="24" name="horasTrabajadas" className="form-control" value={form.horasTrabajadas} onChange={manejarCambio} required />
              </div>
              <div className="col-12">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <input id="descripcion" name="descripcion" className="form-control" value={form.descripcion} onChange={manejarCambio} maxLength={300} placeholder="¿Qué hiciste? (opcional)" />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary">{editandoId ? 'Guardar cambios' : 'Cargar'}</button>
              {editandoId && <button type="button" className="btn btn-secondary ms-2" onClick={limpiarFormulario}>Cancelar edición</button>}
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <div className="text-muted small text-uppercase">Total de horas cargadas</div>
              <div className="fs-3 fw-bold">{totalHoras} h</div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm text-center">
            <div className="card-body">
              <div className="text-muted small text-uppercase">Total de costo</div>
              <div className="fs-3 fw-bold">${totalCosto.toLocaleString('es-AR')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tarea</th>
                <th>Horas</th>
                <th>Costo/hora</th>
                <th>Costo real</th>
                <th>Descripción</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 && (
                <tr><td colSpan="7" className="text-center text-muted">Todavía no cargaste horas</td></tr>
              )}
              {registros.map((r) => (
                <tr key={r.id}>
                  <td>{r.fecha}</td>
                  <td>{r.tarea?.nombre}</td>
                  <td>{r.horasTrabajadas}</td>
                  <td>${r.costoHoraAplicado}</td>
                  <td>${r.costoReal}</td>
                  <td>{r.descripcion}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => editar(r)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => eliminar(r)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MisHoras