import api from './client'

export async function listarModulos(proyectoId) {
  const respuesta = await api.get('/modulos', { params: { proyectoId } })
  return respuesta.data
}

export async function crearModulo(modulo) {
  const respuesta = await api.post('/modulos', modulo)
  return respuesta.data
}

export async function actualizarModulo(id, modulo) {
  const respuesta = await api.put(`/modulos/${id}`, modulo)
  return respuesta.data
}

export async function eliminarModulo(id) {
  await api.delete(`/modulos/${id}`)
}