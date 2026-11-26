import api from './client'

export async function obtenerEstimacion(tareaId) {
  const respuesta = await api.get(`/tareas/${tareaId}/estimacion`)
  return respuesta.data
}

export async function crearEstimacion(tareaId, estimacion) {
  const respuesta = await api.post(`/tareas/${tareaId}/estimacion`, estimacion)
  return respuesta.data
}

export async function actualizarEstimacion(tareaId, estimacion) {
  const respuesta = await api.put(`/tareas/${tareaId}/estimacion`, estimacion)
  return respuesta.data
}

export async function eliminarEstimacion(tareaId) {
  await api.delete(`/tareas/${tareaId}/estimacion`)
}