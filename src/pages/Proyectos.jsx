import { useEffect, useState } from 'react'
import { listarProyectos, crearProyecto, actualizarProyecto, cancelarProyecto } from '../api/proyectos'
import { listarClientes } from '../api/clientes'
import { useNavigate } from 'react-router-dom'

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

const COLOR_ESTADO = {
  PLANIFICADO: 'bg-secondary',
  EN_CURSO: 'bg-primary',
  FINALIZADO: 'bg-success',
  CANCELADO: 'bg-danger',
}

const FILTROS = [
  { valor: 'ACTIVOS', texto: 'Activos' },
  { valor: 'PLANIFICADO', texto: 'Planificados' },
  { valor: 'EN_CURSO', texto: 'En curso' },
  { valor: 'FINALIZADO', texto: 'Finalizados' },
  { valor: 'CANCELADO', texto: 'Cancelados' },
  { valor: 'TODOS', texto: 'Todos' },
]

// ¿El proyecto entra en el filtro elegido?
function cumpleFiltro(proyecto, filtro) {
  if (filtro === 'TODOS') return true
  if (filtro === 'ACTIVOS') return proyecto.estado === 'PLANIFICADO' || proyecto.estado === 'EN_CURSO'
  return proyecto.estado === filtro
}

function Proyectos() {
  const [proyectos, setProyectos] = useState([])
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('ACTIVOS')
  const navigate = useNavigate()

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
  const proyectosFiltrados = proyectos.filter((p) => cumpleFiltro(p, filtro))

      return (
    <div>
      <h2 className="mb-4">Proyectos</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">{editandoId ? 'Editar proyecto' : 'Nuevo proyecto'}</h5>
          <form onSubmit={manejarSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="nombre" className="form-label">Nombre *</label>
                <input id="nombre" name="nombre" className="form-control" value={form.nombre} onChange={manejarCambio} required />
              </div>
              <div className="col-md-6">
                <label htmlFor="clienteId" className="form-label">Cliente *</label>
                <select id="clienteId" name="clienteId" className="form-select" value={form.clienteId} onChange={manejarCambio} required>
                  <option value="">-- Elegí un cliente --</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.razonSocial}</option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label htmlFor="descripcion" className="form-label">Descripción</label>
                <input id="descripcion" name="descripcion" className="form-control" value={form.descripcion} onChange={manejarCambio} />
              </div>
              <div className="col-md-3">
                <label htmlFor="fechaInicio" className="form-label">Fecha de inicio *</label>
                <input id="fechaInicio" type="date" name="fechaInicio" className="form-control" value={form.fechaInicio} onChange={manejarCambio} required />
              </div>
              <div className="col-md-3">
                <label htmlFor="fechaFinEstimada" className="form-label">Fin estimada</label>
                <input id="fechaFinEstimada" type="date" name="fechaFinEstimada" className="form-control" value={form.fechaFinEstimada} onChange={manejarCambio} />
              </div>
              <div className="col-md-3">
                <label htmlFor="estado" className="form-label">Estado</label>
                <select id="estado" name="estado" className="form-select" value={form.estado} onChange={manejarCambio}>
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label htmlFor="presupuestoVenta" className="form-label">Presupuesto de venta</label>
                <input id="presupuestoVenta" type="number" step="0.01" min="0.01" name="presupuestoVenta" className="form-control" value={form.presupuestoVenta} onChange={manejarCambio} />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary">{editandoId ? 'Guardar cambios' : 'Crear'}</button>
              {editandoId && <button type="button" className="btn btn-secondary ms-2" onClick={limpiarFormulario}>Cancelar edición</button>}
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 mb-3">
            {FILTROS.map((f) => (
              <button
                key={f.valor}
                type="button"
                className={`btn btn-sm ${filtro === f.valor ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFiltro(f.valor)}
              >
                {f.texto} <span className="badge bg-light text-dark ms-1">{proyectos.filter((p) => cumpleFiltro(p, f.valor)).length}</span>
              </button>
            ))}
          </div>

          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cliente</th>
                <th>Inicio</th>
                <th>Fin estimada</th>
                <th>Estado</th>
                <th>Presupuesto</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectosFiltrados.length === 0 && (
                <tr><td colSpan="7" className="text-center text-muted">No hay proyectos en este filtro</td></tr>
              )}
              {proyectosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.cliente?.razonSocial}</td>
                  <td>{p.fechaInicio}</td>
                  <td>{p.fechaFinEstimada}</td>
                  <td><span className={`badge ${COLOR_ESTADO[p.estado]}`}>{p.estado}</span></td>
                  <td>{p.presupuestoVenta != null && `$${p.presupuestoVenta}`}</td>
                                    <td className="text-end">
                    <button className="btn btn-sm btn-primary" onClick={() => navigate(`/proyectos/${p.id}`)}>
                      <i className="bi bi-eye me-1"></i>Ver
                    </button>
                    <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => editar(p)}>Editar</button>
                    {p.estado !== 'CANCELADO' && p.estado !== 'FINALIZADO' && (
                      <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => cancelar(p)}>Cancelar proyecto</button>
                    )}
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

export default Proyectos