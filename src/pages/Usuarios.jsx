import { useEffect, useState } from 'react'
import { listarUsuarios, crearUsuario, desactivarUsuario } from '../api/usuarios'
import { listarPerfiles } from '../api/perfiles'

const formVacio = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  rol: 'OPERADOR',
  perfilId: '',
}

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [perfiles, setPerfiles] = useState([])
  const [form, setForm] = useState(formVacio)
  const [error, setError] = useState('')

  // El usuario logueado, para no dejar que se desactive a sí mismo
  const usuarioActual = JSON.parse(localStorage.getItem('usuario'))

  function cargarUsuarios() {
    listarUsuarios()
      .then(setUsuarios)
      .catch(() => setError('No se pudieron cargar los usuarios'))
  }

  useEffect(() => {
    cargarUsuarios()
    listarPerfiles()
      .then((lista) => setPerfiles(lista.filter((p) => p.activo)))
      .catch(() => setError('No se pudieron cargar los perfiles'))
  }, [])

  function manejarCambio(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    const datos = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      email: form.email.trim(),
      password: form.password,
      rol: form.rol,
      perfilId: form.perfilId === '' ? null : Number(form.perfilId),
    }
    try {
      await crearUsuario(datos)
      setForm(formVacio)
      cargarUsuarios()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo crear el usuario')
    }
  }

  async function desactivar(usuario) {
    if (!window.confirm(`¿Desactivar a ${usuario.nombre} ${usuario.apellido}?`)) return
    setError('')
    try {
      await desactivarUsuario(usuario.id)
      cargarUsuarios()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo desactivar el usuario')
    }
  }

  return (
    <div>
      <h2 className="mb-4">Usuarios</h2>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Nuevo usuario</h5>
          <form onSubmit={manejarSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="nombre" className="form-label">Nombre *</label>
                <input id="nombre" name="nombre" className="form-control" value={form.nombre} onChange={manejarCambio} required />
              </div>
              <div className="col-md-4">
                <label htmlFor="apellido" className="form-label">Apellido *</label>
                <input id="apellido" name="apellido" className="form-control" value={form.apellido} onChange={manejarCambio} required />
              </div>
              <div className="col-md-4">
                <label htmlFor="email" className="form-label">Email *</label>
                <input id="email" type="email" name="email" className="form-control" value={form.email} onChange={manejarCambio} required />
              </div>
              <div className="col-md-4">
                <label htmlFor="password" className="form-label">Contraseña *</label>
                <input id="password" type="password" name="password" className="form-control" value={form.password} onChange={manejarCambio} minLength={8} required />
                <div className="form-text">Mínimo 8 caracteres.</div>
              </div>
              <div className="col-md-4">
                <label htmlFor="rol" className="form-label">Rol *</label>
                <select id="rol" name="rol" className="form-select" value={form.rol} onChange={manejarCambio}>
                  <option value="OPERADOR">OPERADOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="perfilId" className="form-label">Perfil {form.rol === 'OPERADOR' && '*'}</label>
                <select id="perfilId" name="perfilId" className="form-select" value={form.perfilId} onChange={manejarCambio} required={form.rol === 'OPERADOR'}>
                  <option value="">-- Sin perfil --</option>
                  {perfiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} (${p.costoHora}/h)</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary">Crear</button>
            </div>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Perfil</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.rol === 'ADMIN' ? 'bg-dark' : 'bg-info text-dark'}`}>{u.rol}</span>
                  </td>
                  <td>{u.perfil?.nombre}</td>
                  <td>
                    {u.activo
                      ? <span className="badge bg-success">Activo</span>
                      : <span className="badge bg-secondary">Inactivo</span>}
                  </td>
                  <td className="text-end">
                    {u.activo && u.id !== usuarioActual?.id && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => desactivar(u)}>Desactivar</button>
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

export default Usuarios