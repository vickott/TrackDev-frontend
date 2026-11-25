import api from './client'

export async function listarProyectos() {
  const respuesta = await api.get('/proyectos')
  return respuesta.data
}

export async function crearProyecto(proyecto) {
  const respuesta = await api.post('/proyectos', proyecto)
  return respuesta.data
}

export async function actualizarProyecto(id, proyecto) {
  const respuesta = await api.put(`/proyectos/${id}`, proyecto)
  return respuesta.data
}

export async function cancelarProyecto(id) {
  await api.patch(`/proyectos/${id}/cancelar`)
}

export async function obtenerProyecto(id) {
  const respuesta = await api.get(`/proyectos/${id}`)
  return respuesta.data
}