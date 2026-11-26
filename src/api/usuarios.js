import api from './client'

export async function listarUsuarios() {
  const respuesta = await api.get('/usuarios')
  return respuesta.data
}

export async function crearUsuario(usuario) {
  const respuesta = await api.post('/usuarios', usuario)
  return respuesta.data
}

export async function desactivarUsuario(id) {
  await api.delete(`/usuarios/${id}`)
}