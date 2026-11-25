import api from './client'

export async function listarTareas(moduloId) {
  const respuesta = await api.get('/tareas', { params: { moduloId } })
  return respuesta.data
}

export async function crearTarea(tarea) {
  const respuesta = await api.post('/tareas', tarea)
  return respuesta.data
}

export async function actualizarTarea(id, tarea) {
  const respuesta = await api.put(`/tareas/${id}`, tarea)
  return respuesta.data
}

export async function eliminarTarea(id) {
  await api.delete(`/tareas/${id}`)
}

export async function listarTareasDisponibles() {
  const respuesta = await api.get('/tareas/disponibles')
  return respuesta.data
}