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
      <h2>Usuarios</h2>

      <h3>Nuevo usuario</h3>
      <form onSubmit={manejarSubmit}>
        <div>
          <label>Nombre *</label>
          <input name="nombre" value={form.nombre} onChange={manejarCambio} required />
        </div>
        <div>
          <label>Apellido *</label>
          <input name="apellido" value={form.apellido} onChange={manejarCambio} required />
        </div>
        <div>
          <label>Email *</label>
          <input type="email" name="email" value={form.email} onChange={manejarCambio} required />
        </div>
        <div>
          <label>Contraseña * (mínimo 8 caracteres)</label>
          <input type="password" name="password" value={form.password} onChange={manejarCambio} minLength={8} required />
        </div>
        <div>
          <label>Rol *</label>
          <select name="rol" value={form.rol} onChange={manejarCambio}>
            <option value="OPERADOR">OPERADOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
        <div>
          <label>Perfil {form.rol === 'OPERADOR' && '*'}</label>
          <select name="perfilId" value={form.perfilId} onChange={manejarCambio} required={form.rol === 'OPERADOR'}>
            <option value="">-- Sin perfil --</option>
            {perfiles.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} (${p.costoHora}/h)</option>
            ))}
          </select>
        </div>
        <button type="submit">Crear</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Perfil</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre} {u.apellido}</td>
              <td>{u.email}</td>
              <td>{u.rol}</td>
              <td>{u.perfil?.nombre}</td>
              <td>{u.activo ? 'Sí' : 'No'}</td>
              <td>
                {u.activo && u.id !== usuarioActual?.id && (
                  <button onClick={() => desactivar(u)}>Desactivar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Usuarios