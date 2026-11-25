import api from './client'

export async function listarAlertas() {
  const respuesta = await api.get('/alertas')
  return respuesta.data
}

export async function obtenerRentabilidad(proyectoId) {
  const respuesta = await api.get(`/reportes/proyectos/${proyectoId}/rentabilidad`)
  return respuesta.data
}

export async function obtenerDesvioProyecto(proyectoId) {
  const respuesta = await api.get(`/reportes/proyectos/${proyectoId}/desvio`)
  return respuesta.data
}

export async function obtenerDesvioTarea(tareaId) {
  const respuesta = await api.get(`/reportes/tareas/${tareaId}/desvio`)
  return respuesta.data
}