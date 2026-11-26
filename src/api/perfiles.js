import api from './client'

export async function listarPerfiles() {
  const respuesta = await api.get('/perfiles')
  return respuesta.data
}

export async function crearPerfil(perfil) {
  const respuesta = await api.post('/perfiles', perfil)
  return respuesta.data
}

export async function actualizarPerfil(id, perfil) {
  const respuesta = await api.put(`/perfiles/${id}`, perfil)
  return respuesta.data
}

export async function desactivarPerfil(id) {
  await api.delete(`/perfiles/${id}`)
}