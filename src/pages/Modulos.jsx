import { useEffect, useState } from 'react'
import { listarProyectos } from '../api/proyectos'
import { listarModulos, crearModulo, actualizarModulo, eliminarModulo } from '../api/modulos'

const formVacio = { nombre: '', descripcion: '' }

function Modulos() {
  const [proyectos, setProyectos] = useState([])
  const [proyectoId, setProyectoId] = useState('')
  const [modulos, setModulos] = useState([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')

  // Al abrir la pantalla: cargar los proyectos para el desplegable
  useEffect(() => {
    listarProyectos()
      .then(setProyectos)
      .catch(() => setError('No se pudieron cargar los proyectos'))
  }, [])

  // Cada vez que cambia el proyecto elegido: cargar sus módulos
  useEffect(() => {
    limpiarFormulario()
    if (proyectoId) {
      cargarModulos()
    } else {
      setModulos([])
    }
  }, [proyectoId])

  function cargarModulos() {
    listarModulos(proyectoId)
      .then(setModulos)
      .catch(() => setError('No se pudieron cargar los módulos'))
  }

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    const datos = {
      proyectoId: Number(proyectoId),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
    }
    try {
      if (editandoId) {
        await actualizarModulo(editandoId, datos)
      } else {
        await crearModulo(datos)
      }
      limpiarFormulario()
      cargarModulos()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el módulo')
    }
  }

  function editar(modulo) {
    setEditandoId(modulo.id)
    setForm({ nombre: modulo.nombre, descripcion: modulo.descripcion || '' })
  }

  function limpiarFormulario() {
    setForm(formVacio)
    setEditandoId(null)
  }

  async function eliminar(modulo) {
    if (!window.confirm(`¿Eliminar el módulo ${modulo.nombre}?`)) return
    setError('')
    try {
      await eliminarModulo(modulo.id)
      cargarModulos()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el módulo')
    }
  }

  return (
    <div>
      <h2>Módulos</h2>

      <div>
        <label>Proyecto </label>
        <select value={proyectoId} onChange={(e) => setProyectoId(e.target.value)}>
          <option value="">-- Elegí un proyecto --</option>
          {proyectos.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre} ({p.estado})</option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {proyectoId && (
        <>
          <h3>{editandoId ? 'Editar módulo' : 'Nuevo módulo'}</h3>
          <form onSubmit={manejarSubmit}>
            <div>
              <label>Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={manejarCambio} required />
            </div>
            <div>
              <label>Descripción</label>
              <input name="descripcion" value={form.descripcion} onChange={manejarCambio} />
            </div>
            <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear'}</button>
            {editandoId && <button type="button" onClick={limpiarFormulario}>Cancelar edición</button>}
          </form>

          <table border="1">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modulos.length === 0 && (
                <tr><td colSpan="3">Este proyecto no tiene módulos</td></tr>
              )}
              {modulos.map((m) => (
                <tr key={m.id}>
                  <td>{m.nombre}</td>
                  <td>{m.descripcion}</td>
                  <td>
                    <button onClick={() => editar(m)}>Editar</button>
                    <button onClick={() => eliminar(m)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default Modulos