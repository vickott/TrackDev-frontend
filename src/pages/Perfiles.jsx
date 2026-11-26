import { useEffect, useState } from 'react'
import { listarPerfiles, crearPerfil, actualizarPerfil, desactivarPerfil } from '../api/perfiles'

const formVacio = { nombre: '', costoHora: '' }

function Perfiles() {
  const [perfiles, setPerfiles] = useState([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [error, setError] = useState('')

  function cargarPerfiles() {
    listarPerfiles()
      .then(setPerfiles)
      .catch(() => setError('No se pudieron cargar los perfiles'))
  }

  useEffect(() => {
    cargarPerfiles()
  }, [])

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    const datos = { nombre: form.nombre.trim(), costoHora: Number(form.costoHora) }
    try {
      if (editandoId) {
        await actualizarPerfil(editandoId, datos)
      } else {
        await crearPerfil(datos)
      }
      cerrarFormulario()
      cargarPerfiles()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el perfil')
    }
  }

  function nuevoPerfil() {
    setEditandoId(null)
    setForm(formVacio)
    setMostrarFormulario(true)
  }

  function editar(perfil) {
    setEditandoId(perfil.id)
    setForm({ nombre: perfil.nombre, costoHora: perfil.costoHora })
    setMostrarFormulario(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cerrarFormulario() {
    setForm(formVacio)
    setEditandoId(null)
    setMostrarFormulario(false)
  }

  async function desactivar(perfil) {
    if (!window.confirm(`¿Desactivar el perfil ${perfil.nombre}?`)) return
    setError('')
    try {
      await desactivarPerfil(perfil.id)
      cargarPerfiles()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo desactivar el perfil')
    }
  }

  return (
    <div>
      {!mostrarFormulario && (
        <div className="d-flex justify-content-end mb-3">
          <button className="btn btn-primary" onClick={nuevoPerfil}>
            <i className="bi bi-plus-lg me-1"></i>Nuevo perfil
          </button>
        </div>
      )}

      {mostrarFormulario && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">{editandoId ? 'Editar perfil' : 'Nuevo perfil'}</h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={cerrarFormulario}></button>
            </div>
            <form onSubmit={manejarSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="nombre" className="form-label">Nombre *</label>
                  <input id="nombre" name="nombre" className="form-control" value={form.nombre} onChange={manejarCambio} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="costoHora" className="form-label">Costo por hora *</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input id="costoHora" type="number" step="0.01" min="0.01" name="costoHora" className="form-control" value={form.costoHora} onChange={manejarCambio} required />
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-primary">{editandoId ? 'Guardar cambios' : 'Crear perfil'}</button>
                <button type="button" className="btn btn-secondary ms-2" onClick={cerrarFormulario}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Costo/hora</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {perfiles.length === 0 && (
                <tr><td colSpan="4" className="text-center text-muted">No hay perfiles cargados</td></tr>
              )}
              {perfiles.map((p) => (
                <tr key={p.id}>
                  <td className="fw-semibold">{p.nombre}</td>
                  <td>${p.costoHora}</td>
                  <td>
                    {p.activo
                      ? <span className="badge bg-success">Activo</span>
                      : <span className="badge bg-secondary">Inactivo</span>}
                  </td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => editar(p)}>Editar</button>
                    {p.activo && <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => desactivar(p)}>Desactivar</button>}
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

export default Perfiles