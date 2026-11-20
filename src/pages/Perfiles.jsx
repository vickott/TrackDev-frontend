import { useEffect, useState } from 'react'
import { listarPerfiles, crearPerfil, actualizarPerfil, desactivarPerfil } from '../api/perfiles'

const formVacio = { nombre: '', costoHora: '' }

function Perfiles() {
  const [perfiles, setPerfiles] = useState([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState(null)
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
      limpiarFormulario()
      cargarPerfiles()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el perfil')
    }
  }

  function editar(perfil) {
    setEditandoId(perfil.id)
    setForm({ nombre: perfil.nombre, costoHora: perfil.costoHora })
  }

  function limpiarFormulario() {
    setForm(formVacio)
    setEditandoId(null)
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
      <h2>Perfiles de desarrollador</h2>

      <h3>{editandoId ? 'Editar perfil' : 'Nuevo perfil'}</h3>
      <form onSubmit={manejarSubmit}>
        <div>
          <label>Nombre *</label>
          <input name="nombre" value={form.nombre} onChange={manejarCambio} required />
        </div>
        <div>
          <label>Costo por hora *</label>
          <input type="number" step="0.01" min="0.01" name="costoHora" value={form.costoHora} onChange={manejarCambio} required />
        </div>
        <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear'}</button>
        {editandoId && <button type="button" onClick={limpiarFormulario}>Cancelar edición</button>}
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Costo/hora</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {perfiles.length === 0 && (
            <tr><td colSpan="4">No hay perfiles cargados</td></tr>
          )}
          {perfiles.map((p) => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.costoHora}</td>
              <td>{p.activo ? 'Sí' : 'No'}</td>
              <td>
                <button onClick={() => editar(p)}>Editar</button>
                {p.activo && <button onClick={() => desactivar(p)}>Desactivar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Perfiles