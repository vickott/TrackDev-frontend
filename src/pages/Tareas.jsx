import { useEffect, useState } from 'react'
import { listarProyectos } from '../api/proyectos'
import { listarModulos } from '../api/modulos'
import { listarTareas, crearTarea, actualizarTarea, eliminarTarea } from '../api/tareas'
import EstimacionTarea from '../components/EstimacionTarea'

const formVacio = { nombre: '', descripcion: '', estado: 'PENDIENTE' }
const ESTADOS = ['PENDIENTE', 'EN_CURSO', 'FINALIZADA']

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
      <h2>Tareas</h2>

      <div>
        <label>Proyecto </label>
        <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)}>
          <option value="">-- Elegí un proyecto --</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} ({p.estado})</option>
          ))}
        </select>
      </div>

      {proyectoId && (
        <div>
          <label>Módulo </label>
          <select value={moduloId} onChange={(e) => setModuloId(e.target.value)}>
            <option value="">-- Elegí un módulo --</option>
            {modulos.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {moduloId && (
        <>
          <h3>{editandoId ? 'Editar tarea' : 'Nueva tarea'}</h3>
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
              <label>Estado</label>
              <select name="estado" value={form.estado} onChange={manejarCambio}>
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>
            <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear'}</button>
            {editandoId && <button type="button" onClick={limpiarFormulario}>Cancelar edición</button>}
          </form>

          <table border="1">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareas.length === 0 && (
                <tr><td colSpan="4">Este módulo no tiene tareas</td></tr>
              )}
              {tareas.map((t) => (
                <tr key={t.id}>
                  <td>{t.nombre}</td>
                  <td>{t.descripcion}</td>
                  <td>{t.estado}</td>
                  <td>
                    <button onClick={() => editar(t)}>Editar</button>
                    <button onClick={() => eliminar(t)}>Eliminar</button>
                    <button onClick={() => setTareaEstimando(t)}>Estimación</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tareaEstimando && (
            <EstimacionTarea tarea={tareaEstimando} onCerrar={() => setTareaEstimando(null)} />
          )}
        </>
      )}
    </div>
  )
}

export default Tareas