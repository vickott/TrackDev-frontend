import { useEffect, useState } from 'react'
import { listarProyectos } from '../api/proyectos'
import { listarModulos } from '../api/modulos'
import { listarTareas, crearTarea, actualizarTarea, eliminarTarea } from '../api/tareas'
import EstimacionTarea from '../components/EstimacionTarea'

const formVacio = { nombre: '', descripcion: '', estado: 'PENDIENTE' }
const ESTADOS = ['PENDIENTE', 'EN_CURSO', 'FINALIZADA']

const COLOR_ESTADO = {
  PENDIENTE: 'bg-secondary',
  EN_CURSO: 'bg-primary',
  FINALIZADA: 'bg-success',
}

function Tareas() {
  const [proyectos, setProyectos] = useState([])
  const [proyectoId, setProyectoId] = useState('')
  const [modulos, setModulos] = useState([])
  const [moduloId, setModuloId] = useState('')
  const [tareas, setTareas] = useState([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')
  const [tareaEstimando, setTareaEstimando] = useState(null)

  // Al abrir la pantalla: cargar proyectos
  useEffect(() => {
    listarProyectos()
      .then(setProyectos)
      .catch(() => setError('No se pudieron cargar los proyectos'))
  }, [])

  // Cuando cambia el proyecto: cargar sus módulos y resetear el módulo elegido
  useEffect(() => {
    setTareaEstimando(null)
    setModuloId('')
    if (proyectoId) {
      listarModulos(proyectoId)
        .then(setModulos)
        .catch(() => setError('No se pudieron cargar los módulos'))
    } else {
      setModulos([])
    }
  }, [proyectoId])

  // Cuando cambia el módulo: cargar sus tareas
  useEffect(() => {
    setTareaEstimando(null)
    limpiarFormulario()
    if (moduloId) {
      cargarTareas()
    } else {
      setTareas([])
    }
  }, [moduloId])

  function cargarTareas() {
    listarTareas(moduloId)
      .then(setTareas)
      .catch(() => setError('No se pudieron cargar las tareas'))
  }

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    const datos = {
      moduloId: Number(moduloId),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      estado: form.estado,
    }
    try {
      if (editandoId) {
        await actualizarTarea(editandoId, datos)
      } else {
        await crearTarea(datos)
      }
      limpiarFormulario()
      cargarTareas()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la tarea')
    }
  }

  function editar(tarea) {
    setEditandoId(tarea.id)
    setForm({ nombre: tarea.nombre, descripcion: tarea.descripcion || '', estado: tarea.estado })
  }

  function limpiarFormulario() {
    setForm(formVacio)
    setEditandoId(null)
  }

  async function eliminar(tarea) {
    if (!window.confirm(`¿Eliminar la tarea ${tarea.nombre}?`)) return
    setError('')
    try {
      await eliminarTarea(tarea.id)
      cargarTareas()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la tarea')
    }
  }

   return (
    <div>
      <h2 className="mb-4">Tareas</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="proyectoId" className="form-label">Proyecto</label>
              <select id="proyectoId" className="form-select" value={proyectoId} onChange={(e) => setProyectoId(e.target.value)}>
                <option value="">-- Elegí un proyecto --</option>
                {proyectos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre} ({p.estado})</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="moduloId" className="form-label">Módulo</label>
              <select id="moduloId" className="form-select" value={moduloId} onChange={(e) => setModuloId(e.target.value)} disabled={!proyectoId}>
                <option value="">-- Elegí un módulo --</option>
                {modulos.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {moduloId && (
        <>
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">{editandoId ? 'Editar tarea' : 'Nueva tarea'}</h5>
              <form onSubmit={manejarSubmit}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label htmlFor="nombre" className="form-label">Nombre *</label>
                    <input id="nombre" name="nombre" className="form-control" value={form.nombre} onChange={manejarCambio} required />
                  </div>
                  <div className="col-md-5">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <input id="descripcion" name="descripcion" className="form-control" value={form.descripcion} onChange={manejarCambio} />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="estado" className="form-label">Estado</label>
                    <select id="estado" name="estado" className="form-select" value={form.estado} onChange={manejarCambio}>
                      {ESTADOS.map((estado) => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <button type="submit" className="btn btn-primary">{editandoId ? 'Guardar cambios' : 'Crear'}</button>
                  {editandoId && <button type="button" className="btn btn-secondary ms-2" onClick={limpiarFormulario}>Cancelar edición</button>}
                </div>
              </form>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tareas.length === 0 && (
                    <tr><td colSpan="4" className="text-center text-muted">Este módulo no tiene tareas</td></tr>
                  )}
                  {tareas.map((t) => (
                    <tr key={t.id}>
                      <td>{t.nombre}</td>
                      <td>{t.descripcion}</td>
                      <td><span className={`badge ${COLOR_ESTADO[t.estado]}`}>{t.estado}</span></td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => editar(t)}>Editar</button>
                        <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => eliminar(t)}>Eliminar</button>
                        <button className="btn btn-sm btn-outline-dark ms-2" onClick={() => setTareaEstimando(t)}>Detalle</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {tareaEstimando && (
            <EstimacionTarea tarea={tareaEstimando} onCerrar={() => setTareaEstimando(null)} />
          )}
        </>
      )}
    </div>
  )
}

export default Tareas