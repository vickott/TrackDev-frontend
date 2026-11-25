import { useEffect, useState } from 'react'
import { listarModulos, crearModulo, actualizarModulo, eliminarModulo } from '../api/modulos'
import { listarTareas, crearTarea, actualizarTarea, eliminarTarea } from '../api/tareas'
import EstimacionTarea from './EstimacionTarea'

const ESTADOS_TAREA = ['PENDIENTE', 'EN_CURSO', 'FINALIZADA']
const COLOR_ESTADO_TAREA = {
  PENDIENTE: 'bg-secondary',
  EN_CURSO: 'bg-primary',
  FINALIZADA: 'bg-success',
}
const formModuloVacio = { nombre: '', descripcion: '' }
const formTareaVacio = { nombre: '', descripcion: '', estado: 'PENDIENTE' }

function ModulosYTareas({ proyectoId }) {
  const [modulos, setModulos] = useState([])
  const [tareasPorModulo, setTareasPorModulo] = useState({}) // { idDelModulo: [tareas] }
  const [error, setError] = useState('')

  // Formulario de módulo
  const [formModulo, setFormModulo] = useState(formModuloVacio)
  const [editandoModuloId, setEditandoModuloId] = useState(null)

  // Formulario de tarea: se abre dentro del módulo elegido
  const [moduloDeLaTarea, setModuloDeLaTarea] = useState(null)
  const [formTarea, setFormTarea] = useState(formTareaVacio)
  const [editandoTareaId, setEditandoTareaId] = useState(null)

  // Tarea con el panel de detalle abierto
  const [tareaDetalle, setTareaDetalle] = useState(null)

  // Trae los módulos del proyecto y, por cada uno, sus tareas
  async function cargarTodo() {
    try {
      const lista = await listarModulos(proyectoId)
      const tareas = {}
      for (const m of lista) {
        tareas[m.id] = await listarTareas(m.id)
      }
      setModulos(lista)
      setTareasPorModulo(tareas)
    } catch {
      setError('No se pudieron cargar los módulos y tareas')
    }
  }

  useEffect(() => {
    cargarTodo()
  }, [proyectoId])

  // ---------- Módulos ----------
  async function guardarModulo(e) {
    e.preventDefault()
    setError('')
    const datos = {
      proyectoId: Number(proyectoId),
      nombre: formModulo.nombre.trim(),
      descripcion: formModulo.descripcion.trim() || null,
    }
    try {
      if (editandoModuloId) {
        await actualizarModulo(editandoModuloId, datos)
      } else {
        await crearModulo(datos)
      }
      setFormModulo(formModuloVacio)
      setEditandoModuloId(null)
      cargarTodo()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el módulo')
    }
  }

  function editarModulo(modulo) {
    setEditandoModuloId(modulo.id)
    setFormModulo({ nombre: modulo.nombre, descripcion: modulo.descripcion || '' })
  }

  async function borrarModulo(modulo) {
    if (!window.confirm(`¿Eliminar el módulo ${modulo.nombre}?`)) return
    setError('')
    try {
      await eliminarModulo(modulo.id)
      cargarTodo()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el módulo')
    }
  }

  // ---------- Tareas ----------
  function abrirNuevaTarea(moduloId) {
    setModuloDeLaTarea(moduloId)
    setEditandoTareaId(null)
    setFormTarea(formTareaVacio)
  }

  function editarTarea(moduloId, tarea) {
    setModuloDeLaTarea(moduloId)
    setEditandoTareaId(tarea.id)
    setFormTarea({ nombre: tarea.nombre, descripcion: tarea.descripcion || '', estado: tarea.estado })
  }

  function cerrarFormTarea() {
    setModuloDeLaTarea(null)
    setEditandoTareaId(null)
    setFormTarea(formTareaVacio)
  }

  async function guardarTarea(e) {
    e.preventDefault()
    setError('')
    const datos = {
      moduloId: moduloDeLaTarea,
      nombre: formTarea.nombre.trim(),
      descripcion: formTarea.descripcion.trim() || null,
      estado: formTarea.estado,
    }
    try {
      if (editandoTareaId) {
        await actualizarTarea(editandoTareaId, datos)
      } else {
        await crearTarea(datos)
      }
      cerrarFormTarea()
      cargarTodo()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la tarea')
    }
  }

  async function borrarTarea(tarea) {
    if (!window.confirm(`¿Eliminar la tarea ${tarea.nombre}?`)) return
    setError('')
    try {
      await eliminarTarea(tarea.id)
      cargarTodo()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la tarea')
    }
  }

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}

      {modulos.length === 0 && (
        <p className="text-muted">Este proyecto todavía no tiene módulos. Creá el primero abajo.</p>
      )}

      {modulos.map((m) => (
        <div key={m.id} className="card mb-3">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-diagram-3 me-2 text-muted"></i>
              <strong>{m.nombre}</strong>
              {m.descripcion && <span className="text-muted small ms-2">{m.descripcion}</span>}
            </div>
            <div>
              <button className="btn btn-sm btn-primary" onClick={() => abrirNuevaTarea(m.id)}>
                <i className="bi bi-plus-lg me-1"></i>Tarea
              </button>
              <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => editarModulo(m)}>Editar</button>
              <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => borrarModulo(m)}>Eliminar</button>
            </div>
          </div>

          <div className="card-body">
            {/* Formulario de tarea, solo dentro del módulo elegido */}
            {moduloDeLaTarea === m.id && (
              <form onSubmit={guardarTarea} className="border rounded p-3 mb-3 bg-light">
                <div className="row g-2 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label small">Nombre de la tarea *</label>
                    <input className="form-control form-control-sm" value={formTarea.nombre} onChange={(e) => setFormTarea({ ...formTarea, nombre: e.target.value })} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small">Descripción</label>
                    <input className="form-control form-control-sm" value={formTarea.descripcion} onChange={(e) => setFormTarea({ ...formTarea, descripcion: e.target.value })} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small">Estado</label>
                    <select className="form-select form-select-sm" value={formTarea.estado} onChange={(e) => setFormTarea({ ...formTarea, estado: e.target.value })}>
                      {ESTADOS_TAREA.map((estado) => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2 d-flex gap-1">
                    <button type="submit" className="btn btn-sm btn-primary">{editandoTareaId ? 'Guardar' : 'Agregar'}</button>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={cerrarFormTarea}>Cancelar</button>
                  </div>
                </div>
              </form>
            )}

            {(tareasPorModulo[m.id] || []).length === 0 ? (
              <p className="text-muted small mb-0">Este módulo todavía no tiene tareas.</p>
            ) : (
              <table className="table table-sm table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Tarea</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tareasPorModulo[m.id].map((t) => (
                    <tr key={t.id}>
                      <td>{t.nombre}</td>
                      <td className="text-muted">{t.descripcion}</td>
                      <td><span className={`badge ${COLOR_ESTADO_TAREA[t.estado]}`}>{t.estado}</span></td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-dark" onClick={() => setTareaDetalle(t)}>
                          <i className="bi bi-search me-1"></i>Detalle
                        </button>
                        <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => editarTarea(m.id, t)}>Editar</button>
                        <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => borrarTarea(t)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
                        {tareaDetalle && tareaDetalle.modulo?.id === m.id && (
              <EstimacionTarea tarea={tareaDetalle} onCerrar={() => setTareaDetalle(null)} />
            )}
          </div>
        </div>
      ))}

    

      {/* Crear o editar módulo */}
      <div className="card mt-4">
        <div className="card-body">
          <h6 className="card-title">{editandoModuloId ? 'Editar módulo' : 'Nuevo módulo'}</h6>
          <form onSubmit={guardarModulo}>
            <div className="row g-2 align-items-end">
              <div className="col-md-4">
                <label className="form-label small">Nombre *</label>
                <input className="form-control" value={formModulo.nombre} onChange={(e) => setFormModulo({ ...formModulo, nombre: e.target.value })} required />
              </div>
              <div className="col-md-5">
                <label className="form-label small">Descripción</label>
                <input className="form-control" value={formModulo.descripcion} onChange={(e) => setFormModulo({ ...formModulo, descripcion: e.target.value })} />
              </div>
              <div className="col-md-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary">{editandoModuloId ? 'Guardar' : 'Crear módulo'}</button>
                {editandoModuloId && (
                  <button type="button" className="btn btn-secondary" onClick={() => { setEditandoModuloId(null); setFormModulo(formModuloVacio) }}>Cancelar</button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModulosYTareas