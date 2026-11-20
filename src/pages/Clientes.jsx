import { useEffect, useState } from 'react'
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
  const [error, setError] = useState('')

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
      cancelar()
      cargarClientes()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el cliente')
    }
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
  }

  function cancelar() {
    setForm(formVacio)
    setEditandoId(null)
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
      <h2>Clientes</h2>

      <h3>{editandoId ? 'Editar cliente' : 'Nuevo cliente'}</h3>
      <form onSubmit={manejarSubmit}>
        <div>
          <label>Razón social *</label>
          <input name="razonSocial" value={form.razonSocial} onChange={manejarCambio} required />
        </div>
        <div>
          <label>CUIT</label>
          <input name="cuit" value={form.cuit} onChange={manejarCambio} />
        </div>
        <div>
          <label>Contacto</label>
          <input name="contactoNombre" value={form.contactoNombre} onChange={manejarCambio} />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="contactoEmail" value={form.contactoEmail} onChange={manejarCambio} />
        </div>
        <div>
          <label>Teléfono</label>
          <input name="contactoTelefono" value={form.contactoTelefono} onChange={manejarCambio} />
        </div>
        <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear'}</button>
        {editandoId && <button type="button" onClick={cancelar}>Cancelar</button>}
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1">
        <thead>
          <tr>
            <th>Razón social</th>
            <th>CUIT</th>
            <th>Contacto</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length === 0 && (
            <tr><td colSpan="7">No hay clientes cargados</td></tr>
          )}
          {clientes.map((c) => (
            <tr key={c.id}>
              <td>{c.razonSocial}</td>
              <td>{c.cuit}</td>
              <td>{c.contactoNombre}</td>
              <td>{c.contactoEmail}</td>
              <td>{c.contactoTelefono}</td>
              <td>{c.activo ? 'Sí' : 'No'}</td>
              <td>
                <button onClick={() => editar(c)}>Editar</button>
                {c.activo && <button onClick={() => desactivar(c)}>Desactivar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Clientes