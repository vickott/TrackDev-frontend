import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarClientes, crearCliente, actualizarCliente, desactivarCliente } from '../api/clientes'

const formVacio = {
  razonSocial: '',
  cuit: '',
  contactoNombre: '',
  contactoEmail: '',
  contactoTelefono: '',
}

function Clientes() {
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function cargarClientes() {
    listarClientes()
      .then(setClientes)
      .catch(() => setError('No se pudieron cargar los clientes'))
  }

  useEffect(() => {
    cargarClientes()
  }, [])

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    // Los campos vacíos se mandan como null (si no, dos clientes sin CUIT chocarían en la base)
    const datos = Object.fromEntries(
      Object.entries(form).map(([campo, valor]) => [campo, valor.trim() === '' ? null : valor.trim()])
    )
    try {
      if (editandoId) {
        await actualizarCliente(editandoId, datos)
      } else {
        await crearCliente(datos)
      }
      cerrarFormulario()
      cargarClientes()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el cliente')
    }
  }

  function nuevoCliente() {
    setEditandoId(null)
    setForm(formVacio)
    setMostrarFormulario(true)
  }

  function editar(cliente) {
    setEditandoId(cliente.id)
    setForm({
      razonSocial: cliente.razonSocial,
      cuit: cliente.cuit || '',
      contactoNombre: cliente.contactoNombre || '',
      contactoEmail: cliente.contactoEmail || '',
      contactoTelefono: cliente.contactoTelefono || '',
    })
    setMostrarFormulario(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cerrarFormulario() {
    setForm(formVacio)
    setEditandoId(null)
    setMostrarFormulario(false)
  }

  async function desactivar(cliente) {
    if (!window.confirm(`¿Desactivar a ${cliente.razonSocial}?`)) return
    setError('')
    try {
      await desactivarCliente(cliente.id)
      cargarClientes()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo desactivar el cliente')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Clientes</h2>
        {!mostrarFormulario && (
          <button className="btn btn-primary" onClick={nuevoCliente}>
            <i className="bi bi-plus-lg me-1"></i>Nuevo cliente
          </button>
        )}
      </div>

      {mostrarFormulario && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">{editandoId ? 'Editar cliente' : 'Nuevo cliente'}</h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={cerrarFormulario}></button>
            </div>
            <form onSubmit={manejarSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="razonSocial" className="form-label">Razón social *</label>
                  <input id="razonSocial" name="razonSocial" className="form-control" value={form.razonSocial} onChange={manejarCambio} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="cuit" className="form-label">CUIT</label>
                  <input id="cuit" name="cuit" className="form-control" value={form.cuit} onChange={manejarCambio} />
                </div>
                <div className="col-md-4">
                  <label htmlFor="contactoNombre" className="form-label">Contacto</label>
                  <input id="contactoNombre" name="contactoNombre" className="form-control" value={form.contactoNombre} onChange={manejarCambio} />
                </div>
                <div className="col-md-4">
                  <label htmlFor="contactoEmail" className="form-label">Email</label>
                  <input id="contactoEmail" type="email" name="contactoEmail" className="form-control" value={form.contactoEmail} onChange={manejarCambio} />
                </div>
                <div className="col-md-4">
                  <label htmlFor="contactoTelefono" className="form-label">Teléfono</label>
                  <input id="contactoTelefono" name="contactoTelefono" className="form-control" value={form.contactoTelefono} onChange={manejarCambio} />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-primary">{editandoId ? 'Guardar cambios' : 'Crear cliente'}</button>
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
                <th>Razón social</th>
                <th>CUIT</th>
                <th>Contacto</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 && (
                <tr><td colSpan="7" className="text-center text-muted">No hay clientes cargados</td></tr>
              )}
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td className="fw-semibold">{c.razonSocial}</td>
                  <td>{c.cuit}</td>
                  <td>{c.contactoNombre}</td>
                  <td>{c.contactoEmail}</td>
                  <td>{c.contactoTelefono}</td>
                  <td>
                    {c.activo
                      ? <span className="badge bg-success">Activo</span>
                      : <span className="badge bg-secondary">Inactivo</span>}
                  </td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-primary" onClick={() => navigate(`/proyectos?cliente=${c.id}`)}>
                      <i className="bi bi-folder2-open me-1"></i>Proyectos
                    </button>
                    <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => editar(c)}>Editar</button>
                    {c.activo && <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => desactivar(c)}>Desactivar</button>}
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

export default Clientes