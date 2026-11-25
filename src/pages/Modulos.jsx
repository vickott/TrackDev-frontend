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
      <h2 className="mb-4">Módulos</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <label htmlFor="proyectoId" className="form-label">Proyecto</label>
          <select id="proyectoId" className="form-select" value={proyectoId} onChange={(e) => setProyectoId(e.target.value)}>
            <option value="">-- Elegí un proyecto --</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.estado})</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {proyectoId && (
        <>
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">{editandoId ? 'Editar módulo' : 'Nuevo módulo'}</h5>
              <form onSubmit={manejarSubmit}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label htmlFor="nombre" className="form-label">Nombre *</label>
                    <input id="nombre" name="nombre" className="form-control" value={form.nombre} onChange={manejarCambio} required />
                  </div>
                  <div className="col-md-8">
                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                    <input id="descripcion" name="descripcion" className="form-control" value={form.descripcion} onChange={manejarCambio} />
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
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {modulos.length === 0 && (
                    <tr><td colSpan="3" className="text-center text-muted">Este proyecto no tiene módulos</td></tr>
                  )}
                  {modulos.map((m) => (
                    <tr key={m.id}>
                      <td>{m.nombre}</td>
                      <td>{m.descripcion}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => editar(m)}>Editar</button>
                        <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => eliminar(m)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Modulos