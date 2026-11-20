import { useEffect, useState } from 'react'
import { listarProyectos, crearProyecto, actualizarProyecto, cancelarProyecto } from '../api/proyectos'
import { listarClientes } from '../api/clientes'

const formVacio = {
  nombre: '',
  descripcion: '',
  clienteId: '',
  fechaInicio: '',
  fechaFinEstimada: '',
  estado: 'PLANIFICADO',
  presupuestoVenta: '',
}

const ESTADOS = ['PLANIFICADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO']

function Proyectos() {
  const [proyectos, setProyectos] = useState([])
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')

  function cargarProyectos() {
    listarProyectos()
      .then(setProyectos)
      .catch(() => setError('No se pudieron cargar los proyectos'))
  }

  useEffect(() => {
    cargarProyectos()
    listarClientes()
      .then((lista) => setClientes(lista.filter((c) => c.activo)))
      .catch(() => setError('No se pudieron cargar los clientes'))
  }, [])

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    // Convertimos los datos al formato que espera el back
    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      clienteId: Number(form.clienteId),
      fechaInicio: form.fechaInicio,
      fechaFinEstimada: form.fechaFinEstimada || null,
      estado: form.estado,
      presupuestoVenta: form.presupuestoVenta === '' ? null : Number(form.presupuestoVenta),
    }
    try {
      if (editandoId) {
        await actualizarProyecto(editandoId, datos)
      } else {
        await crearProyecto(datos)
      }
      limpiarFormulario()
      cargarProyectos()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el proyecto')
    }
  }

  function editar(proyecto) {
    setEditandoId(proyecto.id)
    setForm({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion || '',
      clienteId: proyecto.cliente?.id || '',
      fechaInicio: proyecto.fechaInicio,
      fechaFinEstimada: proyecto.fechaFinEstimada || '',
      estado: proyecto.estado,
      presupuestoVenta: proyecto.presupuestoVenta ?? '',
    })
  }

  function limpiarFormulario() {
    setForm(formVacio)
    setEditandoId(null)
  }

  async function cancelar(proyecto) {
    if (!window.confirm(`¿Cancelar el proyecto ${proyecto.nombre}?`)) return
    setError('')
    try {
      await cancelarProyecto(proyecto.id)
      cargarProyectos()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cancelar el proyecto')
    }
  }

  return (
    <div>
      <h2>Proyectos</h2>

      <h3>{editandoId ? 'Editar proyecto' : 'Nuevo proyecto'}</h3>
      <form onSubmit={manejarSubmit}>
        <div>
          <label>Nombre *</label>
          <input name="nombre" value={form.nombre} onChange={manejarCambio} required />
        </div>
        <div>
          <label>Descripción</label>
          <input name="descripcion" value={form.descripcion} onChange={manejarCambio} />
        </div>
        <div>
          <label>Cliente *</label>
          <select name="clienteId" value={form.clienteId} onChange={manejarCambio} required>
            <option value="">-- Elegí un cliente --</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.razonSocial}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Fecha de inicio *</label>
          <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={manejarCambio} required />
        </div>
        <div>
          <label>Fecha de fin estimada</label>
          <input type="date" name="fechaFinEstimada" value={form.fechaFinEstimada} onChange={manejarCambio} />
        </div>
        <div>
          <label>Estado</label>
          <select name="estado" value={form.estado} onChange={manejarCambio}>
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Presupuesto de venta</label>
          <input type="number" step="0.01" min="0.01" name="presupuestoVenta" value={form.presupuestoVenta} onChange={manejarCambio} />
        </div>
        <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear'}</button>
        {editandoId && <button type="button" onClick={limpiarFormulario}>Cancelar edición</button>}
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cliente</th>
            <th>Inicio</th>
            <th>Fin estimada</th>
            <th>Estado</th>
            <th>Presupuesto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.length === 0 && (
            <tr><td colSpan="7">No hay proyectos cargados</td></tr>
          )}
          {proyectos.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.cliente?.razonSocial}</td>
              <td>{p.fechaInicio}</td>
              <td>{p.fechaFinEstimada}</td>
              <td>{p.estado}</td>
              <td>{p.presupuestoVenta}</td>
              <td>
                <button onClick={() => editar(p)}>Editar</button>
                {p.estado !== 'CANCELADO' && p.estado !== 'FINALIZADO' && (
                  <button onClick={() => cancelar(p)}>Cancelar proyecto</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Proyectos